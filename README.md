# StatLab - Statistical Analysis Hub

"Turn your data into insights."

StatLab is a unified, interactive, public-facing web application that combines Correlation, Regression, and Clustering analyses into a single comprehensive toolkit without the need for manual R coding.

## Features
- **Shared Data Workspace**: Upload your CSV or XLSX once and perform multiple analyses across different tabs in the same session.
- **Correlation**: Assess linear and non-linear relationships using Pearson, Spearman, and Kendall methods with interactive heatmaps and scatterplots.
- **Regression**: Fit Linear (LM) and Logistic (GLM) models to understand the predictors of your target variables, supported by detailed summaries and diagnostic plots.
- **Clustering**: Discover natural groupings in your dataset using K-Means or Hierarchical Clustering, featuring PCA plots and Silhouette analysis.
- **Results Export**: Safely and securely download analysis outputs directly to your machine.

## Project Structure
- `app.R` & `global.R`: Application entry points, theming, and module loading.
- `R/`: Contains modular UI/Server components (`mod_*.R`) and decoupled statistical helper functions (`fn_*.R`).
- `sample-data/`: Contains clean CSV datasets for immediate testing (mtcars, iris, USArrests).
- `tests/`: `testthat` scripts ensuring functional correctness of standard algorithms.

## Prerequisites & Installation
1. Install R (version 4.1.0 or higher recommended).
2. The project relies on `renv` for dependency management.
3. Upon opening the project in R/RStudio, run `renv::restore()` to install all required packages.

## How to Run Locally
Run the following in your R console from the project root directory:

```r
shiny::runApp(port = 3000)
```

## Known Limitations
- The tool currently limits uploads to 30MB per file to maintain performance in a shared hosting environment.
- Logistic Regression expects a strictly binary dependent variable.
- Extremely high-dimensional datasets may encounter performance constraints during clustering visualizations.

## Development Details
This application was refactored and unified from three standalone proof-of-concept scripts (`corexplorer.R`, `REGRESSIFY.R`, `ClustrixProV1.R`), discarding heavy custom UI/Database dependencies while preserving standard R analytical methodology.

Please see `DEPLOYMENT.md` for specific hosting instructions.
