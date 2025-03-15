import json
import os
from datetime import datetime

from app.models.database import db, Category, Chapter, Deck, Flashcard

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'data')

def _ensure_data_dir():
    """Ensure the data directory exists"""
    os.makedirs(DATA_DIR, exist_ok=True)

def _load_json(filename):
    """Load JSON data from a file"""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return {}
    with open(filepath, 'r') as f:
        return json.load(f)

def _save_json(data, filename):
    """Save JSON data to a file"""
    _ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

# Flashcards functions
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
    # Check if category exists
    category = Category.query.filter_by(id=data['category_id']).first()
    if not category:
        category = Category(
            id=data['category_id'],
            name=data['category_name'],
            description=data.get('category_description', '')
        )
        db.session.add(category)
    
    # Check if chapter exists
    chapter = Chapter.query.filter_by(id=data['chapter_id'], category_id=data['category_id']).first()
    if not chapter:
        chapter = Chapter(
            id=data['chapter_id'],
            name=data['chapter_name'],
            category_id=data['category_id']
        )
        db.session.add(chapter)
    
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
    
    # Create new flashcard
    flashcard = Flashcard(
        question=data['question'],
        answer=data['answer'],
        deck_id=data['deck_id']
    )
    db.session.add(flashcard)
    db.session.commit()
    
    return {"success": True, "card_id": flashcard.id}

# Migration function for flashcards
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

# Quizzes functions
def get_quizzes(category=None, difficulty=None):
    """Get quizzes, optionally filtered by category and difficulty"""
    print(f"[SERVER] Fetching quizzes from DATABASE. Filters: category={category}, difficulty={difficulty}")
    
    from app.models.database import Quiz
    
    # Start with a base query
    query = Quiz.query
    
    if category:
        query = query.filter_by(category_id=category)
    
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    
    # Execute the query
    quizzes = query.all()
    print(f"[SERVER] Found {len(quizzes)} quizzes in database")
    
    # Format the response
    result = {"quizzes": [quiz.to_dict() for quiz in quizzes]}
    
    # Fallback to JSON if no quizzes found in database
    if not quizzes:
        print("[SERVER] No quizzes found in database, checking JSON fallback")
        data = _load_json('quizzes.json')
        if data and 'quizzes' in data:
            print(f"[SERVER] Found {len(data['quizzes'])} quizzes in JSON file")
            
            # Apply filters to JSON data
            json_quizzes = data['quizzes']
            if category:
                json_quizzes = [q for q in json_quizzes if q['category_id'] == category]
            if difficulty:
                json_quizzes = [q for q in json_quizzes if q['difficulty'] == difficulty]
            
            result = {"quizzes": json_quizzes}
            print(f"[SERVER] Returning {len(json_quizzes)} quizzes from JSON file")
        else:
            print("[SERVER] No quizzes found in JSON file either")
    
    return result

def add_quiz(data):
    """Add a new quiz to the database"""
    print(f"[SERVER] Adding new quiz to database: {data.get('title')}")
    
    from app.models.database import db, Quiz, Category
    
    # Make sure the category exists
    category = Category.query.filter_by(id=data['category_id']).first()
    if not category:
        print(f"[SERVER] Category {data['category_id']} not found, cannot add quiz")
        return {"success": False, "error": f"Category {data['category_id']} does not exist"}
    
    # Create the quiz
    try:
        quiz = Quiz(
            title=data['title'],
            description=data['description'],
            category_id=data['category_id'],
            difficulty=data['difficulty'],
            time_limit_minutes=data.get('time_limit_minutes', 0),
            questions=data['questions']
        )
        
        db.session.add(quiz)
        db.session.commit()
        
        print(f"[SERVER] Quiz added successfully with ID: {quiz.id}")
        return {"success": True, "quiz_id": quiz.id}
    except Exception as e:
        db.session.rollback()
        print(f"[SERVER] Error adding quiz: {str(e)}")
        return {"success": False, "error": str(e)}

def get_quiz(quiz_id):
    """Get a specific quiz by ID"""
    from app.models.database import Quiz
    
    quiz = Quiz.query.get(quiz_id)
    if quiz:
        return quiz.to_dict()
    
    # Fallback to JSON if not found in database
    data = _load_json('quizzes.json')
    if data and 'quizzes' in data:
        for quiz in data['quizzes']:
            if quiz['id'] == quiz_id:
                return quiz
    
    return None

def update_quiz(quiz_id, data):
    """Update an existing quiz"""
    from app.models.database import db, Quiz
    
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return {"success": False, "error": f"Quiz with ID {quiz_id} not found"}
    
    try:
        quiz.title = data.get('title', quiz.title)
        quiz.description = data.get('description', quiz.description)
        quiz.category_id = data.get('category_id', quiz.category_id)
        quiz.difficulty = data.get('difficulty', quiz.difficulty)
        quiz.time_limit_minutes = data.get('time_limit_minutes', quiz.time_limit_minutes)
        
        if 'questions' in data:
            quiz.questions = data['questions']
        
        db.session.commit()
        return {"success": True, "quiz_id": quiz.id}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "error": str(e)}

def delete_quiz(quiz_id):
    """Delete a quiz"""
    from app.models.database import db, Quiz
    
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return {"success": False, "error": f"Quiz with ID {quiz_id} not found"}
    
    try:
        db.session.delete(quiz)
        db.session.commit()
        return {"success": True}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "error": str(e)}

def migrate_quizzes_to_db():
    """Migrate existing JSON quizzes to the database"""
    print("[SERVER] Starting migration of quizzes from JSON to database")
    
    filepath = os.path.join(DATA_DIR, 'quizzes.json')
    if not os.path.exists(filepath):
        print("[SERVER] Quizzes JSON file not found")
        return {"success": False, "message": "Quizzes JSON file not found"}
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    from app.models.database import db, Quiz, Category
    
    if not data or 'quizzes' not in data:
        print("[SERVER] No quizzes found in JSON file")
        return {"success": False, "message": "No quizzes found in JSON file"}
    
    quizzes_migrated = 0
    
    for quiz_data in data.get('quizzes', []):
        # Skip if quiz already exists
        existing_quiz = Quiz.query.filter_by(id=quiz_data['id']).first()
        if existing_quiz:
            print(f"[SERVER] Quiz {quiz_data['id']} already exists, skipping")
            continue
        
        # Check if category exists
        category = Category.query.filter_by(id=quiz_data['category_id']).first()
        if not category:
            print(f"[SERVER] Category {quiz_data['category_id']} not found, creating it")
            # This is a simplified version - in reality, you would need more category info
            category = Category(
                id=quiz_data['category_id'],
                name=f"Category for {quiz_data['title']}",
                description="Auto-created during quiz migration"
            )
            db.session.add(category)
            db.session.commit()
        
        # Create the quiz
        try:
            created_at = datetime.utcnow()
            if 'created_at' in quiz_data:
                try:
                    created_at = datetime.fromisoformat(quiz_data['created_at'])
                except:
                    pass  # Use default if parsing fails
            
            quiz = Quiz(
                id=quiz_data['id'],
                title=quiz_data['title'],
                description=quiz_data.get('description', ''),
                category_id=quiz_data['category_id'],
                difficulty=quiz_data['difficulty'],
                time_limit_minutes=quiz_data.get('time_limit_minutes', 0),
                questions=quiz_data['questions'],
                created_at=created_at
            )
            
            db.session.add(quiz)
            quizzes_migrated += 1
            
            # Commit every few quizzes
            if quizzes_migrated % 5 == 0:
                db.session.commit()
                print(f"[SERVER] Migrated {quizzes_migrated} quizzes so far")
                
        except Exception as e:
            print(f"[SERVER] Error migrating quiz {quiz_data.get('id')}: {str(e)}")
    
    # Final commit
    db.session.commit()
    
    print(f"[SERVER] Quizzes migration complete. Migrated {quizzes_migrated} quizzes")
    return {"success": True, "message": f"Data migrated successfully. Total quizzes: {quizzes_migrated}"}

# Demos functions
def get_demos(category=None):
    """Get interactive demos, optionally filtered by category"""
    data = _load_json('demos.json')
    if not data:
        return {"demos": []}
        
    result = data.copy()
    
    if category:
        result['demos'] = [d for d in result['demos'] if d['category_id'] == category]
                
    return result

def add_demo(data):
    """Add a new interactive demo"""
    demos = _load_json('demos.json')
    if not demos:
        demos = {"demos": []}
    
    # Add new demo
    demo = {
        "id": str(uuid.uuid4()),
        "title": data['title'],
        "description": data['description'],
        "category_id": data['category_id'],
        "html_content": data['html_content'],
        "js_content": data['js_content'],
        "created_at": datetime.now().isoformat()
    }
    demos['demos'].append(demo)
    
    _save_json(demos, 'demos.json')
    return {"success": True, "demo_id": demo['id']}
