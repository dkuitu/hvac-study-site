#!/bin/bash
# Script to fix server flashcard issues

# Go to the application directory
cd /var/www/hvacprostudy

# Create production environment variables
echo "Creating .env file with production settings..."
cat > .env << EOF
FLASK_ENV=production
FLASK_APP=app.py
DATABASE_URL=sqlite:////var/www/hvacprostudy/production.sqlite
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
EOF

# Fix app.py to use production configuration
echo "Updating app.py to use production configuration..."
sed -i 's/app = create_app(.development.)/app = create_app("production")/' app.py

# Run database migrations
echo "Running database migrations..."
source venv/bin/activate
python migrations.py

# Update the systemd service file
echo "Updating systemd service file..."
sudo bash -c 'cat > /etc/systemd/system/hvacprostudy.service << EOF
[Unit]
Description=HVAC Pro Study Flask Application
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/hvacprostudy
Environment="FLASK_ENV=production"
Environment="FLASK_APP=app.py"
ExecStart=/var/www/hvacprostudy/venv/bin/gunicorn -b 127.0.0.1:8000 "app:create_app('production')"
Restart=always

[Install]
WantedBy=multi-user.target
EOF'

# Update ownership of the application directory
echo "Updating file permissions..."
sudo chown -R www-data:www-data /var/www/hvacprostudy

# Reload systemd and restart the service
echo "Restarting services..."
sudo systemctl daemon-reload
sudo systemctl restart hvacprostudy.service
sudo systemctl restart nginx

# Check service status
echo "Service status:"
sudo systemctl status hvacprostudy.service --no-pager

echo "Fix completed! Check the logs for any errors:"
echo "sudo journalctl -u hvacprostudy.service -n 50"