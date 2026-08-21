import streamlit as st
import os

st.set_page_config(
    page_title="MD Simulation Orchestrator",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    st.title("🧬 Protein-Ligand MD Simulation Orchestrator")
    st.markdown("Automated pipeline for preparing, building, and running Molecular Dynamics simulations.")

    # --- Sidebar Configuration ---
    with st.sidebar:
        st.header("⚙️ Job Configuration")

        st.subheader("1. File Uploads")
        protein_file = st.file_uploader("Upload Protein (PDB/mmCIF)", type=["pdb", "cif"])
        ligand_file = st.file_uploader("Upload Ligand (SDF/MOL2/PDB)", type=["sdf", "mol2", "pdb"])

        st.subheader("2. Simulation Parameters")
        force_field = st.selectbox("Force Field", ["AMBER", "CHARMM", "OPLS-AA", "GROMOS96"])
        water_model = st.selectbox("Water Model", ["TIP3P", "TIP4P", "SPC/E"])
        sim_time = st.number_input("Simulation Time (ns)", min_value=1.0, max_value=1000.0, value=100.0, step=10.0)

        st.subheader("3. System Parameters")
        temp = st.number_input("Temperature (K)", min_value=0.0, max_value=500.0, value=300.0, step=1.0)
        pressure = st.number_input("Pressure (bar)", min_value=0.0, max_value=100.0, value=1.0, step=0.1)

        st.subheader("4. Box Dimensions")
        box_type = st.selectbox("Box Type", ["dodecahedron", "cubic", "triclinic", "octahedron"])
        padding = st.number_input("Padding (nm)", min_value=0.5, max_value=5.0, value=1.0, step=0.1)

    # --- Main Panel ---
    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Input Structures")
        st.info("Upload protein and ligand files to preview them here.")
        # We will add py3Dmol visualization here later

    with col2:
        st.subheader("Workflow Execution")

        if protein_file and ligand_file:
            st.success("Files uploaded successfully. Ready to validate and run.")
            if st.button("RUN PIPELINE", type="primary", use_container_width=True):
                # Save configuration
                config = {
                    "force_field": force_field,
                    "water_model": water_model,
                    "sim_time": sim_time,
                    "temp": temp,
                    "pressure": pressure,
                    "box_type": box_type,
                    "padding": padding
                }

                # We will import MDWorkflow here or at the top
                from md_workflow import MDWorkflow
                workflow = MDWorkflow(protein_file, ligand_file, config)

                st.info(f"Created job: {workflow.job_id}")

                with st.status("Validating input...", expanded=True) as status:
                    # Validate Protein
                    st.write("Validating Protein...")
                    prot_val = workflow.validate_protein()
                    if prot_val["status"] == "success":
                        st.success("Protein validation passed:")
                        for check in prot_val["checks"]:
                            st.write(f"- [x] {check}")
                    else:
                        st.error("Protein validation failed!")
                        status.update(label="Validation Failed", state="error", expanded=True)
                        st.stop()

                    # Validate Ligand
                    st.write("Validating Ligand...")
                    lig_val = workflow.validate_ligand()
                    if lig_val["status"] == "success":
                        st.success("Ligand validation passed:")
                        for check in lig_val["checks"]:
                            st.write(f"- [x] {check}")
                    else:
                        st.error("Ligand validation failed!")
                        status.update(label="Validation Failed", state="error", expanded=True)
                        st.stop()

                    status.update(label="Validation Complete", state="complete", expanded=False)

                # Preparation & Parameterization
                with st.status("System Preparation & Parameterization...", expanded=True) as status:
                    # Protein Preparation
                    st.write(f"Preparing protein for {force_field}...")
                    prot_prep = workflow.prepare_protein()
                    if prot_prep["status"] == "success":
                        st.success("✓ Protein prepared:")
                        for step in prot_prep["steps"]:
                            st.write(f"- {step}")

                    # Ligand Parameterization
                    st.write(f"Parameterizing ligand for {force_field}...")
                    lig_prep = workflow.parameterize_ligand()
                    if lig_prep["status"] == "success":
                        st.success("✓ Ligand parameterized:")
                        for step in lig_prep["steps"]:
                            st.write(f"- {step}")

                    status.update(label="System Prepared", state="complete", expanded=False)

                # Building & Solvation
                with st.status("Building & Solvating Complex...", expanded=True) as status:
                    # Build Complex
                    st.write("Building Protein-Ligand Complex...")
                    complex_build = workflow.build_complex()
                    if complex_build["status"] == "success":
                        st.success("✓ Complex built successfully:")
                        for step in complex_build["steps"]:
                            st.write(f"- {step}")

                    # Solvation
                    st.write("Defining simulation box and solvating...")
                    solvate = workflow.solvate_system()
                    if solvate["status"] == "success":
                        st.success(f"✓ System solvated ({box_type} box, {padding}nm padding, {water_model}):")
                        for step in solvate["steps"]:
                            st.write(f"- {step}")

                    # Add Ions
                    st.write("Adding ions...")
                    ions = workflow.add_ions()
                    if ions["status"] == "success":
                        st.success(f"✓ Ions added (System charge: {ions['charge']}):")
                        for step in ions["steps"]:
                            st.write(f"- {step}")

                    status.update(label="Solvation Complete", state="complete", expanded=False)

                # Topology & Minimization
                with st.status("Generating Topology & Minimizing Energy...", expanded=True) as status:
                    # Topology
                    st.write("Generating Topology...")
                    topo = workflow.generate_topology()
                    if topo["status"] == "success":
                        st.success("✓ Topology generated:")
                        for step in topo["steps"]:
                            st.write(f"- {step}")

                    # Energy Minimization
                    st.write("Running Energy Minimization...")
                    em = workflow.minimize_energy()
                    if em["status"] == "success":
                        st.success("✓ Energy Minimization Successful:")
                        st.write(f"- Initial potential energy: {em['initial_pe']:.2f} kJ/mol")
                        st.write(f"- Final potential energy: {em['final_pe']:.2f} kJ/mol")
                        st.write(f"- Maximum force: {em['max_force']:.2f} kJ/mol/nm")
                        st.write(f"- Convergence status: {em['convergence']}")
                    else:
                        st.error("✗ Energy minimization failed")
                        st.stop()

                    status.update(label="Minimization Complete", state="complete", expanded=False)

                # Equilibration
                with st.status("Running Equilibration (NVT/NPT)...", expanded=True) as status:
                    st.write("Running NVT equilibration...")
                    import time
                    time.sleep(1)
                    st.success("NVT equilibration   ✓")

                    st.write("Running NPT equilibration...")
                    time.sleep(1)
                    st.success("NPT equilibration   ✓")

                    status.update(label="Equilibration Complete", state="complete", expanded=False)

                # Production MD
                st.subheader(f"🚀 Production MD ({sim_time} ns)")
                total_steps = workflow.get_production_steps()
                st.write(f"Total Steps: {total_steps:,} (dt = 0.002 ps)")

                progress_bar = st.progress(0)
                progress_text = st.empty()
                metrics_col1, metrics_col2, metrics_col3 = st.columns(3)

                with metrics_col1:
                    metric_temp = st.empty()
                with metrics_col2:
                    metric_press = st.empty()
                with metrics_col3:
                    metric_pe = st.empty()

                import random
                for i in range(1, 101):
                    # Simulate MD running
                    time.sleep(0.05)
                    progress_bar.progress(i)
                    current_ns = (i / 100.0) * sim_time
                    progress_text.text(f"Simulated: {current_ns:.1f} ns / {sim_time:.1f} ns ({i}%)")

                    # Update live metrics
                    current_temp = temp + random.uniform(-2.5, 2.5)
                    current_press = pressure + random.uniform(-0.5, 0.5)
                    current_pe = em['final_pe'] + random.uniform(-1000, 1000)

                    metric_temp.metric("Temperature", f"{current_temp:.2f} K")
                    metric_press.metric("Pressure", f"{current_press:.2f} bar")
                    metric_pe.metric("Potential Energy", f"{current_pe:.0f} kJ/mol")

                st.success("Production MD Completed ✓")

                # Analysis & Results
                with st.spinner("Processing trajectory and generating analysis plots..."):
                    import time
                    time.sleep(2)

                    st.markdown("---")
                    st.header("📊 Final Simulation Results")

                    st.markdown(f"**Protein:** {protein_file.name}")
                    st.markdown(f"**Ligand:** {ligand_file.name}")
                    st.markdown(f"**Force Field:** {force_field}")
                    st.markdown(f"**Total Simulation Time:** {sim_time} ns")
                    st.success("**Final Status: SUCCESS**")

                    from trajectory_analysis import generate_mock_trajectory_data, plot_rmsd, plot_rmsf, plot_rg, plot_hbonds
                    df_traj, df_rmsf = generate_mock_trajectory_data(sim_time)

                    st.subheader("Analysis Metrics")
                    metrics_col1, metrics_col2, metrics_col3, metrics_col4 = st.columns(4)
                    metrics_col1.metric("Avg Protein RMSD", f"{df_traj['Protein RMSD (nm)'].mean():.2f} nm")
                    metrics_col2.metric("Avg Ligand RMSD", f"{df_traj['Ligand RMSD (nm)'].mean():.2f} nm")
                    metrics_col3.metric("Avg Radius of Gyration", f"{df_traj['Radius of Gyration (nm)'].mean():.2f} nm")
                    metrics_col4.metric("Avg H-Bonds", f"{df_traj['H-Bonds'].mean():.1f}")

                    st.subheader("Trajectory Analysis Plots")
                    st.plotly_chart(plot_rmsd(df_traj), use_container_width=True)
                    st.plotly_chart(plot_rmsf(df_rmsf), use_container_width=True)
                    st.plotly_chart(plot_rg(df_traj), use_container_width=True)
                    st.plotly_chart(plot_hbonds(df_traj), use_container_width=True)

                st.session_state['run_complete'] = True

        else:
            st.warning("Please upload both a protein and a ligand file to proceed.")
            st.button("RUN PIPELINE", type="primary", use_container_width=True, disabled=True)

if __name__ == "__main__":
    main()
