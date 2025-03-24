# Server Deployment Fix Instructions

Follow these steps to fix the issue with flashcards not showing on the server:

## 1. SSH into your server

```bash
ssh username@your-server-ip
```

## 2. Upload and run the fix script

First, commit and push all your changes to GitHub:

```bash
git add wsgi.py deploy.sh server_fix.sh
git commit -m "Add server deployment fixes"
git push
```

Then, on your server:

```bash
cd /var/www/hvacprostudy
git pull
chmod +x server_fix.sh
sudo ./server_fix.sh
```

## 3. Verify the fix

1. Check if the services are running properly:

```bash
sudo systemctl status hvacprostudy.service
sudo systemctl status nginx
```

2. Check the application logs:

```bash
sudo journalctl -u hvacprostudy.service -n 50
```

3. Visit your website and verify that the flashcards are now showing.

## What this fix addresses:

1. **Production Configuration:** The app was previously using development configuration on the server. The fix changes this to production mode.

2. **WSGI Application:** Creates a proper WSGI entry point for Gunicorn to use.

3. **Database Migration:** Ensures the database tables are created and JSON data is migrated to the database.

4. **Service Configuration:** Updates the systemd service to use the correct application entry point.

5. **Environment Variables:** Sets up proper environment variables for production.

## If you're still having issues:

Check the server logs for any specific errors:

```bash
sudo journalctl -u hvacprostudy.service -n 100 --no-pager
```

You may need to manually run the database migration:

```bash
cd /var/www/hvacprostudy
source venv/bin/activate
python migrations.py
```

Make sure the database file and directory are accessible to the www-data user:

```bash
sudo chown -R www-data:www-data /var/www/hvacprostudy
```