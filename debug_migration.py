import json
import os
from app import create_app
from app.models.database import db, Category, Chapter, Deck, Flashcard
from datetime import datetime

app = create_app('development')

DATA_DIR = os.path.join('app', 'static', 'data')

with app.app_context():
    # Create tables
    db.create_all()
    
    # Load JSON data
    filepath = os.path.join(DATA_DIR, 'flashcards.json')
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Process each category, chapter, deck and card
    cards_migrated = 0
    problem_cards = []
    
    for cat_data in data.get('categories', []):
        print(f"\nCategory: {cat_data['name']}")
        
        category = Category.query.filter_by(id=cat_data['id']).first()
        if not category:
            category = Category(
                id=cat_data['id'],
                name=cat_data['name'],
                description=cat_data.get('description', '')
            )
            db.session.add(category)
            db.session.commit()
            print(f"  Added category: {cat_data['name']}")
        
        for ch_data in cat_data.get('chapters', []):
            print(f"  Chapter: {ch_data['name']}")
            
            chapter = Chapter.query.filter_by(id=ch_data['id'], category_id=cat_data['id']).first()
            if not chapter:
                chapter = Chapter(
                    id=ch_data['id'],
                    name=ch_data['name'],
                    category_id=cat_data['id']
                )
                db.session.add(chapter)
                db.session.commit()
                print(f"    Added chapter")
            
            for deck_data in ch_data.get('decks', []):
                print(f"    Deck: {deck_data['name']} ({len(deck_data.get('cards', []))} cards)")
                
                deck = Deck.query.filter_by(id=deck_data['id'], chapter_id=ch_data['id']).first()
                if not deck:
                    deck = Deck(
                        id=deck_data['id'],
                        name=deck_data['name'],
                        difficulty=deck_data['difficulty'],
                        chapter_id=ch_data['id']
                    )
                    db.session.add(deck)
                    db.session.commit()
                    print(f"      Added deck")
                
                # Try to insert each card
                for i, card_data in enumerate(deck_data.get('cards', [])):
                    # Create a unique card ID using the deck ID
                    card_id = f"{deck_data['id']}_{card_data.get('id', f'card{i+1}')}"
                    
                    # Check if card already exists
                    existing = Flashcard.query.filter_by(id=card_id).first()
                    if existing:
                        print(f"      Card {card_id} already exists, skipping")
                        continue
                    
                    try:
                        flashcard = Flashcard(
                            id=card_id,
                            question=card_data['question'],
                            answer=card_data['answer'],
                            deck_id=deck_data['id'],
                            created_at=datetime.utcnow()
                        )
                        db.session.add(flashcard)
                        db.session.commit()
                        cards_migrated += 1
                        print(f"      Added card {card_id}")
                    except Exception as e:
                        problem_cards.append((deck_data['id'], card_id, str(e)))
                        print(f"      ERROR adding card {card_id}: {str(e)}")
                        db.session.rollback()
    
    print(f"\nMigration complete. Total cards added: {cards_migrated}")
    
    if problem_cards:
        print("\nProblem cards:")
        for deck_id, card_id, error in problem_cards:
            print(f"Deck: {deck_id}, Card: {card_id}, Error: {error}")