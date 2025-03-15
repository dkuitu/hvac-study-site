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
        data = request.json
        result = add_flashcard(data)
        return jsonify(result)
        
    # Get all categories, chapters, decks and cards for management
    categories = Category.query.all()
    
    # Prepare data for dropdown menus
    category_data = []
    for category in categories:
        cat_info = {
            'id': category.id,
            'name': category.name,
            'chapters': []
        }
        for chapter in category.chapters:
            chap_info = {
                'id': chapter.id,
                'name': chapter.name,
                'decks': []
            }
            for deck in chapter.decks:
                chap_info['decks'].append({
                    'id': deck.id,
                    'name': deck.name,
                    'difficulty': deck.difficulty
                })
            cat_info['chapters'].append(chap_info)
        category_data.append(cat_info)
    
    return render_template('admin/flashcards.html', categories=categories, category_data=category_data)

@admin.route('/flashcards/edit/<card_id>', methods=['GET', 'POST'])
@admin_required
def edit_flashcard(card_id):
    card = Flashcard.query.get_or_404(card_id)
    
    if request.method == 'POST':
        card.question = request.form['question']
        card.answer = request.form['answer']
        db.session.commit()
        flash('Flashcard updated successfully', 'success')
        return redirect(url_for('admin.flashcards'))
    
    return render_template('admin/edit_flashcard.html', card=card)

@admin.route('/flashcards/delete/<card_id>', methods=['POST'])
@admin_required
def delete_flashcard(card_id):
    card = Flashcard.query.get_or_404(card_id)
    db.session.delete(card)
    db.session.commit()
    flash('Flashcard deleted successfully', 'success')
    return redirect(url_for('admin.flashcards'))

@admin.route('/categories')
@admin_required
def categories():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)

@admin.route('/chapters')
@admin_required
def chapters():
    chapters = Chapter.query.all()
    categories = Category.query.all()
    return render_template('admin/chapters.html', chapters=chapters, categories=categories)

@admin.route('/decks')
@admin_required
def decks():
    decks = Deck.query.all()
    chapters = Chapter.query.all()
    return render_template('admin/decks.html', decks=decks, chapters=chapters)

@admin.route('/quizzes', methods=['GET', 'POST'])
@admin_required
def quizzes():
    from app.models.content import get_quizzes, add_quiz
    from app.models.database import Quiz
    
    if request.method == 'POST':
        data = request.json
        result = add_quiz(data)
        return jsonify(result)
    
    # Use get_quizzes() function instead of direct database query
    # This will include the JSON fallback logic
    quizzes_data = get_quizzes()
    all_quizzes = quizzes_data.get('quizzes', [])
    
    return render_template('admin/quizzes.html', quizzes=all_quizzes)

@admin.route('/quizzes/delete/<quiz_id>', methods=['POST'])
@admin_required
def delete_quiz(quiz_id):
    from app.models.content import delete_quiz as content_delete_quiz
    
    result = content_delete_quiz(quiz_id)
    if result['success']:
        flash('Quiz deleted successfully', 'success')
    else:
        flash(f'Error deleting quiz: {result.get("error", "Unknown error")}', 'danger')
    
    return redirect(url_for('admin.quizzes'))

@admin.route('/quizzes/edit/<quiz_id>', methods=['GET', 'POST'])
@admin_required
def edit_quiz(quiz_id):
    from app.models.database import Quiz
    from app.models.content import update_quiz
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    if request.method == 'POST':
        data = request.json
        result = update_quiz(quiz_id, data)
        return jsonify(result)
    
    return render_template('admin/edit_quiz.html', quiz=quiz)

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
