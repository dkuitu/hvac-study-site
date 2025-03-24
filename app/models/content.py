# This file is now a module wrapper for backward compatibility
# Import all content-related functions from the content/ submodules

from app.models.content import (
    DATA_DIR, load_json, save_json, ensure_data_dir,
    get_flashcards, add_flashcard, migrate_json_to_db,
    get_quizzes, add_quiz, get_quiz, update_quiz, delete_quiz, migrate_quizzes_to_db,
    get_demos, add_demo
)

# The imports above make all these functions available when importing from this module
# This maintains backwards compatibility with existing code that imports from app.models.content
