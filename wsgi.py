from app import create_app

# Create the Flask application instance for production
application = create_app('production')

# This file is used by gunicorn to run the application
if __name__ == '__main__':
    application.run()