# Molecular Dynamics (MD) Simulation GUI Architecture

## Overview
This document outlines the architecture and design for a robust Graphical User Interface (GUI) intended to facilitate Molecular Dynamics (MD) simulations. The GUI allows users to upload structural files (Target Protein and Ligand), set simulation parameters, select force fields, and route jobs to either local computational engines or package them for free online MD servers.

## Tech Stack
*   **Frontend & Core Framework:** [Streamlit](https://streamlit.io/) (Python)
    *   *Why:* Streamlit allows for rapid development of highly interactive, data-centric web applications purely in Python. It integrates seamlessly with Python-based scientific libraries.
*   **3D Visualization:** `py3Dmol` / `streamlit-py3dmol`
    *   *Why:* Provides interactive, in-browser 3D visualization of molecular structures (PDB, SDF, etc.) so users can inspect their uploads before running simulations.
*   **Backend / Execution Engines:**
    *   **OpenMM (Local):** A highly performant, Python-native MD toolkit.
    *   **GROMACS (Local):** The industry-standard command-line based MD engine.
    *   **External Servers (Online):** Packaging for services like WebGRO or CHARMM-GUI.

## GUI Layout and Features

### 1. Sidebar Configuration
*   **Output Directory Selector:** Input field or directory picker for users to specify where simulation outputs (trajectories, topologies, logs) should be saved.
*   **Execution Mode Selection:** Radio buttons or dropdown to select the target backend:
    *   Local: OpenMM
    *   Local: GROMACS
    *   Free Online Server (Package files for submission)

### 2. Main Interface

#### A. Input Section
*   **Target (Protein) Upload:** File uploader accepting `.pdb` or `.gro` formats.
*   **Ligand Upload:** File uploader accepting `.sdf`, `.mol2`, or `.pdb` formats.

#### B. Visualization Section
*   **Interactive 3D Viewer:** Renders the uploaded protein and ligand. Allows the user to rotate, zoom, and inspect the structural alignment before proceeding.

#### C. Simulation Parameters
*   **Simulation Time:** Numeric input / slider to define the length of the simulation in nanoseconds (ns).
*   **Force Field Selection:** Dropdown to choose the desired force field (e.g., AMBER, CHARMM).

#### D. Execution
*   **"Run Simulation" Button:** The primary trigger that initiates the backend workflow based on the provided inputs and selected execution mode.

## Workflow & Logic Routing

When the user clicks "Run Simulation", the application performs the following steps:

1.  **Input Validation:**
    *   Check if Target and Ligand files are uploaded.
    *   Verify the Output Directory is specified and writable.
    *   Ensure simulation time is > 0.
2.  **File Processing (Stubs):**
    *   Save uploaded files to the specified output directory.
    *   (Future Implementation: Parameterize the ligand and generate topology files based on the chosen force field).
3.  **Job Routing:**
    *   **If Local (OpenMM):** Generate an OpenMM Python script (`run_openmm.py`) pre-configured with the user's settings. Optionally execute this script in a subprocess.
    *   **If Local (GROMACS):** Generate a bash script (`run_gromacs.sh`) and `.mdp` files required to run GROMACS. Optionally execute the script in a subprocess.
    *   **If Free Online Server:** Create a `.zip` archive containing the structural files and a README/parameter file detailing the requested settings (Force Field, Time). This archive can be manually uploaded to servers like WebGRO.

## Future Enhancements
*   Automated ligand parameterization (e.g., using AmberTools/Antechamber or ACPYPE).
*   Real-time progress bars and log viewing for local simulations.
*   Direct API integration with online servers (if public APIs become available).
*   Post-simulation analysis tools (RMSD, RMSF plotting).
