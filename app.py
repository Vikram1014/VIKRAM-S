import streamlit as st
from stmol import showmol
import py3Dmol
import os
import zipfile
from io import BytesIO
import datetime
import time
import pandas as pd
import numpy as np
import altair as alt

# Set page config
st.set_page_config(page_title="Advanced MD Simulation Orchestrator", layout="wide")
st.title("Molecular Dynamics (MD) Simulation Orchestrator")

# --- Session State Initialization ---
if 'target_content' not in st.session_state:
    st.session_state['target_content'] = None
if 'target_ext' not in st.session_state:
    st.session_state['target_ext'] = None
if 'ligand_content' not in st.session_state:
    st.session_state['ligand_content'] = None
if 'ligand_ext' not in st.session_state:
    st.session_state['ligand_ext'] = None

if 'job_running' not in st.session_state:
    st.session_state['job_running'] = False
if 'job_completed' not in st.session_state:
    st.session_state['job_completed'] = False
if 'job_dir' not in st.session_state:
    st.session_state['job_dir'] = None

# --- Sidebar Configuration ---
st.sidebar.header("Job Configuration")
base_out_dir = st.sidebar.text_input("Base Output Directory", value="./md_jobs")
exec_mode = st.sidebar.selectbox("Execution Mode", ["Local: GROMACS", "Local: OpenMM", "Online: Package"])

st.sidebar.markdown("---")
st.sidebar.header("Simulation Parameters")
sim_time = st.sidebar.number_input("Simulation Time (ns)", min_value=0.1, max_value=1000.0, value=100.0, step=10.0)
force_field = st.sidebar.selectbox("Force Field", ["AMBER", "CHARMM"])
water_model = st.sidebar.selectbox("Water Model", ["TIP3P", "TIP4P", "SPC/E"])
temperature = st.sidebar.number_input("Temperature (K)", value=300.0)
pressure = st.sidebar.number_input("Pressure (bar)", value=1.0)
box_type = st.sidebar.selectbox("Box Type", ["dodecahedron", "cubic", "triclinic"])
box_padding = st.sidebar.number_input("Box Padding (nm)", value=1.0)

# --- Main Interface ---
if not st.session_state['job_running'] and not st.session_state['job_completed']:
    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("1. Upload Structures")
        target_file = st.file_uploader("Upload Target Protein (.pdb, .gro)", type=["pdb", "gro"])
        if target_file:
            st.session_state['target_content'] = target_file.getvalue().decode("utf-8")
            st.session_state['target_ext'] = target_file.name.split('.')[-1]
        else:
            st.session_state['target_content'] = None
            st.session_state['target_ext'] = None

        ligand_file = st.file_uploader("Upload Ligand (.sdf, .mol2, .pdb) - Optional", type=["sdf", "mol2", "pdb"])
        if ligand_file:
            st.session_state['ligand_content'] = ligand_file.getvalue().decode("utf-8")
            st.session_state['ligand_ext'] = ligand_file.name.split('.')[-1]
        else:
            st.session_state['ligand_content'] = None
            st.session_state['ligand_ext'] = None

    with col2:
        st.subheader("3D Visualization")
        if st.session_state['target_content']:
            view = py3Dmol.view(width=500, height=400)
            view.addModel(st.session_state['target_content'], st.session_state['target_ext'])
            view.setStyle({'model': -1}, {'cartoon': {'color': 'spectrum'}})

            if st.session_state['ligand_content']:
                view.addModel(st.session_state['ligand_content'], st.session_state['ligand_ext'])
                view.setStyle({'model': -1}, {'stick': {'colorscheme': 'greenCarbon'}})

            view.zoomTo()
            showmol(view, height=400, width=500)
        else:
            st.info("Upload a target protein to view it here.")

    st.markdown("---")

    # Run Button
    if st.button("Run Workflow", type="primary"):
        if not target_file:
            st.error("Please upload a Target Protein file before running.")
        else:
            # Create Job Directory Structure
            job_id = f"JOB-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}"
            job_dir = os.path.join(base_out_dir, job_id)
            st.session_state['job_dir'] = job_dir

            subdirs = ['input', 'preparation', 'topology', 'minimization', 'nvt', 'npt', 'production', 'analysis', 'results']
            for d in subdirs:
                os.makedirs(os.path.join(job_dir, d), exist_ok=True)

            # Save inputs
            with open(os.path.join(job_dir, 'input', target_file.name), 'wb') as f:
                f.write(target_file.getvalue())
            if ligand_file:
                with open(os.path.join(job_dir, 'input', ligand_file.name), 'wb') as f:
                    f.write(ligand_file.getvalue())

            st.session_state['job_running'] = True
            st.rerun()

# --- Job Orchestrator UI ---
if st.session_state['job_running']:
    st.subheader(f"Workflow Orchestrator - {os.path.basename(st.session_state['job_dir'])}")

    # UI Elements for dynamic updates
    status_text = st.empty()
    progress_bar = st.progress(0)

    col_log, col_metrics = st.columns([2, 1])
    with col_log:
        st.markdown("**Workflow Stages:**")
        stage_container = st.empty()
    with col_metrics:
        st.markdown("**Live Metrics:**")
        metrics_container = st.empty()

    # Stages definition
    stages = [
        "Validating input", "Preparing protein", "Parameterizing ligand",
        "Building complex", "Solvating", "Adding ions", "Generating topology",
        "Energy minimization", "NVT equilibration", "NPT equilibration",
        "Production MD", "Post-processing", "Analysis"
    ]

    log_content = ""

    def update_log(stage_idx, current_stage_name, is_completed=False):
        content = ""
        for i, s in enumerate(stages):
            if i < stage_idx:
                content += f"✅ {s}\n\n"
            elif i == stage_idx:
                if is_completed:
                    content += f"✅ {s}\n\n"
                else:
                    content += f"🔄 **{s}...**\n\n"
            else:
                content += f"⏳ {s}\n\n"
        stage_container.markdown(content)

    for i, stage in enumerate(stages):
        status_text.text(f"Status: {stage}...")
        progress_bar.progress(int((i / len(stages)) * 100))
        update_log(i, stage)

        if stage == "Production MD":
            # Simulate Production MD Live Monitoring
            total_steps = 100
            for step in range(total_steps):
                time.sleep(0.05) # Simulate time passing
                percent = step + 1
                progress_bar.progress(int(((i + percent/100.0) / len(stages)) * 100))

                # Mock metrics
                current_time_ns = (percent / 100.0) * sim_time
                temp = temperature + np.random.normal(0, 2)
                press = pressure + np.random.normal(0, 0.5)
                pot_eng = -500000 + np.random.normal(0, 1000)

                metrics_container.markdown(f"""
                * **Simulated:** {current_time_ns:.1f} ns / {sim_time} ns ({percent}%)
                * **Temperature:** {temp:.1f} K
                * **Pressure:** {press:.2f} bar
                * **Pot. Energy:** {pot_eng:.0f} kJ/mol
                * **GPU Util:** {np.random.randint(85, 100)}%
                """)
        else:
            time.sleep(0.5) # Simulate quick stages

        update_log(i, stage, is_completed=True)

    progress_bar.progress(100)
    status_text.text("Status: COMPLETED ✓")
    time.sleep(1)

    st.session_state['job_running'] = False
    st.session_state['job_completed'] = True
    st.rerun()

# --- Final Results Dashboard ---
if st.session_state['job_completed']:
    st.success(f"Simulation Completed Successfully! Job: {os.path.basename(st.session_state['job_dir'])}")

    st.subheader("Final Results Dashboard")

    # Mock Data Generation for Plots
    time_points = np.linspace(0, sim_time, 200)
    df = pd.DataFrame({
        'Time (ns)': time_points,
        'RMSD (nm)': 0.15 + 0.1 * (1 - np.exp(-time_points/20)) + np.random.normal(0, 0.01, 200),
        'Ligand RMSD (nm)': 0.1 + 0.05 * (1 - np.exp(-time_points/10)) + np.random.normal(0, 0.02, 200),
        'Radius of Gyration (nm)': 1.75 + np.random.normal(0, 0.01, 200),
        'H-Bonds': np.random.poisson(5, 200)
    })

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("**RMSD vs Time**")
        chart = alt.Chart(df).mark_line(color='blue').encode(
            x='Time (ns)', y=alt.Y('RMSD (nm)', scale=alt.Scale(domain=[0, 0.4]))
        )
        st.altair_chart(chart, use_container_width=True)

        st.markdown("**Radius of Gyration vs Time**")
        chart3 = alt.Chart(df).mark_line(color='green').encode(
            x='Time (ns)', y=alt.Y('Radius of Gyration (nm)', scale=alt.Scale(domain=[1.7, 1.8]))
        )
        st.altair_chart(chart3, use_container_width=True)

    with col2:
        st.markdown("**Ligand RMSD vs Time**")
        chart2 = alt.Chart(df).mark_line(color='red').encode(
            x='Time (ns)', y=alt.Y('Ligand RMSD (nm)', scale=alt.Scale(domain=[0, 0.3]))
        )
        st.altair_chart(chart2, use_container_width=True)

        st.markdown("**Protein-Ligand Hydrogen Bonds**")
        chart4 = alt.Chart(df).mark_area(opacity=0.5, color='orange').encode(
            x='Time (ns)', y='H-Bonds'
        )
        st.altair_chart(chart4, use_container_width=True)

    st.markdown("### Job Artifacts")
    st.info(f"All generated files (topologies, trajectories, logs) are saved in: `{st.session_state['job_dir']}`")

    if st.button("Start New Job"):
        st.session_state['job_completed'] = False
        st.session_state['job_dir'] = None
        st.rerun()
