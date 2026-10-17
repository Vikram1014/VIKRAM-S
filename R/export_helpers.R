# General export helpers for Shiny modules

export_csv_handler <- function(filename_prefix, data_reactive) {
  downloadHandler(
    filename = function() {
      paste0(filename_prefix, "_", format(Sys.time(), "%Y%m%d_%H%M%S"), ".csv")
    },
    content = function(file) {
      req(data_reactive())
      write.csv(data_reactive(), file, row.names = TRUE)
    }
  )
}

export_plot_handler <- function(filename_prefix, plot_reactive, width = 800, height = 600) {
  downloadHandler(
    filename = function() {
      paste0(filename_prefix, "_", format(Sys.time(), "%Y%m%d_%H%M%S"), ".png")
    },
    content = function(file) {
      req(plot_reactive())
      # If it's a ggplot object
      if (inherits(plot_reactive(), "gg")) {
        ggsave(file, plot = plot_reactive(), width = width/100, height = height/100, dpi = 300)
      } else {
        # Base R plots or corrplot (requires capturing device)
        png(file, width = width, height = height)
        print(plot_reactive())
        dev.off()
      }
    }
  )
}
