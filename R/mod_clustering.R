mod_clustering_ui <- function(id) {
  ns <- NS(id)
  tagList(
    card(
      card_header("Clustering Analysis"),
      layout_sidebar(
        sidebar = sidebar(
          uiOutput(ns("var_select_ui")),
          selectInput(ns("algo"), "Algorithm", choices = c("K-Means" = "kmeans", "Hierarchical" = "hclust")),
          numericInput(ns("k"), "Number of Clusters (k)", value = 3, min = 2, max = 20),
          checkboxInput(ns("scale_data"), "Standardize Features (Recommended)", value = TRUE),

          # Hclust specific options
          conditionalPanel(
            condition = paste0("input['", ns("algo"), "'] == 'hclust'"),
            selectInput(ns("dist_metric"), "Distance Metric", choices = c("euclidean", "manhattan")),
            selectInput(ns("linkage"), "Linkage Method", choices = c("ward.D2", "complete", "average", "single"))
          ),

          actionButton(ns("run_cluster"), "Run Clustering", class = "btn-primary"),
          hr(),
          downloadButton(ns("dl_cluster_data"), "Download Data + Clusters (CSV)")
        ),

        # Main panel
        uiOutput(ns("main_content"))
      )
    )
  )
}

mod_clustering_server <- function(id, shared_data) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # UI for variable selection
    output$var_select_ui <- renderUI({
      if (is.null(shared_data$raw)) {
        return(tags$div(class = "alert alert-warning", "Please upload data in the Data Workspace first."))
      }
      df <- shared_data$raw
      num_cols <- names(df)[sapply(df, is.numeric)]

      selectizeInput(ns("vars"), "Select Features for Clustering", choices = num_cols, selected = num_cols, multiple = TRUE)
    })

    # Reactive clustering execution
    cluster_res <- eventReactive(input$run_cluster, {
      req(shared_data$raw, input$vars, input$k)

      if (length(input$vars) < 2) {
         showNotification("Please select at least 2 features.", type = "error")
         return(NULL)
      }

      df <- shared_data$raw
      prep_data <- prepare_cluster_data(df, input$vars, input$scale_data)

      if (is.null(prep_data) || nrow(prep_data) < input$k) {
        showNotification("Not enough complete observations for the requested number of clusters.", type = "error")
        return(NULL)
      }

      tryCatch({
        if (input$algo == "kmeans") {
          res <- run_kmeans(prep_data, input$k)
          list(type = "kmeans", data = prep_data, model = res, cluster = res$cluster)
        } else {
          res <- run_hclust(prep_data, input$k, input$linkage, input$dist_metric)
          list(type = "hclust", data = prep_data, model = res, cluster = res$cluster)
        }
      }, error = function(e) {
        showNotification(paste("Clustering error:", e$message), type = "error")
        NULL
      })
    })

    # Render Main Content
    output$main_content <- renderUI({
      res <- cluster_res()
      if (is.null(res)) {
        return(h4("Select parameters and click 'Run Clustering'."))
      }

      navset_card_underline(
        nav_panel("Cluster Plot (PCA)", plotOutput(ns("cluster_plot"), height = "600px")),
        nav_panel("Silhouette Plot", plotOutput(ns("sil_plot"), height = "600px")),
        nav_panel("Dendrogram (H-Clust)",
                  conditionalPanel(
                    condition = paste0("input['", ns("algo"), "'] == 'hclust'"),
                    plotOutput(ns("dendro_plot"), height = "600px")
                  ),
                  conditionalPanel(
                    condition = paste0("input['", ns("algo"), "'] != 'hclust'"),
                    h5("Dendrograms are only available for Hierarchical Clustering.")
                  )
        ),
        nav_panel("Cluster Summary", DTOutput(ns("cluster_summary")))
      )
    })

    # Plots
    output$cluster_plot <- renderPlot({
      req(cluster_res())
      res <- cluster_res()

      if (res$type == "kmeans") {
        fviz_cluster(res$model, data = res$data, main = "K-Means Cluster Plot (PCA)")
      } else {
        fviz_cluster(list(data = res$data, cluster = res$cluster), main = "Hierarchical Cluster Plot (PCA)")
      }
    })

    output$sil_plot <- renderPlot({
      req(cluster_res())
      res <- cluster_res()

      # Calculate distance matrix for silhouette
      dist_mat <- dist(res$data)
      sil <- silhouette(res$cluster, dist_mat)
      fviz_silhouette(sil, print.summary = FALSE)
    })

    output$dendro_plot <- renderPlot({
      req(cluster_res())
      res <- cluster_res()
      if (res$type == "hclust") {
        fviz_dend(res$model$hc_obj, k = input$k, rect = TRUE, show_labels = FALSE, main = "Hierarchical Dendrogram")
      }
    })

    # Summary Table
    output$cluster_summary <- renderDT({
      req(cluster_res())
      res <- cluster_res()

      # Attach cluster to data for display
      out_df <- cbind(res$data, Cluster = as.factor(res$cluster))

      # Create a simple summary by cluster
      summary_df <- out_df %>%
        group_by(Cluster) %>%
        summarise_all(mean) %>%
        mutate(Count = as.numeric(table(res$cluster)))

      # Reorder so Count is second column
      summary_df <- summary_df %>% select(Cluster, Count, everything())

      datatable(summary_df, options = list(scrollX = TRUE, dom = 't'), caption = "Cluster Centroids (Means)") %>%
        formatRound(columns = numeric_cols(summary_df), digits = 3)
    })

    # Export Data + Clusters
    output$dl_cluster_data <- export_csv_handler("Clustered_Data", reactive({
      req(cluster_res())
      res <- cluster_res()
      cbind(res$data, Cluster = res$cluster)
    }))

  })
}

# Helper
numeric_cols <- function(df) {
  names(df)[sapply(df, is.numeric)]
}
