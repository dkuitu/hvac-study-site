from flask import jsonify, request
from . import api
from app.models.content import (
    get_flashcards, add_flashcard, 
    get_quizzes, add_quiz, get_quiz, update_quiz, delete_quiz,
    get_demos, 
    migrate_json_to_db, migrate_quizzes_to_db
)

@api.route('/flashcards')
def flashcards():
    category = request.args.get('category')
    chapter = request.args.get('chapter')
    difficulty = request.args.get('difficulty')
    
    print(f"[API] Received request for /api/flashcards with params: category={category}, chapter={chapter}, difficulty={difficulty}")
    
    result = get_flashcards(category, chapter, difficulty)
    
    print(f"[API] Responding to /api/flashcards request")
    return jsonify(result)

@api.route('/flashcards', methods=['POST'])
def create_flashcard():
    data = request.get_json()
    return jsonify(add_flashcard(data))

@api.route('/migrate-flashcards', methods=['POST'])
def migrate_flashcards():
    return jsonify(migrate_json_to_db())

@api.route('/quizzes')
def quizzes():
    category = request.args.get('category')
    difficulty = request.args.get('difficulty')
    
    print(f"[API] Received request for /api/quizzes with params: category={category}, difficulty={difficulty}")
    
    result = get_quizzes(category, difficulty)
    
    print(f"[API] Responding to /api/quizzes request")
    return jsonify(result)

@api.route('/quizzes/<quiz_id>')
def get_quiz_by_id(quiz_id):
    print(f"[API] Received request for /api/quizzes/{quiz_id}")
    
    quiz = get_quiz(quiz_id)
    if quiz:
        return jsonify(quiz)
    return jsonify({"error": "Quiz not found"}), 404

@api.route('/quizzes', methods=['POST'])
def create_quiz():
    print(f"[API] Received POST request for /api/quizzes")
    
    data = request.get_json()
    result = add_quiz(data)
    
    if result.get('success'):
        return jsonify(result)
    return jsonify(result), 400

@api.route('/quizzes/<quiz_id>', methods=['PUT'])
def update_quiz_by_id(quiz_id):
    print(f"[API] Received PUT request for /api/quizzes/{quiz_id}")
    
    data = request.get_json()
    result = update_quiz(quiz_id, data)
    
    if result.get('success'):
        return jsonify(result)
    return jsonify(result), 400

@api.route('/quizzes/<quiz_id>', methods=['DELETE'])
def delete_quiz_by_id(quiz_id):
    print(f"[API] Received DELETE request for /api/quizzes/{quiz_id}")
    
    result = delete_quiz(quiz_id)
    
    if result.get('success'):
        return jsonify(result)
    return jsonify(result), 400

@api.route('/migrate-quizzes', methods=['POST'])
def migrate_quizzes():
    print(f"[API] Received POST request for /api/migrate-quizzes")
    return jsonify(migrate_quizzes_to_db())

@api.route('/demos')
def demos():
    category = request.args.get('category')
    print(f"[API] Received request for /api/demos with params: category={category}")
    return jsonify(get_demos(category))
