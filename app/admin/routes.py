from flask import render_template, request, jsonify, current_app, redirect, url_for, session, flash
from functools import wraps
from . import admin
from app.models.content import add_flashcard, add_quiz, add_demo
from app.models.database import db, Category, Chapter, Deck, Flashcard

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function

@admin.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
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
    return render_template('admin/flashcards.html', categories=categories)

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
    if request.method == 'POST':
        data = request.json
        result = add_quiz(data)
        return jsonify(result)
    return render_template('admin/quizzes.html')

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
