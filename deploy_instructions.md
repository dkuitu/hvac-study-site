# Deployment Instructions for HVAC Pro Study

These instructions detail how to deploy the HVAC Pro Study website to a Digital Ocean droplet.

## Prerequisites

1. A Digital Ocean account
2. A domain name pointing to your Digital Ocean droplet (e.g., hvacprostudy.space)
3. SSH access to your server

## Initial Server Setup

### 1. Connect to your server via SSH

```bash
ssh root@64.23.198.212
```

### 2. Create a non-root user (optional but recommended)

```bash
adduser username
usermod -aG sudo username
```

Switch to the new user:

```bash
su - username
```

### 3. Clone the repository

If you haven't already set up your GitHub repository, you'll need to:

1. Create a GitHub repository
2. Push your local project to the repository:

```bash
# On your local machine
cd /Users/dvdktn/Desktop/HVAC_study/hvac-study-site
git remote add origin https://github.com/yourusername/hvac-study-site.git
git push -u origin main
```

### 4. Run the setup script on the server

Upload the setup script to your server:

```bash
scp /Users/dvdktn/Desktop/HVAC_study/hvac-study-site/setup_server.sh username@64.23.198.212:~/
```

Make it executable and run it:

```bash
chmod +x setup_server.sh
./setup_server.sh
```

This script will:
- Update system packages
- Install necessary dependencies
- Clone the repository
- Create a virtual environment
- Set up Nginx and systemd services

## Future Updates

After the initial setup, whenever you want to update the application:

1. Push your changes to the GitHub repository:

```bash
git push origin main
```

2. SSH into your server and run the deployment script:

```bash
cd /var/www/hvacprostudy
git pull
./deploy.sh
```

## Troubleshooting

### Check service status

If the site isn't running, check the service status:

```bash
sudo systemctl status hvacprostudy.service
```

### Check Nginx configuration

Make sure Nginx is properly configured:

```bash
sudo nginx -t
sudo systemctl status nginx
```

### Check logs

Look at the application logs:

```bash
sudo journalctl -u hvacprostudy.service
```

## SSL Setup (Optional)

To enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hvacprostudy.space -d www.hvacprostudy.space
```

Follow the prompts to complete the SSL setup.