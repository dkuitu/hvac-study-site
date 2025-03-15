#!/bin/bash

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables (if not already done)
if [ ! -f .env ]; then
    echo "Creating default .env file"
    cp .env.example .env
fi

# Create initial data directory
mkdir -p app/static/data

echo "Installation complete! Run 'flask run' to start the application."
