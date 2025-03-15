from flask import render_template, request, jsonify, current_app, redirect, url_for, session, flash
from functools import wraps
from . import admin
from app.models.content import add_flashcard, add_quiz, add_demo
from app.models.database import db, Category, Chapter, Deck, Flashcard

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            # Add a debug message
            print("Not logged in, redirecting to login page")
            return redirect(url_for('admin.login'))
        print("User is logged in as admin")
        return f(*args, **kwargs)
    return decorated_function

@admin.route('/login', methods=['GET', 'POST'])
def login():
    # Debug output for the ADMIN_PASSWORD
    print(f"Admin password: {current_app.config['ADMIN_PASSWORD']}")
    
    if request.method == 'POST':
        password = request.form.get('password')
        print(f"Submitted password: {password}")
        if password == current_app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            return redirect(url_for('admin.dashboard'))
        return render_template('admin/login.html', error='Invalid password')
    return render_template('admin/login.html')

@admin.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin.login'))

@admin.route('/')
@admin_required
def dashboard():
    return render_template('admin/dashboard.html')

@admin.route('/flashcards', methods=['GET', 'POST'])
@admin_required
def flashcards():
    if request.method == 'POST':
        try:
            data = request.json
            if not data:
                return jsonify({"success": False, "error": "Invalid JSON data"})
                
            # Validate required fields
            required_fields = ['category_id', 'category_name', 'chapter_id', 'chapter_name', 
                              'deck_id', 'deck_name', 'difficulty', 'question', 'answer']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"success": False, "error": f"Missing required fields: {', '.join(missing_fields)}"})
            
            result = add_flashcard(data)
            return jsonify(result)
        except Exception as e:
            current_app.logger.error(f"Error adding flashcard: {str(e)}")
            return jsonify({"success": False, "error": f"Server error: {str(e)}"})
    
    try:
        # Get all categories, chapters, decks and cards for management
        categories = Category.query.all()
        
        # Prepare data for dropdown menus
        category_data = []
        for category in categories:
            try:
                cat_info = {
                    'id': category.id,
                    'name': category.name,
                    'chapters': []
                }
                
                if hasattr(category, 'chapters'):
                    for chapter in category.chapters:
                        try:
                            chap_info = {
                                'id': chapter.id,
                                'name': chapter.name,
                                'decks': []
                            }
                            
                            if hasattr(chapter, 'decks'):
                                for deck in chapter.decks:
                                    try:
                                        chap_info['decks'].append({
                                            'id': deck.id,
                                            'name': deck.name,
                                            'difficulty': deck.difficulty
                                        })
                                    except Exception as deck_err:
                                        current_app.logger.error(f"Error processing deck {deck.id}: {str(deck_err)}")
                                        continue
                                        
                            cat_info['chapters'].append(chap_info)
                        except Exception as chap_err:
                            current_app.logger.error(f"Error processing chapter {chapter.id}: {str(chap_err)}")
                            continue
                            
                category_data.append(cat_info)
            except Exception as cat_err:
                current_app.logger.error(f"Error processing category {category.id}: {str(cat_err)}")
                continue
        
        return render_template('admin/flashcards.html', categories=categories, category_data=category_data)
    except Exception as e:
        current_app.logger.error(f"Error loading flashcards page: {str(e)}")
        flash(f"Error loading page: {str(e)}", "danger")
        return render_template('admin/error.html', error=str(e))

@admin.route('/flashcards/edit/<card_id>', methods=['GET', 'POST'])
@admin_required
def edit_flashcard(card_id):
    try:
        card = Flashcard.query.get(card_id)
        if not card:
            flash(f"Flashcard with ID {card_id} not found", "danger")
            return redirect(url_for('admin.flashcards'))
        
        if request.method == 'POST':
            try:
                # Validate form data
                if 'question' not in request.form or not request.form['question'].strip():
                    flash("Question field is required", "danger")
                    return render_template('admin/edit_flashcard.html', card=card)
                    
                if 'answer' not in request.form or not request.form['answer'].strip():
                    flash("Answer field is required", "danger")
                    return render_template('admin/edit_flashcard.html', card=card)
                
                card.question = request.form['question']
                card.answer = request.form['answer']
                
                db.session.commit()
                flash('Flashcard updated successfully', 'success')
                return redirect(url_for('admin.flashcards'))
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Error updating flashcard {card_id}: {str(e)}")
                flash(f"Error updating flashcard: {str(e)}", "danger")
                return render_template('admin/edit_flashcard.html', card=card)
        
        return render_template('admin/edit_flashcard.html', card=card)
    except Exception as e:
        current_app.logger.error(f"Error loading flashcard edit page: {str(e)}")
        flash(f"Error loading flashcard: {str(e)}", "danger")
        return redirect(url_for('admin.flashcards'))

@admin.route('/flashcards/delete/<card_id>', methods=['POST'])
@admin_required
def delete_flashcard(card_id):
    try:
        card = Flashcard.query.get(card_id)
        if not card:
            flash(f"Flashcard with ID {card_id} not found", "danger")
            return redirect(url_for('admin.flashcards'))
            
        try:
            db.session.delete(card)
            db.session.commit()
            flash('Flashcard deleted successfully', 'success')
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting flashcard {card_id}: {str(e)}")
            flash(f"Error deleting flashcard: {str(e)}", "danger")
    except Exception as e:
        current_app.logger.error(f"Error finding flashcard {card_id}: {str(e)}")
        flash(f"Error finding flashcard: {str(e)}", "danger")
        
    return redirect(url_for('admin.flashcards'))

@admin.route('/categories')
@admin_required
def categories():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)

@admin.route('/chapters', methods=['GET', 'POST'])
@admin_required
def chapters():
    if request.method == 'POST':
        data = request.json
        
        try:
            # Check if chapter already exists
            existing_chapter = Chapter.query.filter_by(id=data['id']).first()
            if existing_chapter:
                return jsonify({"success": False, "error": "Chapter ID already exists"})
            
            # Verify category exists
            category = Category.query.filter_by(id=data['category_id']).first()
            if not category:
                return jsonify({"success": False, "error": "Category not found"})
            
            # Create new chapter
            chapter = Chapter(
                id=data['id'],
                name=data['name'],
                category_id=data['category_id']
            )
            db.session.add(chapter)
            db.session.commit()
            
            return jsonify({"success": True, "chapter_id": chapter.id})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)})
    
    chapters = Chapter.query.all()
    categories = Category.query.all()
    return render_template('admin/chapters.html', chapters=chapters, categories=categories)

@admin.route('/chapters/edit/<chapter_id>', methods=['POST'])
@admin_required
def edit_chapter(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    data = request.json
    
    try:
        chapter.name = data.get('name', chapter.name)
        chapter.category_id = data.get('category_id', chapter.category_id)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)})

@admin.route('/chapters/delete/<chapter_id>', methods=['POST'])
@admin_required
def delete_chapter(chapter_id):
    chapter = Chapter.query.get_or_404(chapter_id)
    
    try:
        db.session.delete(chapter)
        db.session.commit()
        flash('Chapter deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting chapter: {str(e)}', 'danger')
    
    return redirect(url_for('admin.chapters'))

@admin.route('/decks', methods=['GET', 'POST'])
@admin_required
def decks():
    if request.method == 'POST':
        data = request.json
        
        try:
            # Check if deck already exists
            existing_deck = Deck.query.filter_by(id=data['id']).first()
            if existing_deck:
                return jsonify({"success": False, "error": "Deck ID already exists"})
            
            # Verify chapter exists
            chapter = Chapter.query.filter_by(id=data['chapter_id']).first()
            if not chapter:
                return jsonify({"success": False, "error": "Chapter not found"})
            
            # Create new deck
            deck = Deck(
                id=data['id'],
                name=data['name'],
                difficulty=data['difficulty'],
                chapter_id=data['chapter_id']
            )
            db.session.add(deck)
            db.session.commit()
            
            return jsonify({"success": True, "deck_id": deck.id})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)})
    
    decks = Deck.query.all()
    chapters = Chapter.query.all()
    return render_template('admin/decks.html', decks=decks, chapters=chapters)

@admin.route('/decks/edit/<deck_id>', methods=['POST'])
@admin_required
def edit_deck(deck_id):
    deck = Deck.query.get_or_404(deck_id)
    data = request.json
    
    try:
        deck.name = data.get('name', deck.name)
        deck.difficulty = data.get('difficulty', deck.difficulty)
        deck.chapter_id = data.get('chapter_id', deck.chapter_id)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)})

@admin.route('/decks/delete/<deck_id>', methods=['POST'])
@admin_required
def delete_deck(deck_id):
    deck = Deck.query.get_or_404(deck_id)
    
    try:
        db.session.delete(deck)
        db.session.commit()
        flash('Deck deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting deck: {str(e)}', 'danger')
    
    return redirect(url_for('admin.decks'))

@admin.route('/quizzes', methods=['GET', 'POST'])
@admin_required
def quizzes():
    from app.models.content import get_quizzes, add_quiz
    from app.models.database import Quiz
    
    if request.method == 'POST':
        try:
            data = request.json
            if not data:
                return jsonify({"success": False, "error": "Invalid JSON data"})
                
            # Validate required fields
            required_fields = ['title', 'description', 'category_id', 
                             'difficulty', 'questions']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({"success": False, 
                              "error": f"Missing required fields: {', '.join(missing_fields)}"})
            
            # Validate that questions is a list and not empty
            if not isinstance(data.get('questions', []), list) or not data.get('questions', []):
                return jsonify({"success": False, 
                              "error": "Questions must be a non-empty list"})
            
            result = add_quiz(data)
            return jsonify(result)
        except Exception as e:
            current_app.logger.error(f"Error adding quiz: {str(e)}")
            return jsonify({"success": False, "error": f"Server error: {str(e)}"})
    
    try:
        # Use get_quizzes() function instead of direct database query
        # This will include the JSON fallback logic
        quizzes_data = get_quizzes()
        if not quizzes_data:
            all_quizzes = []
        else:
            all_quizzes = quizzes_data.get('quizzes', [])
        
        return render_template('admin/quizzes.html', quizzes=all_quizzes)
    except Exception as e:
        current_app.logger.error(f"Error loading quizzes page: {str(e)}")
        flash(f"Error loading page: {str(e)}", "danger")
        return render_template('admin/error.html', error=str(e))

@admin.route('/quizzes/delete/<quiz_id>', methods=['POST'])
@admin_required
def delete_quiz(quiz_id):
    from app.models.content import delete_quiz as content_delete_quiz
    
    try:
        if not quiz_id:
            flash('Invalid quiz ID', 'danger')
            return redirect(url_for('admin.quizzes'))
        
        result = content_delete_quiz(quiz_id)
        
        # Check if result is a dictionary
        if not isinstance(result, dict):
            flash('Error deleting quiz: Unexpected response from server', 'danger')
            return redirect(url_for('admin.quizzes'))
            
        if result.get('success'):
            flash('Quiz deleted successfully', 'success')
        else:
            flash(f'Error deleting quiz: {result.get("error", "Unknown error")}', 'danger')
    except Exception as e:
        current_app.logger.error(f"Error deleting quiz {quiz_id}: {str(e)}")
        flash(f'Error deleting quiz: {str(e)}', 'danger')
    
    return redirect(url_for('admin.quizzes'))

@admin.route('/quizzes/edit/<quiz_id>', methods=['GET', 'POST'])
@admin_required
def edit_quiz(quiz_id):
    from app.models.database import Quiz
    from app.models.content import update_quiz, get_quiz
    
    try:
        # First try to get the quiz from the database or fallback to JSON
        quiz = Quiz.query.get(quiz_id)
        
        # If not found in database, try to get from content module
        if not quiz:
            quiz_data = get_quiz(quiz_id)
            if not quiz_data:
                flash(f"Quiz with ID {quiz_id} not found", "danger")
                return redirect(url_for('admin.quizzes'))
                
            # Create a temporary Quiz object for the template
            quiz = Quiz(
                id=quiz_data['id'],
                title=quiz_data['title'],
                description=quiz_data.get('description', ''),
                category_id=quiz_data['category_id'],
                difficulty=quiz_data['difficulty'],
                time_limit_minutes=quiz_data.get('time_limit_minutes', 0),
                questions=quiz_data['questions']
            )
        
        if request.method == 'POST':
            try:
                data = request.json
                if not data:
                    return jsonify({"success": False, "error": "Invalid JSON data"})
                
                # Validate required fields if they are present in the data
                if data and 'questions' in data:
                    if not isinstance(data['questions'], list):
                        return jsonify({"success": False, "error": "Questions must be a list"})
                
                result = update_quiz(quiz_id, data)
                return jsonify(result)
            except Exception as e:
                current_app.logger.error(f"Error updating quiz: {str(e)}")
                return jsonify({"success": False, "error": f"Server error: {str(e)}"})
        
        return render_template('admin/edit_quiz.html', quiz=quiz)
    except Exception as e:
        current_app.logger.error(f"Error loading quiz edit page: {str(e)}")
        flash(f"Error loading quiz: {str(e)}", "danger")
        return redirect(url_for('admin.quizzes'))

@admin.route('/demos', methods=['GET', 'POST'])
@admin_required
def demos():
    if request.method == 'POST':
        data = request.json
        result = add_demo(data)
        return jsonify(result)
    return render_template('admin/demos.html')

@admin.route('/migrate-data', methods=['GET', 'POST'])
@admin_required
def migrate_data():
    from app.models.content import migrate_json_to_db
    
    if request.method == 'POST':
        result = migrate_json_to_db()
        if result['success']:
            flash('Data migration completed successfully', 'success')
        else:
            flash(f'Data migration failed: {result["message"]}', 'danger')
        return redirect(url_for('admin.dashboard'))
    
    return render_template('admin/migrate.html')
