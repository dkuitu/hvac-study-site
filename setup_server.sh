#!/bin/bash
# Initial server setup script for Digital Ocean droplet

# Update system packages
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y python3-pip python3-venv nginx git

# Install gunicorn
pip3 install gunicorn

# Create directory for the application
sudo mkdir -p /var/www/hvacprostudy
sudo chown -R $USER:$USER /var/www/hvacprostudy

# Clone the repository
cd /var/www
git clone https://github.com/yourusername/hvac-study-site.git hvacprostudy
cd hvacprostudy

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script to set up the services
./deploy.sh

echo "Server setup complete!"