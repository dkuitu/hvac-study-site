from flask import render_template, Blueprint, send_from_directory
from flask import current_app

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('main/index.html')

@main.route('/flashcards')
def flashcards():
    return render_template('main/flashcards.html')

@main.route('/quizzes')
def quizzes():
    return render_template('main/quizzes.html')

@main.route('/demos')
def demos():
    return render_template('main/demos.html')

@main.route('/faq')
def faq():
    return render_template('main/faq.html')

@main.route('/test')
def test():
    return render_template('main/test.html')

@main.route('/sitemap.xml')
def sitemap():
    return send_from_directory(current_app.static_folder, 'sitemap.xml')

@main.route('/ads.txt')
def ads_txt():
    """Serve ads.txt file directly from the static directory"""
    return send_from_directory(current_app.static_folder, 'ads.txt')

@main.route('/robots.txt')
def robots():
    return send_from_directory(current_app.static_folder, 'robots.txt')
