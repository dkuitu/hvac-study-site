import json
import os
from datetime import datetime

# Define data directory path
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'data')

def ensure_data_dir():
    """Ensure the data directory exists"""
    os.makedirs(DATA_DIR, exist_ok=True)

def load_json(filename):
    """Load JSON data from a file"""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return {}
    with open(filepath, 'r') as f:
        return json.load(f)

def save_json(data, filename):
    """Save JSON data to a file"""
    ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
