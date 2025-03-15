from app import create_app
from app.models.database import db, Category, Chapter, Deck, Flashcard

app = create_app()

with app.app_context():
    categories = Category.query.all()
    
    print(f"Total Categories: {len(categories)}")
    
    for category in categories:
        print(f"\nCategory: {category.name}")
        print(f"  Chapters: {category.chapters.count()}")
        
        for chapter in category.chapters:
            print(f"  - Chapter: {chapter.name}")
            print(f"    Decks: {chapter.decks.count()}")
            
            for deck in chapter.decks:
                print(f"    - Deck: {deck.name} ({deck.difficulty})")
                print(f"      Cards: {deck.cards.count()}")