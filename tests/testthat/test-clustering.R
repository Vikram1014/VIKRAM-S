library(testthat)
source("../../R/fn_clustering.R")

test_that("run_kmeans creates valid kmeans object", {
  df <- prepare_cluster_data(mtcars, c("mpg", "wt", "hp"), scale_data = TRUE)
  res <- run_kmeans(df, k = 3)

  expect_s3_class(res, "kmeans")
  expect_equal(length(res$cluster), nrow(df))
  expect_equal(nrow(res$centers), 3)
})

test_that("run_hclust creates valid hclust output", {
  df <- prepare_cluster_data(mtcars, c("mpg", "wt", "hp"), scale_data = TRUE)
  res <- run_hclust(df, k = 3)

  expect_s3_class(res$hc_obj, "hclust")
  expect_equal(length(res$cluster), nrow(df))
})
