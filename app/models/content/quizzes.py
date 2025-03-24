import logging
from datetime import datetime
import json

from app.models.database import db, Category, Quiz
from app.models.content.helpers import load_json, save_json, DATA_DIR
import os

def get_quizzes(category=None, difficulty=None):
    """Get quizzes, optionally filtered by category and difficulty"""
    logging.info(f"Fetching quizzes. Filters: category={category}, difficulty={difficulty}")
    
    try:
        try:
            # Start with a base query
            query = Quiz.query
            
            if category:
                query = query.filter_by(category_id=category)
            
            if difficulty:
                query = query.filter_by(difficulty=difficulty)
            
            # Execute the query
            quizzes = query.all()
            logging.info(f"Found {len(quizzes)} quizzes in database")
            
            # Format the response safely
            result = {"quizzes": []}
            for quiz in quizzes:
                try:
                    quiz_dict = quiz.to_dict()
                    result["quizzes"].append(quiz_dict)
                except Exception as quiz_err:
                    logging.error(f"Error serializing quiz {quiz.id}: {str(quiz_err)}")
                    # Add minimal info for the quiz
                    result["quizzes"].append({
                        "id": quiz.id,
                        "title": getattr(quiz, "title", "Error Loading Quiz"),
                        "description": "",
                        "questions": []
                    })
            
            # Fallback to JSON if no quizzes found in database
            if not quizzes:
                logging.info("No quizzes found in database, checking JSON fallback")
                try:
                    data = load_json('quizzes.json')
                    if data and 'quizzes' in data and isinstance(data['quizzes'], list):
                        logging.info(f"Found {len(data['quizzes'])} quizzes in JSON file")
                        
                        # Apply filters to JSON data
                        json_quizzes = data['quizzes']
                        if category:
                            json_quizzes = [q for q in json_quizzes if q.get('category_id') == category]
                        if difficulty:
                            json_quizzes = [q for q in json_quizzes if q.get('difficulty') == difficulty]
                        
                        result = {"quizzes": json_quizzes}
                        logging.info(f"Returning {len(json_quizzes)} quizzes from JSON file")
                    else:
                        logging.info("No quizzes found in JSON file either")
                except Exception as json_err:
                    logging.error(f"Error reading JSON file: {str(json_err)}")
            
            return result
        except Exception as db_err:
            logging.error(f"Database error in get_quizzes: {str(db_err)}")
            
            # Try JSON fallback in case of database error
            try:
                data = load_json('quizzes.json')
                if data and 'quizzes' in data and isinstance(data['quizzes'], list):
                    json_quizzes = data['quizzes']
                    if category:
                        json_quizzes = [q for q in json_quizzes if q.get('category_id') == category]
                    if difficulty:
                        json_quizzes = [q for q in json_quizzes if q.get('difficulty') == difficulty]
                    
                    return {"quizzes": json_quizzes}
                else:
                    return {"quizzes": [], "error": "No quizzes found"}
            except Exception as json_err:
                logging.error(f"JSON fallback error: {str(json_err)}")
                return {"quizzes": [], "error": f"Server error: {str(db_err)}"}
    except Exception as e:
        logging.error(f"Unexpected error in get_quizzes: {str(e)}")
        return {"quizzes": [], "error": f"Server error: {str(e)}"}

def add_quiz(data):
    """Add a new quiz to the database"""
    print(f"[SERVER] Adding new quiz to database: {data.get('title')}")
    
    # Make sure the category exists
    category = Category.query.filter_by(id=data['category_id']).first()
    if not category:
        print(f"[SERVER] Category {data['category_id']} not found, creating category")
        # Create the category if it doesn't exist
        category = Category(
            id=data['category_id'],
            name=f"Quiz Category: {data['category_id']}",
            description="Auto-created for quiz"
        )
        db.session.add(category)
        db.session.commit()
    
    # Create the quiz
    try:
        # Ensure questions has the correct format
        questions_data = data['questions']
        for question in questions_data:
            # Make sure each question has at least one correct answer
            has_correct = False
            for answer in question.get('answers', []):
                if answer.get('correct'):
                    has_correct = True
                    break
                    
            if not has_correct and question.get('type') != 'short_answer':
                raise ValueError(f"Question '{question.get('text', '?')}' must have at least one correct answer")
        
        quiz = Quiz(
            title=data['title'],
            description=data['description'],
            category_id=data['category_id'],
            difficulty=data['difficulty'],
            time_limit_minutes=data.get('time_limit_minutes', 0),
            questions=questions_data
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
    quiz = Quiz.query.get(quiz_id)
    if quiz:
        return quiz.to_dict()
    
    # Fallback to JSON if not found in database
    data = load_json('quizzes.json')
    if data and 'quizzes' in data:
        for quiz in data['quizzes']:
            if quiz['id'] == quiz_id:
                return quiz
    
    return None

def update_quiz(quiz_id, data):
    """Update an existing quiz"""
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
