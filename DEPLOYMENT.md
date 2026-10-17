# Deployment Guide for StatLab

This document outlines instructions for deploying the StatLab Shiny Application to public-facing production environments.

## Option 1: Deployment via shinyapps.io (Recommended for Quick Cloud Hosting)

Posit's `shinyapps.io` provides an easy, secure, and isolated environment for public deployment without the need to maintain your own server architecture.

### Requirements:
1. An account on [shinyapps.io](https://www.shinyapps.io).
2. The `rsconnect` package installed in your R environment.

### Steps:
1. Authenticate your R session using the token provided by your shinyapps.io dashboard:
   ```r
   rsconnect::setAccountInfo(name='<YOUR_ACCOUNT_NAME>', token='<YOUR_TOKEN>', secret='<YOUR_SECRET>')
   ```
2. Navigate to the `StatLab` project root directory.
3. Deploy the application:
   ```r
   rsconnect::deployApp()
   ```

### Important shinyapps.io Limitations:
- The free tier places limits on active hours and maximum RAM per instance (usually 1GB).
- Large datasets uploaded by users may exceed available RAM, causing application crashes.
- Temporary files generated during user sessions are discarded when the instance spins down.

## Option 2: Deployment via Open Source Shiny Server (For Custom Infrastructures)

If you have your own Ubuntu server (e.g., AWS EC2, DigitalOcean Droplet), you can host StatLab using the open-source Shiny Server.

### Steps:
1. **Install R and dependencies** on the Ubuntu server.
   ```bash
   sudo apt-get update
   sudo apt-get install r-base
   ```
2. **Install Shiny Server**:
   ```bash
   sudo apt-get install gdebi-core
   wget https://download3.rstudio.org/ubuntu-18.04/x86_64/shiny-server-1.5.22.1017-amd64.deb
   sudo gdebi shiny-server-1.5.22.1017-amd64.deb
   ```
3. **Copy StatLab** to the Shiny Server web directory:
   ```bash
   sudo cp -r /path/to/StatLab /srv/shiny-server/statlab
   ```
4. **Install R Packages**:
   Ensure all packages specified in `global.R` are installed globally, or utilize `renv` inside the deployed `/srv/shiny-server/statlab` folder:
   ```bash
   sudo su - -c "R -e \"renv::restore(project='/srv/shiny-server/statlab')\""
   ```
5. **Restart Shiny Server** to load the new app:
   ```bash
   sudo systemctl restart shiny-server
   ```
6. The app will be available publicly at `http://<your-server-ip>:3838/statlab/`.

### Security and Privacy Constraints
- All uploaded user files in StatLab are processed strictly within the active Shiny session and are stored temporarily in R's temporary directories.
- Ensure the server architecture utilizes Reverse Proxies (like Nginx) and HTTPS to secure network traffic when users upload CSV/XLSX datasets.
- Ensure you enforce reasonable limitations on user uploads (currently set to 30MB) so public actors cannot exhaust server storage.
