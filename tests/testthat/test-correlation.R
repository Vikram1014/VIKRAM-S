library(testthat)
source("../../R/fn_correlation.R")

test_that("calculate_correlation computes correctly", {
  df <- mtcars
  res <- calculate_correlation(df, c("mpg", "wt"), method = "pearson")

  # Check dimensions
  expect_equal(dim(res), c(2, 2))

  # Check known correlation (approx -0.8676594)
  expect_equal(res["mpg", "wt"], cor(mtcars$mpg, mtcars$wt), tolerance = 1e-5)
})

test_that("calculate_cor_pmat computes p-values", {
  df <- mtcars
  pmat <- calculate_cor_pmat(df, c("mpg", "wt"), method = "pearson")

  expect_equal(dim(pmat), c(2, 2))
  expect_equal(pmat["mpg", "wt"], cor.test(mtcars$mpg, mtcars$wt)$p.value, tolerance = 1e-5)
})
