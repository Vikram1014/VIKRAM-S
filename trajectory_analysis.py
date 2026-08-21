import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import random

def generate_mock_trajectory_data(sim_time_ns, frames=100):
    time_array = np.linspace(0, sim_time_ns, frames)

    # RMSD: rises and plateaus
    rmsd_base = 0.15 + 0.1 * (1 - np.exp(-time_array/ (sim_time_ns*0.2)))
    rmsd = rmsd_base + np.random.normal(0, 0.02, frames)

    # Ligand RMSD: slightly higher, plateaus
    lig_rmsd_base = 0.10 + 0.12 * (1 - np.exp(-time_array/ (sim_time_ns*0.3)))
    lig_rmsd = lig_rmsd_base + np.random.normal(0, 0.02, frames)

    # Radius of Gyration: relatively stable
    rg = np.ones(frames) * 1.75 + np.random.normal(0, 0.015, frames)

    # H-Bonds
    hbonds = np.random.poisson(lam=5, size=frames)

    df = pd.DataFrame({
        'Time (ns)': time_array,
        'Protein RMSD (nm)': rmsd,
        'Ligand RMSD (nm)': lig_rmsd,
        'Radius of Gyration (nm)': rg,
        'H-Bonds': hbonds
    })

    # RMSF (per residue)
    residues = np.arange(1, 301)
    rmsf = np.random.normal(0.1, 0.05, 300)
    # Add some flexible loops
    rmsf[45:55] += 0.3
    rmsf[120:135] += 0.4
    rmsf[200:210] += 0.25
    rmsf = np.abs(rmsf)

    df_rmsf = pd.DataFrame({
        'Residue Index': residues,
        'RMSF (nm)': rmsf
    })

    return df, df_rmsf

def plot_rmsd(df):
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df['Time (ns)'], y=df['Protein RMSD (nm)'], mode='lines', name='Protein RMSD', line=dict(color='blue')))
    fig.add_trace(go.Scatter(x=df['Time (ns)'], y=df['Ligand RMSD (nm)'], mode='lines', name='Ligand RMSD', line=dict(color='red')))
    fig.update_layout(title='RMSD vs Time', xaxis_title='Time (ns)', yaxis_title='RMSD (nm)')
    return fig

def plot_rmsf(df_rmsf):
    fig = px.line(df_rmsf, x='Residue Index', y='RMSF (nm)', title='RMSF vs Residue')
    return fig

def plot_rg(df):
    fig = px.line(df, x='Time (ns)', y='Radius of Gyration (nm)', title='Radius of Gyration vs Time')
    return fig

def plot_hbonds(df):
    fig = px.bar(df, x='Time (ns)', y='H-Bonds', title='Protein-Ligand Hydrogen Bonds vs Time')
    return fig
