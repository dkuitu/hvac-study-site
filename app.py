# Import the create_app function from the app package
from app import create_app

# Create the Flask application instance
app = create_app('development')  # Explicitly use development config

# Run the app if this file is executed directly
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
