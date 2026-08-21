import streamlit as st
from stmol import showmol
import py3Dmol
import os
import zipfile
from io import BytesIO

# Set page config
st.set_page_config(page_title="MD Simulation GUI", layout="wide")
st.title("Molecular Dynamics (MD) Simulation Setup")

# Initialize session state for file contents
if 'target_content' not in st.session_state:
    st.session_state['target_content'] = None
if 'target_ext' not in st.session_state:
    st.session_state['target_ext'] = None
if 'ligand_content' not in st.session_state:
    st.session_state['ligand_content'] = None
if 'ligand_ext' not in st.session_state:
    st.session_state['ligand_ext'] = None
if 'zip_buffer' not in st.session_state:
    st.session_state['zip_buffer'] = None

# Sidebar Configuration
st.sidebar.header("Configuration")

# Output Directory
out_dir = st.sidebar.text_input("Output Directory", value="./md_output", help="Directory where simulation outputs will be saved or prepared.")

# Execution Mode
exec_mode = st.sidebar.selectbox("Execution Mode", [
    "Local: OpenMM",
    "Local: GROMACS",
    "Online: Package for Free Server (WebGRO/CHARMM-GUI)"
])

st.sidebar.markdown("---")

# Simulation Parameters
st.sidebar.header("Simulation Parameters")
sim_time = st.sidebar.number_input("Simulation Time (ns)", min_value=0.1, max_value=1000.0, value=10.0, step=0.1)
force_field = st.sidebar.selectbox("Force Field", ["AMBER", "CHARMM"])

# Main Interface
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Upload Structures")
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

def prepare_local_openmm(target, ligand, out_dir, time, ff):
    st.success(f"Preparing OpenMM simulation in {out_dir}")
    os.makedirs(out_dir, exist_ok=True)
    # Write mock script
    script_path = os.path.join(out_dir, "run_openmm.py")
    script_content = f"""# Mock OpenMM Script
# Target: {target.name}
# Force Field: {ff}
# Simulation Time: {time} ns
print("Running OpenMM simulation...")
"""
    with open(script_path, "w") as f:
        f.write(script_content)
    st.code(script_content, language='python')
    st.info("In a full implementation, this script would initialize OpenMM, parameterize the ligand, setup the system, and run the simulation.")

def prepare_local_gromacs(target, ligand, out_dir, time, ff):
    st.success(f"Preparing GROMACS simulation in {out_dir}")
    os.makedirs(out_dir, exist_ok=True)
    # Write mock script
    script_path = os.path.join(out_dir, "run_gromacs.sh")
    script_content = f"""#!/bin/bash
# Mock GROMACS Script
# Target: {target.name}
# Force Field: {ff}
# Simulation Time: {time} ns
echo "Running GROMACS simulation pipeline (pdb2gmx, editconf, solvate, grompp, mdrun)..."
"""
    with open(script_path, "w") as f:
        f.write(script_content)
    st.code(script_content, language='bash')
    st.info("In a full implementation, this bash script would execute the standard GROMACS workflow commands.")

def prepare_online_package(target, ligand, time, ff):
    st.success("Preparing files for Online Server Submission")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zf:
        zf.writestr(target.name, target.getvalue())
        if ligand:
            zf.writestr(ligand.name, ligand.getvalue())

        readme_content = f"""MD Simulation Request
Target: {target.name}
Ligand: {ligand.name if ligand else 'None'}
Force Field: {ff}
Requested Simulation Time: {time} ns
"""
        zf.writestr("README_parameters.txt", readme_content)

    st.session_state['zip_buffer'] = zip_buffer.getvalue()

# Execution Trigger
if st.button("Run Simulation", type="primary"):
    if not target_file:
        st.error("Please upload a Target Protein file before running.")
    else:
        st.write(f"**Executing Mode:** {exec_mode}")

        # Save files to out_dir if local
        if "Local" in exec_mode:
            os.makedirs(out_dir, exist_ok=True)
            target_path = os.path.join(out_dir, target_file.name)
            with open(target_path, "wb") as f:
                f.write(target_file.getvalue())
            if ligand_file:
                ligand_path = os.path.join(out_dir, ligand_file.name)
                with open(ligand_path, "wb") as f:
                    f.write(ligand_file.getvalue())

        if exec_mode == "Local: OpenMM":
            prepare_local_openmm(target_file, ligand_file, out_dir, sim_time, force_field)
            st.session_state['zip_buffer'] = None
        elif exec_mode == "Local: GROMACS":
            prepare_local_gromacs(target_file, ligand_file, out_dir, sim_time, force_field)
            st.session_state['zip_buffer'] = None
        else:
            prepare_online_package(target_file, ligand_file, sim_time, force_field)

if st.session_state['zip_buffer']:
    st.download_button(
        label="Download ZIP Package for Online Server",
        data=st.session_state['zip_buffer'],
        file_name="md_simulation_package.zip",
        mime="application/zip"
    )
    st.info("You can upload this ZIP file to services like WebGRO or CHARMM-GUI.")
