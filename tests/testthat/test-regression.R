library(testthat)
source("../../R/fn_regression.R")

test_that("run_linear_regression builds lm model", {
  df <- mtcars
  model <- run_linear_regression(df, "mpg", c("wt", "cyl"))

  expect_s3_class(model, "lm")
  expect_equal(names(model$coefficients), c("(Intercept)", "wt", "cyl"))
})
