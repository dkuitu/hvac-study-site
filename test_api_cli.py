from app import create_app
import json
import sys

app = create_app('development')

with app.app_context():
    from app.models.content import get_flashcards
    
    print("Testing API endpoint directly...")
    result = get_flashcards()
    
    # Count total categories
    cat_count = len(result.get('categories', []))
    
    # Count total cards
    total_cards = 0
    for category in result.get('categories', []):
        for chapter in category.get('chapters', []):
            for deck in chapter.get('decks', []):
                total_cards += len(deck.get('cards', []))
    
    print(f"API SUCCESS: Retrieved {cat_count} categories with {total_cards} total cards")
    
    if cat_count > 0:
        first_cat = result.get('categories', [])[0]
        print(f"First category: {first_cat['name']}")
        
        if len(first_cat.get('chapters', [])) > 0:
            first_chapter = first_cat['chapters'][0]
            print(f"First chapter: {first_chapter['name']}")
            
            if len(first_chapter.get('decks', [])) > 0:
                first_deck = first_chapter['decks'][0]
                print(f"First deck: {first_deck['name']}")
                
                if len(first_deck.get('cards', [])) > 0:
                    first_card = first_deck['cards'][0]
                    print(f"First card question: {first_card['question']}")
                    print(f"First card answer: {first_card['answer']}")
    
    # Test the JSON fallback
    try:
        print("\nTesting JSON fallback...")
        with open('app/static/data/flashcards.json', 'r') as f:
            json_data = json.load(f)
            json_cat_count = len(json_data.get('categories', []))
            
            # Count total cards
            json_total_cards = 0
            for category in json_data.get('categories', []):
                for chapter in category.get('chapters', []):
                    for deck in chapter.get('decks', []):
                        json_total_cards += len(deck.get('cards', []))
            
            print(f"JSON FALLBACK: {json_cat_count} categories with {json_total_cards} total cards")
    except Exception as e:
        print(f"ERROR reading JSON file: {str(e)}")
    
    print("\nAPI TEST COMPLETED.")