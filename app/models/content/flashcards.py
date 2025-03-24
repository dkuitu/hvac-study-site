import logging
from datetime import datetime

from app.models.database import db, Category, Chapter, Deck, Flashcard
from app.models.content.helpers import load_json, save_json, DATA_DIR
import os

def get_flashcards(category=None, chapter=None, difficulty=None):
    """Get flashcards, optionally filtered by category, chapter, and difficulty"""
    print(f"[SERVER] Fetching flashcards from DATABASE. Filters: category={category}, chapter={chapter}, difficulty={difficulty}")
    
    query = Category.query
    
    if category:
        query = query.filter_by(id=category)
    
    categories = query.all()
    print(f"[SERVER] Found {len(categories)} categories in database")
    
    result = {"categories": [category.to_dict() for category in categories]}
    
    if chapter and category:
        for cat in result['categories']:
            cat['chapters'] = [ch for ch in cat['chapters'] if ch['id'] == chapter]
    
    if difficulty:
        for cat in result['categories']:
            for ch in cat['chapters']:
                ch['decks'] = [d for d in ch['decks'] if d['difficulty'] == difficulty]
    
    # Count cards for logging
    total_cards = 0
    for cat in result['categories']:
        for ch in cat['chapters']:
            for deck in ch['decks']:
                total_cards += len(deck['cards'])
    
    print(f"[SERVER] Returning {len(result['categories'])} categories with {total_cards} total cards from DATABASE")
    
    return result

def add_flashcard(data):
    """Add a new flashcard to the database"""
    try:
        # Validate required fields
        required_fields = ['category_id', 'category_name', 'chapter_id', 'chapter_name', 
                          'deck_id', 'deck_name', 'difficulty', 'question', 'answer']
        for field in required_fields:
            if field not in data:
                return {"success": False, "error": f"Missing required field: {field}"}
        
        # Check for empty values in critical fields
        for field in ['question', 'answer']:
            if not data[field] or not str(data[field]).strip():
                return {"success": False, "error": f"Field '{field}' cannot be empty"}
        
        try:
            # Check if category exists
            category = Category.query.filter_by(id=data['category_id']).first()
            if not category:
                category = Category(
                    id=data['category_id'],
                    name=data['category_name'],
                    description=data.get('category_description', '')
                )
                db.session.add(category)
                logging.info(f"Created new category: {data['category_id']}")
        
            # Check if chapter exists
            chapter = Chapter.query.filter_by(id=data['chapter_id'], category_id=data['category_id']).first()
            if not chapter:
                chapter = Chapter(
                    id=data['chapter_id'],
                    name=data['chapter_name'],
                    category_id=data['category_id']
                )
                db.session.add(chapter)
                logging.info(f"Created new chapter: {data['chapter_id']}")
        
            # Check if deck exists
            deck = Deck.query.filter_by(id=data['deck_id'], chapter_id=data['chapter_id']).first()
            if not deck:
                deck = Deck(
                    id=data['deck_id'],
                    name=data['deck_name'],
                    difficulty=data['difficulty'],
                    chapter_id=data['chapter_id']
                )
                db.session.add(deck)
                logging.info(f"Created new deck: {data['deck_id']}")
            
            # First commit to ensure all parent entities exist
            db.session.commit()
            
            # Create new flashcard
            flashcard = Flashcard(
                question=data['question'],
                answer=data['answer'],
                deck_id=data['deck_id']
            )
            db.session.add(flashcard)
            db.session.commit()
            
            return {"success": True, "card_id": flashcard.id}
        except Exception as db_error:
            db.session.rollback()
            logging.error(f"Database error in add_flashcard: {str(db_error)}")
            return {"success": False, "error": f"Database error: {str(db_error)}"}
    except Exception as e:
        logging.error(f"Unexpected error in add_flashcard: {str(e)}")
        return {"success": False, "error": f"Server error: {str(e)}"}

def migrate_json_to_db():
    """Migrate existing JSON flashcards to the database"""
    filepath = os.path.join(DATA_DIR, 'flashcards.json')
    if not os.path.exists(filepath):
        return {"success": False, "message": "JSON file not found"}
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    cards_migrated = 0
    
    for cat_data in data.get('categories', []):
        category = Category.query.filter_by(id=cat_data['id']).first()
        if not category:
            category = Category(
                id=cat_data['id'],
                name=cat_data['name'],
                description=cat_data.get('description', '')
            )
            db.session.add(category)
            print(f"Added category: {cat_data['name']}")
        
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
                
                # Make sure to commit the deck so it exists for the cards
                db.session.commit()
                
                for i, card_data in enumerate(deck_data.get('cards', [])):
                    # Create a unique card ID using the deck ID
                    card_id = f"{deck_data['id']}_{card_data.get('id', f'card{i+1}')}"
                    
                    flashcard = Flashcard.query.filter_by(id=card_id).first()
                    if not flashcard:
                        created_at = datetime.utcnow()
                        if 'created_at' in card_data:
                            try:
                                created_at = datetime.fromisoformat(card_data['created_at'])
                            except:
                                pass  # Use default if parsing fails
                            
                        flashcard = Flashcard(
                            id=card_id,
                            question=card_data['question'],
                            answer=card_data['answer'],
                            deck_id=deck_data['id'],
                            created_at=created_at
                        )
                        db.session.add(flashcard)
                        cards_migrated += 1
                        
                        # Commit every 10 cards to avoid large transactions
                        if cards_migrated % 10 == 0:
                            db.session.commit()
                            print(f"Migrated {cards_migrated} cards so far...")
    
    db.session.commit()
    return {"success": True, "message": f"Data migrated successfully. Total cards: {cards_migrated}"}
