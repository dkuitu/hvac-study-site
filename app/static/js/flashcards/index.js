// Main flashcards module that imports and coordinates all components
import { fetchFlashcardsData } from './api.js';
import { loadDecks } from './deck-loader.js';
import { startDeckStudyMode, startFirstAvailableDeckStudyMode, activateStudyMode } from './study-mode.js';

// Initialize flashcards functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flashcards page initialized');
    
    // Global state
    let flashcardsData = null;
    let currentCategory = 'all';
    let currentDifficulty = 'all';
    let currentDeck = null;
    let currentCards = [];
    let currentCardIndex = 0;
    let isShowingAnswer = false;
    let searchTerm = '';
    
    // DOM elements
    const decksContainer = document.getElementById('decks-container');
    const flashcardsContainer = document.getElementById('flashcards-container');
    const noResultsMessage = document.getElementById('no-results');
    const instructionsMessage = document.getElementById('instructions');
    const studyModeBtn = document.getElementById('study-mode-btn');
    const categoryFilterItems = document.querySelectorAll('#category-filter .dropdown-item');
    const difficultyFilterItems = document.querySelectorAll('#difficulty-filter .dropdown-item');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    // Add event listeners for filter buttons
    categoryFilterItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active class
            categoryFilterItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update current category
            currentCategory = this.getAttribute('data-category');
            document.getElementById('current-category').textContent = this.textContent;
            
            // Reset search term when changing filters
            searchTerm = '';
            searchInput.value = '';
            
            // Reload decks with filter
            renderDecks();
        });
    });
    
    difficultyFilterItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active class
            difficultyFilterItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update current difficulty
            currentDifficulty = this.getAttribute('data-difficulty');
            document.getElementById('current-difficulty').textContent = this.textContent;
            
            // Reset search term when changing filters
            searchTerm = '';
            searchInput.value = '';
            
            // Reload decks with filter
            renderDecks();
        });
    });
    
    // Add event listener for search button
    searchBtn.addEventListener('click', function() {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderDecks();
    });
    
    // Add event listener for search input (search on Enter)
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchTerm = searchInput.value.trim().toLowerCase();
            renderDecks();
        }
    });
    
    // Initialize
    initializeFlashcards();
    
    // Function to initialize the flashcards
    async function initializeFlashcards() {
        try {
            flashcardsData = await fetchFlashcardsData();
            renderDecks();
        } catch (error) {
            console.error('Failed to initialize flashcards:', error);
        }
    }
    
    // Function to render decks with current filters
    function renderDecks() {
        if (!flashcardsData) return;
        
        // Use the loadDecks function from deck-loader.js
        const decksFound = loadDecks(
            flashcardsData, 
            currentCategory, 
            currentDifficulty, 
            searchTerm, 
            decksContainer, 
            noResultsMessage, 
            instructionsMessage
        );
        
        // Add event listeners to study deck buttons
        document.querySelectorAll('.study-deck-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                const chapterId = this.getAttribute('data-chapter');
                const deckId = this.getAttribute('data-deck');
                
                const deckInfo = startDeckStudyMode(categoryId, chapterId, deckId, flashcardsData);
                if (deckInfo) {
                    currentDeck = deckInfo.deck;
                    currentCards = deckInfo.cards;
                    currentCardIndex = 0;
                    activateStudyMode(deckInfo.deck, deckInfo.category.name);
                }
            });
        });
    }
    
    // Make study mode button start first available deck
    if (studyModeBtn) {
        studyModeBtn.onclick = function(e) {
            e.preventDefault();
            const deckInfo = startFirstAvailableDeckStudyMode(flashcardsData, currentCategory, currentDifficulty);
            if (deckInfo) {
                currentDeck = deckInfo.deck;
                currentCards = deckInfo.cards;
                currentCardIndex = 0;
                activateStudyMode(deckInfo.deck, deckInfo.category.name);
            }
        };
    }
});
