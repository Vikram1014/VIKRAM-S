mod_home_ui <- function(id) {
  ns <- NS(id)
  tagList(
    div(
      class = "p-5 mb-4 bg-light rounded-3",
      h1(class = "display-5 fw-bold", "Turn your data into insights."),
      p(class = "col-md-8 fs-4", "Explore statistical relationships, build regression models, and discover patterns in your datasets using one integrated analysis workspace."),
      p(
        actionButton(ns("go_data"), "Start an Analysis", class = "btn btn-primary btn-lg", icon = icon("play")),
        actionButton(ns("go_help"), "Learn How It Works", class = "btn btn-outline-secondary btn-lg ms-2", icon = icon("book"))
      )
    ),

    # Workflow
    h3("Workflow"),
    layout_columns(
      card(card_header("1"), "Upload your dataset in the Data Workspace."),
      card(card_header("2"), "Configure the analysis parameters."),
      card(card_header("3"), "Run and inspect the results interactively."),
      card(card_header("4"), "Download tables, models, and plots.")
    ),

    br(),

    # Analysis Cards
    h3("Analysis Tools"),
    layout_columns(
      card(
        card_header("Correlation Analysis", class = "bg-primary text-white"),
        card_body(
          "Measure statistical association between numerical variables. Includes scatterplots, correlation matrices, and heatmaps.",
          actionButton(ns("go_corr"), "Open Correlation Tool", class = "btn btn-primary mt-3")
        )
      ),
      card(
        card_header("Regression Analysis", class = "bg-secondary text-white"),
        card_body(
          "Model relationships between an outcome and predictors. Evaluate model fits, diagnostics, and coefficients.",
          actionButton(ns("go_regr"), "Open Regression Tool", class = "btn btn-secondary mt-3")
        )
      ),
      card(
        card_header("Clustering Analysis", class = "bg-info text-white"),
        card_body(
          "Group observations based on similarities in selected features using algorithms like K-Means and Hierarchical clustering.",
          actionButton(ns("go_clust"), "Open Clustering Tool", class = "btn btn-info mt-3")
        )
      )
    ),

    br(),

    # Disclaimer
    div(
      class = "alert alert-warning mt-4",
      icon("exclamation-triangle"),
      " Important Notice: StatLab provides statistical analysis and does not automatically establish causation, validate scientific hypotheses, or replace appropriate statistical interpretation."
    )
  )
}

mod_home_server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # Navigation observers
    observeEvent(input$go_data, { update_page_navbar("Data Workspace") })
    observeEvent(input$go_help, { update_page_navbar("Help") })
    observeEvent(input$go_corr, { update_page_navbar("Correlation") })
    observeEvent(input$go_regr, { update_page_navbar("Regression") })
    observeEvent(input$go_clust, { update_page_navbar("Clustering") })
  })
}

# Helper to switch tabs from modules
update_page_navbar <- function(target) {
  # This requires the page_navbar id to be 'nav' (set in app.R)
  shiny::updateNavbarPage(inputId = "nav", selected = target, session = shiny::getDefaultReactiveDomain())
}
