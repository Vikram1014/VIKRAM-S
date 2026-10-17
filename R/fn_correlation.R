# Function to calculate correlation matrix
calculate_correlation <- function(df, vars, method = "pearson", use = "pairwise.complete.obs") {
  if(length(vars) < 2) return(NULL)
  cor_data <- df[, vars, drop = FALSE]

  # Ensure all selected are numeric
  cor_data <- cor_data[, sapply(cor_data, is.numeric), drop = FALSE]
  if(ncol(cor_data) < 2) return(NULL)

  res <- cor(cor_data, use = use, method = method)
  return(res)
}

# Function to calculate p-values for correlation matrix
calculate_cor_pmat <- function(df, vars, method = "pearson") {
  if(length(vars) < 2) return(NULL)
  cor_data <- df[, vars, drop = FALSE]
  cor_data <- cor_data[, sapply(cor_data, is.numeric), drop = FALSE]
  if(ncol(cor_data) < 2) return(NULL)

  # Simple matrix computation of p-values
  n <- ncol(cor_data)
  p.mat <- matrix(NA, n, n)
  diag(p.mat) <- 0
  for (i in 1:(n - 1)) {
    for (j in (i + 1):n) {
      tmp <- cor.test(cor_data[[i]], cor_data[[j]], method = method, exact=FALSE)
      p.mat[i, j] <- p.mat[j, i] <- tmp$p.value
    }
  }
  colnames(p.mat) <- rownames(p.mat) <- colnames(cor_data)
  return(p.mat)
}
