from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', backref='category', lazy='dynamic', cascade='all, delete-orphan')
    quizzes = db.relationship('Quiz', backref='category', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'chapters': [chapter.to_dict() for chapter in self.chapters]
        }

class Chapter(db.Model):
    __tablename__ = 'chapters'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.String(50), db.ForeignKey('categories.id'), nullable=False)
    decks = db.relationship('Deck', backref='chapter', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'decks': [deck.to_dict() for deck in self.decks]
        }

class Deck(db.Model):
    __tablename__ = 'decks'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    chapter_id = db.Column(db.String(50), db.ForeignKey('chapters.id'), nullable=False)
    cards = db.relationship('Flashcard', backref='deck', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'difficulty': self.difficulty,
            'cards': [card.to_dict() for card in self.cards]
        }

class Flashcard(db.Model):
    __tablename__ = 'flashcards'
    
    id = db.Column(db.String(50), primary_key=True, default=generate_uuid)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    deck_id = db.Column(db.String(50), db.ForeignKey('decks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'created_at': self.created_at.isoformat()
        }

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(50), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.String(50), db.ForeignKey('categories.id'), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    time_limit_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Store the questions as a JSON string to maintain flexibility
    _questions_json = db.Column('questions_json', db.Text, nullable=False)
    
    @property
    def questions(self):
        """Deserialize questions from JSON"""
        if self._questions_json:
            return json.loads(self._questions_json)
        return []
    
    @questions.setter
    def questions(self, value):
        """Serialize questions to JSON"""
        if isinstance(value, list):
            self._questions_json = json.dumps(value)
        else:
            self._questions_json = value
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category_id': self.category_id,
            'difficulty': self.difficulty,
            'time_limit_minutes': self.time_limit_minutes,
            'questions': self.questions,
            'created_at': self.created_at.isoformat()
        }