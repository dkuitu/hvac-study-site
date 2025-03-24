from app import create_app
from app.models.database import db, Category, Chapter, Deck, Flashcard

app = create_app('development')

with app.app_context():
    # Count categories
    cat_count = db.session.query(Category).count()
    print(f"Categories: {cat_count}")
    
    # Count chapters
    chap_count = db.session.query(Chapter).count()
    print(f"Chapters: {chap_count}")
    
    # Count decks
    deck_count = db.session.query(Deck).count()
    print(f"Decks: {deck_count}")
    
    # Count flashcards
    card_count = db.session.query(Flashcard).count()
    print(f"Flashcards: {card_count}")
    
    if cat_count == 0 or card_count == 0:
        print("WARNING: Database appears to be empty!")
    else:
        print("Database has data. App should work correctly.")
        
        # Print first category and its data
        first_cat = db.session.query(Category).first()
        if first_cat:
            print(f"\nSample Category: {first_cat.name}")
            print(f"Chapters: {first_cat.chapters.count()}")
            if first_cat.chapters.count() > 0:
                first_chap = first_cat.chapters.first()
                print(f"Sample Chapter: {first_chap.name}")
                print(f"Decks: {first_chap.decks.count()}")
                if first_chap.decks.count() > 0:
                    first_deck = first_chap.decks.first()
                    print(f"Sample Deck: {first_deck.name}")
                    print(f"Cards: {first_deck.cards.count()}")
                    if first_deck.cards.count() > 0:
                        first_card = first_deck.cards.first()
                        print(f"Sample Card Question: {first_card.question}")