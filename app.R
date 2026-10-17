source("global.R")

ui <- page_navbar(
  title = "StatLab — Statistical Analysis Hub",
  theme = statlab_theme,
  id = "nav",

  nav_panel("Home", mod_home_ui("home")),
  nav_panel("Data Workspace", mod_data_workspace_ui("data")),
  nav_panel("Correlation", mod_correlation_ui("corr")),
  nav_panel("Regression", mod_regression_ui("regr")),
  nav_panel("Clustering", mod_clustering_ui("clust")),
  nav_panel("Help", mod_help_ui("help"))
)

server <- function(input, output, session) {
  # Reactive values for shared data state
  shared_data <- reactiveValues(
    raw = NULL,
    cleaned = NULL,
    name = NULL,
    info = NULL
  )

  # Call modules
  mod_home_server("home")
  mod_data_workspace_server("data", shared_data)
  mod_correlation_server("corr", shared_data)
  mod_regression_server("regr", shared_data)
  mod_clustering_server("clust", shared_data)
  mod_help_server("help")
}

shinyApp(ui, server)
