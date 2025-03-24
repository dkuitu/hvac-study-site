// Flashcards global state management

// Global state object
let flashcardsData = null;
let currentCategory = 'all';
let currentDifficulty = 'all';
let currentDeck = null;
let currentCards = [];
let currentCardIndex = 0;
let isShowingAnswer = false;
let searchTerm = '';

// Export state values and functions to modify them
export {
    flashcardsData,
    currentCategory,
    currentDifficulty,
    currentDeck,
    currentCards,
    currentCardIndex,
    isShowingAnswer,
    searchTerm,
    // Functions to update state will be added here
};
