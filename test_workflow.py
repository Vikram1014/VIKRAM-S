import pytest
from md_workflow import MDWorkflow

def test_workflow_initialization():
    config = {
        "force_field": "AMBER",
        "water_model": "TIP3P",
        "sim_time": 100.0,
        "temp": 300.0,
        "pressure": 1.0,
        "box_type": "dodecahedron",
        "padding": 1.0
    }
    wf = MDWorkflow("dummy_prot.pdb", "dummy_lig.sdf", config)
    assert wf.job_id.startswith("JOB-")
    assert wf.config["force_field"] == "AMBER"

def test_production_steps_calculation():
    config = {
        "force_field": "AMBER",
        "water_model": "TIP3P",
        "sim_time": 10.0,
        "temp": 300.0,
        "pressure": 1.0,
        "box_type": "dodecahedron",
        "padding": 1.0
    }
    wf = MDWorkflow("dummy_prot.pdb", "dummy_lig.sdf", config)

    # 10 ns = 10,000 ps -> dt = 0.002 ps -> 5,000,000 steps
    steps = wf.get_production_steps()
    assert steps == 5000000
