# Function to run linear regression
run_linear_regression <- function(df, dep_var, indep_vars) {
  if (is.null(dep_var) || length(indep_vars) == 0) return(NULL)

  # Construct formula
  form_str <- paste(dep_var, "~", paste(indep_vars, collapse = " + "))
  form <- as.formula(form_str)

  # Fit model
  model <- lm(form, data = df)
  return(model)
}

# Function to run logistic regression
run_logistic_regression <- function(df, dep_var, indep_vars) {
  if (is.null(dep_var) || length(indep_vars) == 0) return(NULL)

  # Ensure dependent variable is a factor or binary 0/1
  if (!is.factor(df[[dep_var]]) && length(unique(df[[dep_var]])) != 2) {
    stop("Dependent variable must be binary for Logistic Regression.")
  }

  if(!is.factor(df[[dep_var]])) {
    df[[dep_var]] <- as.factor(df[[dep_var]])
  }

  # Construct formula
  form_str <- paste(dep_var, "~", paste(indep_vars, collapse = " + "))
  form <- as.formula(form_str)

  # Fit model
  model <- glm(form, data = df, family = binomial)
  return(model)
}

# Wrapper function to tidy model summary
tidy_model_summary <- function(model) {
  if (is.null(model)) return(NULL)
  broom::tidy(model, conf.int = TRUE)
}

# Wrapper function for model statistics (glance)
glance_model <- function(model) {
  if (is.null(model)) return(NULL)
  broom::glance(model)
}
