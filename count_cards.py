import json
import os

# Load the JSON file
with open('app/static/data/flashcards.json') as f:
    data = json.load(f)

card_count = 0
cards_per_deck = []

# Count cards in each deck
for cat in data['categories']:
    for ch in cat['chapters']:
        for deck in ch['decks']:
            deck_cards = len(deck['cards'])
            card_count += deck_cards
            cards_per_deck.append((cat['name'], ch['name'], deck['name'], deck_cards))

# Print totals
print(f'Total cards in JSON: {card_count}')

# Print breakdown
print("\nCards per deck:")
for cat_name, ch_name, deck_name, count in cards_per_deck:
    if count > 0:
        print(f"{cat_name} > {ch_name} > {deck_name}: {count} cards")