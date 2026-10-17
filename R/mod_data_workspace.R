mod_data_workspace_ui <- function(id) {
  ns <- NS(id)
  tagList(
    card(
      card_header("Data Upload"),
      layout_sidebar(
        sidebar = sidebar(
          fileInput(ns("file_upload"), "Upload Dataset (CSV or XLSX)", accept = c(".csv", ".xlsx")),
          helpText("Max file size: 30MB"),
          hr(),
          h5("Or use sample data:"),
          actionButton(ns("load_mtcars"), "Load mtcars", class = "btn-secondary btn-sm mb-2"),
          actionButton(ns("load_iris"), "Load iris", class = "btn-secondary btn-sm mb-2"),
          actionButton(ns("load_usarrests"), "Load USArrests", class = "btn-secondary btn-sm mb-2")
        ),
        uiOutput(ns("upload_status")),
        uiOutput(ns("data_summary_ui")),
        DTOutput(ns("data_preview"))
      )
    )
  )
}

mod_data_workspace_server <- function(id, shared_data) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # Increase upload limit to 30MB
    options(shiny.maxRequestSize = 30*1024^2)

    # Helper to load data
    load_data <- function(df, name) {
      shared_data$raw <- df
      shared_data$name <- name
      shared_data$info <- summarize_dataset(df)
      showNotification(paste("Successfully loaded:", name), type = "message")
    }

    # Handle file upload
    observeEvent(input$file_upload, {
      req(input$file_upload)

      file <- input$file_upload
      res <- validate_dataset(file$datapath, file$name)

      if (!res$valid) {
        showNotification(res$error, type = "error", duration = NULL)
        shared_data$raw <- NULL
        shared_data$name <- NULL
        shared_data$info <- NULL
      } else {
        load_data(res$data, file$name)
      }
    })

    # Handle sample data clicks
    observeEvent(input$load_mtcars, {
      load_data(read.csv("sample-data/mtcars.csv"), "mtcars.csv (Sample)")
    })

    observeEvent(input$load_iris, {
      load_data(read.csv("sample-data/iris.csv"), "iris.csv (Sample)")
    })

    observeEvent(input$load_usarrests, {
      load_data(read.csv("sample-data/USArrests.csv"), "USArrests.csv (Sample)")
    })

    # Render upload status
    output$upload_status <- renderUI({
      if (is.null(shared_data$raw)) {
        div(class = "alert alert-info", "No dataset loaded. Please upload a file or select a sample dataset.")
      } else {
        div(class = "alert alert-success", paste("Currently loaded:", shared_data$name))
      }
    })

    # Render data summary
    output$data_summary_ui <- renderUI({
      req(shared_data$raw, shared_data$info)
      info <- shared_data$info

      layout_columns(
        value_box(title = "Rows", value = info$rows, theme = "primary"),
        value_box(title = "Columns", value = info$cols, theme = "secondary"),
        value_box(title = "Missing Values", value = info$missing_total, theme = if(info$missing_total > 0) "warning" else "success")
      )
    })

    # Render data preview
    output$data_preview <- renderDT({
      req(shared_data$raw)
      datatable(
        head(shared_data$raw, 50),
        options = list(scrollX = TRUE, pageLength = 10, dom = 'tip'),
        class = 'cell-border stripe'
      )
    })
  })
}
