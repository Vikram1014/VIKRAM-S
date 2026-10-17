validate_dataset <- function(file_path, file_name) {
  ext <- tools::file_ext(file_name)

  if (!(tolower(ext) %in% c("csv", "xlsx"))) {
    return(list(valid = FALSE, error = "Unsupported file type. Please upload a CSV or XLSX file.", data = NULL))
  }

  tryCatch({
    if (tolower(ext) == "csv") {
      df <- readr::read_csv(file_path, show_col_types = FALSE)
    } else {
      df <- readxl::read_excel(file_path)
    }

    if (nrow(df) == 0) {
      return(list(valid = FALSE, error = "The uploaded file is empty (no rows).", data = NULL))
    }

    if (ncol(df) == 0) {
       return(list(valid = FALSE, error = "The uploaded file has no columns.", data = NULL))
    }

    # Check for blank or duplicate column names
    col_names <- colnames(df)
    if (any(is.na(col_names) | col_names == "")) {
       return(list(valid = FALSE, error = "The uploaded file contains blank column names.", data = NULL))
    }

    if (any(duplicated(col_names))) {
       return(list(valid = FALSE, error = "The uploaded file contains duplicate column names.", data = NULL))
    }

    return(list(valid = TRUE, error = NULL, data = df))
  }, error = function(e) {
    return(list(valid = FALSE, error = paste("Failed to read file:", e$message), data = NULL))
  })
}

summarize_dataset <- function(df) {
  list(
    rows = nrow(df),
    cols = ncol(df),
    missing_total = sum(is.na(df)),
    numeric_cols = sum(sapply(df, is.numeric)),
    categorical_cols = sum(sapply(df, function(x) is.character(x) | is.factor(x)))
  )
}
