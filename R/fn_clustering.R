# Function to prepare data for clustering (select numeric, omit NA, scale)
prepare_cluster_data <- function(df, vars, scale_data = TRUE) {
  if (length(vars) == 0) return(NULL)

  # Select numeric columns
  cluster_df <- df[, vars, drop = FALSE]
  numeric_cols <- names(cluster_df)[sapply(cluster_df, is.numeric)]

  if (length(numeric_cols) == 0) return(NULL)

  cluster_df <- cluster_df[, numeric_cols, drop = FALSE]

  # Handle missing data (simple omission for now to guarantee clustering works)
  cluster_df <- na.omit(cluster_df)

  # Optionally scale
  if (scale_data) {
    cluster_df <- scale(cluster_df)
  }

  return(as.data.frame(cluster_df))
}

# Run K-Means
run_kmeans <- function(prepared_df, k, nstart = 25) {
  if (is.null(prepared_df) || k < 2 || k > nrow(prepared_df) - 1) return(NULL)
  set.seed(123) # for reproducibility
  res <- kmeans(prepared_df, centers = k, nstart = nstart)
  return(res)
}

# Run Hierarchical Clustering
run_hclust <- function(prepared_df, k, method = "ward.D2", metric = "euclidean") {
  if (is.null(prepared_df) || k < 2 || k > nrow(prepared_df) - 1) return(NULL)

  dist_matrix <- dist(prepared_df, method = metric)
  hc <- hclust(dist_matrix, method = method)

  # Cut tree into K clusters
  clusters <- cutree(hc, k = k)

  return(list(
    hc_obj = hc,
    cluster = clusters,
    dist = dist_matrix,
    data = prepared_df
  ))
}
