mod_help_ui <- function(id) {
  ns <- NS(id)
  tagList(
    card(
      card_header("Help & Documentation"),
      navset_tab(
        nav_panel("General",
                  h4("Welcome to StatLab"),
                  p("StatLab is an interactive statistical analysis environment designed to help you explore and model your datasets without writing code."),
                  h5("Getting Started"),
                  tags$ol(
                    tags$li("Navigate to the Data Workspace and upload a CSV or XLSX file."),
                    tags$li("Use the built-in sample data if you just want to test the platform."),
                    tags$li("Navigate to the specific analysis tool you need.")
                  ),
                  p("Note: Your session data is completely private. If you reload the page, you will need to re-upload your data.")
        ),
        nav_panel("Correlation",
                  h4("Correlation Analysis"),
                  p("Correlation measures the strength and direction of association between two numerical variables."),
                  tags$ul(
                    tags$li(strong("Pearson: "), "Measures linear relationships. Requires roughly normally distributed data."),
                    tags$li(strong("Spearman: "), "Measures monotonic relationships (rank-based). Less sensitive to outliers."),
                    tags$li(strong("Kendall: "), "Another rank-based method, often preferred for small sample sizes.")
                  )
        ),
        nav_panel("Regression",
                  h4("Regression Analysis"),
                  p("Regression estimates the relationships between a dependent variable (outcome) and one or more independent variables (predictors)."),
                  tags$ul(
                    tags$li(strong("Linear Regression (LM): "), "Used when the outcome variable is continuous."),
                    tags$li(strong("Logistic Regression (GLM): "), "Used when the outcome variable is binary (e.g., 0/1, Success/Failure).")
                  ),
                  p("Always check diagnostic plots to ensure regression assumptions are met.")
        ),
        nav_panel("Clustering",
                  h4("Clustering Analysis"),
                  p("Clustering groups similar data points together based on their features."),
                  tags$ul(
                    tags$li(strong("K-Means: "), "Partitions data into K distinct clusters based on distance to the centroid. You must specify the number of clusters."),
                    tags$li(strong("Hierarchical: "), "Builds a tree of clusters (dendrogram) by sequentially merging or splitting groups.")
                  ),
                  p("It's highly recommended to standardize your variables (scale) before clustering, especially if they are measured in different units.")
        )
      )
    )
  )
}

mod_help_server <- function(id) {
  moduleServer(id, function(input, output, session) {
    # Static content, no server logic required
  })
}
