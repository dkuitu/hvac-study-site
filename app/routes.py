from flask import render_template, Blueprint, send_from_directory
from flask import current_app, request
import datetime

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('main/index.html', current_year=datetime.datetime.now().year)

@main.route('/flashcards')
def flashcards():
    return render_template('main/flashcards.html', current_year=datetime.datetime.now().year)

@main.route('/quizzes')
def quizzes():
    return render_template('main/quizzes.html', current_year=datetime.datetime.now().year)

@main.route('/demos')
def demos():
    return render_template('main/demos.html', current_year=datetime.datetime.now().year)

@main.route('/faq')
def faq():
    return render_template('main/faq.html', current_year=datetime.datetime.now().year)

@main.route('/test')
def test():
    return render_template('main/test.html', current_year=datetime.datetime.now().year)

# SEO Routes
@main.route('/ads.txt')
def ads_txt():
    """Serve ads.txt file directly from the static directory"""
    return send_from_directory(current_app.static_folder, 'ads.txt')

@main.route('/robots.txt')
def robots_txt():
    """Serve robots.txt for search engine crawlers"""
    return send_from_directory(current_app.static_folder, 'robots.txt')

@main.route('/sitemap.xml')
def sitemap_xml():
    """Serve sitemap.xml for search engines"""
    return send_from_directory(current_app.static_folder, 'sitemap.xml')
