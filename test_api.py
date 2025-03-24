from app import create_app
import requests
import json

app = create_app('development')

with app.app_context():
    # Make request to the API endpoint
    try:
        response = requests.get('http://127.0.0.1:5001/api/flashcards')
        if response.status_code == 200:
            data = response.json()
            cat_count = len(data.get('categories', []))
            
            # Count total cards
            total_cards = 0
            for category in data.get('categories', []):
                for chapter in category.get('chapters', []):
                    for deck in chapter.get('decks', []):
                        total_cards += len(deck.get('cards', []))
            
            print(f"API SUCCESS: Retrieved {cat_count} categories with {total_cards} total cards")
            print("First category:", data.get('categories', [])[0]['name'] if data.get('categories') else "None")
        else:
            print(f"API ERROR: Status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR connecting to API: {str(e)}")
        
    # Test the file fallback
    try:
        with open('app/static/data/flashcards.json', 'r') as f:
            json_data = json.load(f)
            json_cat_count = len(json_data.get('categories', []))
            
            # Count total cards
            json_total_cards = 0
            for category in json_data.get('categories', []):
                for chapter in category.get('chapters', []):
                    for deck in chapter.get('decks', []):
                        json_total_cards += len(deck.get('cards', []))
            
            print(f"\nJSON FALLBACK: {json_cat_count} categories with {json_total_cards} total cards")
    except Exception as e:
        print(f"ERROR reading JSON file: {str(e)}")