# SCRIPT AUDIT

This document outlines the findings from auditing the three existing R Shiny scripts (`corexplorer.R`, `REGRESSIFY.R`, `ClustrixProV1.R`).

## 1. corexplorer.R
- **Primary purpose**: Correlation analysis and visualization.
- **Input requirements**: CSV, TSV, XLSX, or SQLite files containing numerical columns. Also has built-in demo datasets (mtcars, iris).
- **Output types**: Interactive heatmaps (heatmaply), scatterplots (plotly), correlation matrices, statistical summaries, downloadable reports (CSV, PNG, PDF), and an SQLite database for history/users.
- **Statistical methods**: Pearson, Spearman, Kendall correlation methods. Also includes partial correlations and significance testing.
- **Required R packages**: shiny, shinydashboard, DT, plotly, corrplot, GGally, heatmaply, dplyr, readr, ggplot2, tools, readxl, RColorBrewer, ggcorrplot, colourpicker, datasets, scales, grid, PerformanceAnalytics, reshape2, rmarkdown, mailR, RSQLite, digest, igraph, intergraph.
- **Existing visualizations**: Correlation network, scatter plot matrix, 3D scatter plots, heatmap.
- **Important parameters**: Correlation method, missing value handling, significance level, variables selection.
- **Known limitations**: Tightly coupled with shinydashboard and an SQLite database for user management, which needs to be removed for the unified public dashboard.
- **Integration changes required**: Remove user authentication/history. Adapt the UI to use `bslib` instead of `shinydashboard`. Decouple data upload logic to use the shared reactive dataset.
- **Verification tests required**: Verify correlation coefficients match original output for standard datasets (mtcars/iris).

## 2. REGRESSIFY.R
- **Primary purpose**: Regression analysis and modeling.
- **Input requirements**: CSV, Excel, TXT (TSV/CSV).
- **Output types**: Model summaries, ANOVA tables, diagnostic plots, predictions, downloadable reports.
- **Statistical methods**: Linear Regression (lm), Logistic Regression (glm binomial), Polynomial Regression, Ridge Regression (glmnet/MASS), Lasso Regression.
- **Required R packages**: shiny, shinyjs, shinyWidgets, tidyverse, broom, DT, corrplot, glue, readxl, caret, nnet, pROC, car, forecast, data.table, colourpicker, gridExtra, patchwork, scatterplot3d, ggplot2, MASS, lmtest, PRROC, plotly, mailR.
- **Existing visualizations**: Residual plots, actual vs predicted, Q-Q plots, 3D scatter for multiple regression, ROC curves for logistic.
- **Important parameters**: Dependent/independent variables, model type, train/test split ratio.
- **Known limitations**: Huge amount of dependencies, some UI elements are custom and need to be adapted to the unified layout.
- **Integration changes required**: Extract the core modeling functions. Remove the standalone data upload UI. Integrate with the shared reactive dataset. Ensure model selection and variable selection UI matches the new design.
- **Verification tests required**: Check if model coefficients and R-squared match for a basic linear model using a standard dataset.

## 3. ClustrixProV1.R
- **Primary purpose**: Clustering analysis.
- **Input requirements**: CSV, TSV, XLSX. Has built-in demo datasets (iris, USArrests, wine).
- **Output types**: Cluster assignments, summary statistics, cluster plots (PCA, dendrograms), silhouette plots.
- **Statistical methods**: K-Means, Hierarchical clustering, PAM (Partitioning Around Medoids), DBSCAN.
- **Required R packages**: shiny, shinydashboard, DT, readr, readxl, jsonlite, cluster, factoextra, ggfortify, plotly, dendextend, shinyFiles, fpc, caret, ggplot2, clue, shinyBS.
- **Existing visualizations**: Cluster plot (fviz_cluster), Silhouette plot (fviz_silhouette), Dendrogram (fviz_dend), WSS/Elbow plot.
- **Important parameters**: Features to cluster, algorithm, number of clusters (k), distance metric, linkage method, standardization.
- **Known limitations**: Uses `shinydashboard` which conflicts with the requested `bslib` layout.
- **Integration changes required**: Decouple data upload. Adapt UI controls for clustering parameters. Extract rendering logic for plots and tables.
- **Verification tests required**: Verify K-means cluster assignments and WSS plot match the original script for a standard dataset.
