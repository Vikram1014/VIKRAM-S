library(shiny)
library(bslib)
library(dplyr)
library(readr)
library(readxl)
library(DT)
library(ggplot2)
library(plotly)
library(corrplot)
library(heatmaply)
library(broom)
library(cluster)
library(factoextra)

# Source all modules and helper functions
sapply(list.files("R", full.names = TRUE, pattern = "\\.R$"), source)

# Global Theme settings (bslib)
statlab_theme <- bs_theme(
  version = 5,
  bootswatch = "zephyr",
  primary = "#005C5C",   # Dark Teal
  secondary = "#3776AB", # Blue
  success = "#2E8B57",   # Green
  info = "#1F6F8B",
  base_font = font_google("Inter"),
  heading_font = font_google("Inter")
)
