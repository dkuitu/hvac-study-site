from app import create_app
from app.models.content import migrate_json_to_db, migrate_quizzes_to_db
from app.models.database import db

if __name__ == '__main__':
    app = create_app('development')
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created")
        
        # Migrate flashcards data
        print("Migrating flashcards...")
        result_flashcards = migrate_json_to_db()
        print(result_flashcards['message'])
        
        # Migrate quizzes data
        print("\nMigrating quizzes...")
        result_quizzes = migrate_quizzes_to_db()
        print(result_quizzes['message'])