mod_correlation_ui <- function(id) {
  ns <- NS(id)
  tagList(
    card(
      card_header("Correlation Analysis"),
      layout_sidebar(
        sidebar = sidebar(
          uiOutput(ns("var_select_ui")),
          selectInput(ns("cor_method"), "Correlation Method", choices = c("Pearson" = "pearson", "Spearman" = "spearman", "Kendall" = "kendall")),
          selectInput(ns("use_obs"), "Missing Values", choices = c("Pairwise Complete" = "pairwise.complete.obs", "Complete Obs" = "complete.obs")),
          hr(),
          downloadButton(ns("dl_matrix"), "Download Matrix (CSV)")
        ),

        # Main panel area
        uiOutput(ns("main_content"))
      )
    )
  )
}

mod_correlation_server <- function(id, shared_data) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # UI for variable selection
    output$var_select_ui <- renderUI({
      if (is.null(shared_data$raw)) {
        return(tags$div(class = "alert alert-warning", "Please upload data in the Data Workspace first."))
      }
      df <- shared_data$raw
      num_cols <- names(df)[sapply(df, is.numeric)]

      if (length(num_cols) < 2) {
        return(tags$div(class = "alert alert-danger", "Dataset must have at least 2 numeric columns for correlation."))
      }

      selectizeInput(ns("vars"), "Select Variables (at least 2)", choices = num_cols, selected = num_cols[1:min(5, length(num_cols))], multiple = TRUE)
    })

    # Reactive calculations
    cor_matrix <- reactive({
      req(shared_data$raw, input$vars)
      if (length(input$vars) < 2) return(NULL)
      calculate_correlation(shared_data$raw, input$vars, input$cor_method, input$use_obs)
    })

    cor_p_matrix <- reactive({
      req(shared_data$raw, input$vars)
      if (length(input$vars) < 2) return(NULL)
      calculate_cor_pmat(shared_data$raw, input$vars, input$cor_method)
    })

    # Render Main Content
    output$main_content <- renderUI({
      if (is.null(shared_data$raw) || length(input$vars) < 2) {
        return(h4("Awaiting valid dataset and variable selection..."))
      }

      navset_card_underline(
        nav_panel("Heatmap", plotlyOutput(ns("heatmap"), height = "600px")),
        nav_panel("Correlation Matrix", DTOutput(ns("mat_table"))),
        nav_panel("P-Value Matrix", DTOutput(ns("p_table"))),
        nav_panel("Scatterplot",
                  selectInput(ns("scatter_x"), "X Variable", choices = input$vars),
                  selectInput(ns("scatter_y"), "Y Variable", choices = input$vars, selected = input$vars[2]),
                  plotlyOutput(ns("scatter_plot"), height = "500px")
        )
      )
    })

    # Heatmap Plotly
    output$heatmap <- renderPlotly({
      req(cor_matrix())
      heatmaply::heatmaply_cor(
        cor_matrix(),
        node_type = "scatter",
        point_size_mat = -log10(cor_p_matrix() + 1e-10),
        point_size_name = "-log10(p-value)",
        colors = colorRampPalette(c("blue", "white", "red"))(200)
      )
    })

    # Tables
    output$mat_table <- renderDT({
      req(cor_matrix())
      datatable(round(cor_matrix(), 3), options = list(scrollX = TRUE))
    })

    output$p_table <- renderDT({
      req(cor_p_matrix())
      datatable(round(cor_p_matrix(), 4), options = list(scrollX = TRUE))
    })

    # Scatterplot
    output$scatter_plot <- renderPlotly({
      req(shared_data$raw, input$scatter_x, input$scatter_y)

      df <- shared_data$raw
      p <- ggplot(df, aes_string(x = input$scatter_x, y = input$scatter_y)) +
        geom_point(alpha = 0.6, color = "#005C5C") +
        geom_smooth(method = "lm", color = "red", se = TRUE) +
        theme_minimal() +
        labs(title = paste("Scatterplot of", input$scatter_y, "vs", input$scatter_x))

      ggplotly(p)
    })

    # Downloads
    output$dl_matrix <- export_csv_handler("Correlation_Matrix", cor_matrix)
  })
}
