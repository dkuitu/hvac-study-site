#!/bin/bash
# Deployment script for HVAC Pro Study site

# Pull the latest changes from the git repository
git pull

# Install or update dependencies
pip install -r requirements.txt

# Create a systemd service file if it doesn't exist
if [ ! -f /etc/systemd/system/hvacprostudy.service ]; then
    echo "Creating systemd service file..."
    sudo bash -c 'cat > /etc/systemd/system/hvacprostudy.service << EOF
[Unit]
Description=HVAC Pro Study Flask Application
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/hvacprostudy
ExecStart=/var/www/hvacprostudy/venv/bin/gunicorn -b 127.0.0.1:8000 "wsgi:application"
Restart=always

[Install]
WantedBy=multi-user.target
EOF'
    sudo systemctl daemon-reload
    sudo systemctl enable hvacprostudy.service
fi

# Create Nginx config if it doesn't exist
if [ ! -f /etc/nginx/sites-available/hvacprostudy ]; then
    echo "Creating Nginx configuration..."
    sudo bash -c 'cat > /etc/nginx/sites-available/hvacprostudy << EOF
server {
    listen 80;
    server_name hvacprostudy.space www.hvacprostudy.space;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /static {
        alias /var/www/hvacprostudy/app/static;
    }
}
EOF'
    sudo ln -s /etc/nginx/sites-available/hvacprostudy /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
fi

# Restart the service
sudo systemctl restart hvacprostudy.service

echo "Deployment complete!"