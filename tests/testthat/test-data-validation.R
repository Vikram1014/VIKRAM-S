library(testthat)
source("../../R/data_validation.R")

test_that("validate_dataset handles missing files correctly", {
  res <- validate_dataset("nonexistent.csv", "nonexistent.csv")
  expect_false(res$valid)
  expect_true(grepl("Failed to read file", res$error))
})

test_that("validate_dataset checks file extensions", {
  res <- validate_dataset("data.txt", "data.txt")
  expect_false(res$valid)
  expect_equal(res$error, "Unsupported file type. Please upload a CSV or XLSX file.")
})
