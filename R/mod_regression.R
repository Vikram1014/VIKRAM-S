mod_regression_ui <- function(id) {
  ns <- NS(id)
  tagList(
    card(
      card_header("Regression Analysis"),
      layout_sidebar(
        sidebar = sidebar(
          uiOutput(ns("var_select_ui")),
          selectInput(ns("model_type"), "Model Type", choices = c("Linear Regression (LM)" = "lm", "Logistic Regression (GLM)" = "glm")),
          actionButton(ns("run_model"), "Fit Model", class = "btn-primary"),
          hr(),
          downloadButton(ns("dl_summary"), "Download Coefficients (CSV)")
        ),

        # Main panel
        uiOutput(ns("main_content"))
      )
    )
  )
}

mod_regression_server <- function(id, shared_data) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # UI for variable selection
    output$var_select_ui <- renderUI({
      if (is.null(shared_data$raw)) {
        return(tags$div(class = "alert alert-warning", "Please upload data in the Data Workspace first."))
      }
      df <- shared_data$raw
      col_names <- names(df)

      tagList(
        selectInput(ns("dep_var"), "Dependent Variable (Y)", choices = col_names),
        selectizeInput(ns("indep_vars"), "Independent Variables (X)", choices = col_names, multiple = TRUE)
      )
    })

    # Reactive model fit
    fitted_model <- eventReactive(input$run_model, {
      req(shared_data$raw, input$dep_var, input$indep_vars)

      # Prevent self-regression
      if (input$dep_var %in% input$indep_vars) {
        showNotification("Dependent variable cannot be in the independent variables list.", type = "error")
        return(NULL)
      }

      df <- shared_data$raw

      # Try/catch around model fitting
      tryCatch({
        if (input$model_type == "lm") {
          run_linear_regression(df, input$dep_var, input$indep_vars)
        } else if (input$model_type == "glm") {
          run_logistic_regression(df, input$dep_var, input$indep_vars)
        }
      }, error = function(e) {
        showNotification(paste("Error fitting model:", e$message), type = "error", duration = 10)
        NULL
      })
    })

    # Render Main Content
    output$main_content <- renderUI({
      model <- fitted_model()
      if (is.null(model)) {
        return(h4("Select variables and click 'Fit Model' to see results."))
      }

      navset_card_underline(
        nav_panel("Model Summary",
                  h5("Coefficients"),
                  DTOutput(ns("coef_table")),
                  br(),
                  h5("Model Fit Statistics"),
                  DTOutput(ns("fit_table"))
        ),
        nav_panel("Diagnostic Plots",
                  plotOutput(ns("diag_plots"), height = "600px")
        )
      )
    })

    # Render tables
    output$coef_table <- renderDT({
      req(fitted_model())
      tidied <- tidy_model_summary(fitted_model())
      # Round numeric columns
      num_cols <- sapply(tidied, is.numeric)
      tidied[num_cols] <- lapply(tidied[num_cols], round, 4)
      datatable(tidied, options = list(scrollX = TRUE, dom = 't'))
    })

    output$fit_table <- renderDT({
      req(fitted_model())
      glanced <- glance_model(fitted_model())
      # Round numeric columns
      num_cols <- sapply(glanced, is.numeric)
      glanced[num_cols] <- lapply(glanced[num_cols], round, 4)
      datatable(glanced, options = list(scrollX = TRUE, dom = 't'))
    })

    # Diagnostic plots (base R layout)
    output$diag_plots <- renderPlot({
      req(fitted_model())
      par(mfrow = c(2, 2))
      plot(fitted_model())
    })

    # Export
    output$dl_summary <- export_csv_handler("Model_Coefficients", reactive({
      req(fitted_model())
      tidy_model_summary(fitted_model())
    }))

  })
}
