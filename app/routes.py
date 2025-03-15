from flask import render_template, Blueprint

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
