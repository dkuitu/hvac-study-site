#!/bin/bash
# Script to fix server flashcard issues

# Determine correct working directory - use current dir rather than hardcoded path
WORKING_DIR=$(pwd)
echo "Working directory: $WORKING_DIR"

# Create production environment variables
echo "Creating .env file with production settings..."
cat > .env << EOF
FLASK_ENV=production
FLASK_APP=run.py
DATABASE_URL=sqlite:///$WORKING_DIR/production.sqlite
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(16))")
EOF

# Check if app.py exists
if [ -f "$WORKING_DIR/app.py" ]; then
    echo "Updating app.py to use production configuration..."
    sed -i 's/app = create_app(.development.)/app = create_app("production")/' app.py
else
    echo "app.py not found, checking run.py instead..."
    if [ -f "$WORKING_DIR/run.py" ]; then
        echo "Updating run.py to use production configuration..."
        sed -i 's/app = create_app(.development.)/app = create_app("production")/' run.py
    fi
fi

# Create wsgi.py if it doesn't exist
echo "Creating/updating wsgi.py file..."
cat > wsgi.py << EOF
from app import create_app

# Create the Flask application instance for production
application = create_app('production')

# This file is used by gunicorn to run the application
if __name__ == '__main__':
    application.run()
EOF

# Run database migrations if migrations.py exists
if [ -f "$WORKING_DIR/migrations.py" ]; then
    echo "Running database migrations..."
    source venv/bin/activate
    python migrations.py
else
    echo "migrations.py not found. Creating a simple migration script..."
    cat > migrate_db.py << EOF
from app import create_app
from app.models.database import db
import json
import os

app = create_app('production')

def migrate_json_to_db():
    """Migrate JSON data to database"""
    # Import here to avoid circular imports
    from app.models.content.helpers import DATA_DIR
    
    # Import the migration function only if it exists
    try:
        from app.models.content import migrate_json_to_db, migrate_quizzes_to_db
        
        # Run migrations
        print("Running built-in migrations...")
        result_flashcards = migrate_json_to_db()
        print(result_flashcards.get('message', 'Unknown status'))
        
        result_quizzes = migrate_quizzes_to_db()
        print(result_quizzes.get('message', 'Unknown status'))
        return
    except ImportError:
        print("Built-in migration functions not found, using fallback method...")
    
    # Fallback: Direct database operations
    with app.app_context():
        # Make sure tables exist
        db.create_all()
        
        # Check if we have any data already
        from app.models.database import Category
        if Category.query.count() > 0:
            print("Database already has data. Skipping migration.")
            return
        
        # Manual migration
        try:
            # Import models
            from app.models.database import Category, Chapter, Deck, Flashcard
            
            # Load JSON flashcards
            json_path = os.path.join(DATA_DIR, 'flashcards.json')
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    data = json.load(f)
                
                # Process categories, chapters, decks, and cards
                cards_migrated = 0
                for cat_data in data.get('categories', []):
                    # Create or get category
                    category = Category.query.filter_by(id=cat_data['id']).first()
                    if not category:
                        category = Category(
                            id=cat_data['id'],
                            name=cat_data['name'],
                            description=cat_data.get('description', '')
                        )
                        db.session.add(category)
                        print(f"Added category: {cat_data['name']}")
                    
                    # Process chapters
                    for ch_data in cat_data.get('chapters', []):
                        chapter = Chapter.query.filter_by(id=ch_data['id'], category_id=cat_data['id']).first()
                        if not chapter:
                            chapter = Chapter(
                                id=ch_data['id'],
                                name=ch_data['name'],
                                category_id=cat_data['id']
                            )
                            db.session.add(chapter)
                            print(f"Added chapter: {ch_data['name']}")
                        
                        # Process decks
                        for deck_data in ch_data.get('decks', []):
                            deck = Deck.query.filter_by(id=deck_data['id'], chapter_id=ch_data['id']).first()
                            if not deck:
                                deck = Deck(
                                    id=deck_data['id'],
                                    name=deck_data['name'],
                                    difficulty=deck_data['difficulty'],
                                    chapter_id=ch_data['id']
                                )
                                db.session.add(deck)
                                print(f"Added deck: {deck_data['name']}")
                            
                            # Commit to ensure deck exists before adding cards
                            db.session.commit()
                            
                            # Process cards
                            for i, card_data in enumerate(deck_data.get('cards', [])):
                                card_id = f"{deck_data['id']}_{card_data.get('id', f'card{i+1}')}"
                                
                                flashcard = Flashcard.query.filter_by(id=card_id).first()
                                if not flashcard:
                                    flashcard = Flashcard(
                                        id=card_id,
                                        question=card_data['question'],
                                        answer=card_data['answer'],
                                        deck_id=deck_data['id']
                                    )
                                    db.session.add(flashcard)
                                    cards_migrated += 1
                                    
                                    # Commit every 10 cards
                                    if cards_migrated % 10 == 0:
                                        db.session.commit()
                                        print(f"Migrated {cards_migrated} cards so far...")
                
                # Final commit
                db.session.commit()
                print(f"Manual migration completed. Total cards migrated: {cards_migrated}")
            else:
                print(f"JSON file not found at: {json_path}")
        
        except Exception as e:
            db.session.rollback()
            print(f"Error during manual migration: {str(e)}")

# Run migration
if __name__ == '__main__':
    print("Starting database migration...")
    migrate_json_to_db()
    print("Migration completed.")
EOF

    echo "Running the new migration script..."
    source venv/bin/activate
    python migrate_db.py
fi

# Update the systemd service file with the correct path to gunicorn
GUNICORN_PATH=$(which gunicorn || echo "$WORKING_DIR/venv/bin/gunicorn")
echo "Using gunicorn at: $GUNICORN_PATH"

# Update the systemd service file
echo "Updating systemd service file..."
sudo bash -c "cat > /etc/systemd/system/hvacprostudy.service << EOF
[Unit]
Description=HVAC Pro Study Flask Application
After=network.target

[Service]
User=www-data
WorkingDirectory=$WORKING_DIR
Environment=\"FLASK_ENV=production\"
Environment=\"FLASK_APP=run.py\"
ExecStart=$GUNICORN_PATH -b 127.0.0.1:8000 wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

# Create an Nginx site configuration if it doesn't exist
echo "Checking Nginx configuration..."
if [ ! -f /etc/nginx/sites-available/hvacprostudy ]; then
    echo "Creating Nginx configuration..."
    sudo bash -c "cat > /etc/nginx/sites-available/hvacprostudy << EOF
server {
    listen 80;
    server_name hvacprostudy.space www.hvacprostudy.space;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
    }

    location /static {
        alias $WORKING_DIR/app/static;
    }
}
EOF"
    
    # Create symbolic link if it doesn't exist
    if [ ! -f /etc/nginx/sites-enabled/hvacprostudy ]; then
        sudo ln -s /etc/nginx/sites-available/hvacprostudy /etc/nginx/sites-enabled/
    fi
fi

# Update ownership of the application directory
echo "Updating file permissions..."
sudo chown -R www-data:www-data $WORKING_DIR
sudo chmod -R 755 $WORKING_DIR

# Make sure the database directory is writable
SQLITE_DIR=$(dirname "$WORKING_DIR/production.sqlite")
sudo mkdir -p $SQLITE_DIR
sudo chown -R www-data:www-data $SQLITE_DIR
sudo chmod -R 775 $SQLITE_DIR

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