// Flashcards study mode functionality

/**
 * Starts study mode for a specific deck
 * @param {String} categoryId - The category ID
 * @param {String} chapterId - The chapter ID
 * @param {String} deckId - The deck ID
 * @param {Object} flashcardsData - The flashcards data
 * @returns {Object} Information about the activated deck
 */
function startDeckStudyMode(categoryId, chapterId, deckId, flashcardsData) {
    // Find the selected deck
    const category = flashcardsData.categories.find(c => c.id === categoryId);
    if (!category) return null;
    
    const chapter = category.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;
    
    const deck = chapter.decks.find(d => d.id === deckId);
    if (!deck) return null;
    
    // Return the deck and category info
    return {
        deck,
        category,
        cards: deck.cards
    };
}

/**
 * Starts study mode based on first available filtered deck
 * @param {Object} flashcardsData - The flashcards data
 * @param {String} currentCategory - The current category filter
 * @param {String} currentDifficulty - The current difficulty filter
 * @returns {Object} Information about the activated deck
 */
function startFirstAvailableDeckStudyMode(flashcardsData, currentCategory, currentDifficulty) {
    // Get all decks that match current filters
    const matchingDecks = [];
    
    flashcardsData.categories.forEach(category => {
        // Skip if category doesn't match filter
        if (currentCategory !== 'all' && category.id !== currentCategory) {
            return;
        }
        
        category.chapters.forEach(chapter => {
            chapter.decks.forEach(deck => {
                // Skip if difficulty doesn't match filter
                if (currentDifficulty !== 'all' && deck.difficulty !== currentDifficulty) {
                    return;
                }
                
                matchingDecks.push({
                    categoryName: category.name,
                    category: category,
                    deck: deck
                });
            });
        });
    });
    
    // If no matching decks, return null
    if (matchingDecks.length === 0) {
        alert('No decks match your current filters. Please change your filters and try again.');
        return null;
    }
    
    // Use the first deck in the filtered list
    const selectedDeck = matchingDecks[0];
    
    // Return the deck and category info
    return {
        deck: selectedDeck.deck,
        category: selectedDeck.category,
        cards: selectedDeck.deck.cards
    };
}

/**
 * Activates study mode with a deck
 * @param {Object} deck - The deck to study
 * @param {String} categoryName - The category name
 */
function activateStudyMode(deck, categoryName) {
    console.log('Activating study mode for deck:', deck);
    
    const flashcardsContainer = document.getElementById('flashcards-container');
    const studyModeContainer = document.getElementById('study-mode-container');
    
    if (!deck || !deck.cards || deck.cards.length === 0) {
        console.error('Invalid deck or no cards in deck');
        alert('This deck has no cards to study.');
        return;
    }
    
    const cards = deck.cards;
    let currentCardIndex = 0;
    let isShowingAnswer = false;
    
    // Update study mode UI with deck info
    document.getElementById('study-deck-title').textContent = `Study Mode: ${deck.name}`;
    document.getElementById('study-category-name').textContent = categoryName || '';
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${(1 / cards.length) * 100}%`;
    progressBar.setAttribute('aria-valuenow', (1 / cards.length) * 100);
    progressBar.textContent = `1/${cards.length}`;
    
    // Update card content
    document.getElementById('card-text').textContent = cards[0].question;
    document.getElementById('card-counter').textContent = `Card 1 of ${cards.length}`;
    
    // Reset buttons
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = cards.length <= 1;
    document.getElementById('flip-btn').innerHTML = '<i class="fas fa-sync-alt me-2"></i>Flip Card';
    
    // Hide flashcards view, show study mode
    if (flashcardsContainer) {
        flashcardsContainer.style.display = 'none';
    }
    if (studyModeContainer) {
        studyModeContainer.style.display = 'block';
    }
    
    // Add event listeners if not already added
    setupStudyModeListeners();
    
    function setupStudyModeListeners() {
        // Only set up the listeners once
        if (!studyModeContainer.dataset.listenersAdded) {
            document.getElementById('exit-study-btn').addEventListener('click', exitStudyMode);
            document.getElementById('flip-btn').addEventListener('click', flipCard);
            document.getElementById('next-btn').addEventListener('click', nextCard);
            document.getElementById('prev-btn').addEventListener('click', prevCard);
            document.getElementById('memorized-btn').addEventListener('click', markAsMemorized);
            
            // Add keyboard navigation
            document.addEventListener('keydown', handleKeyPress);
            
            // Mark as added
            studyModeContainer.dataset.listenersAdded = 'true';
        }
    }
    
    // Helper function to flip card
    function flipCard() {
        isShowingAnswer = !isShowingAnswer;
        const cardText = document.getElementById('card-text');
        const flipBtn = document.getElementById('flip-btn');
        
        if (isShowingAnswer) {
            cardText.textContent = cards[currentCardIndex].answer;
            flipBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Back to Question';
        } else {
            cardText.textContent = cards[currentCardIndex].question;
            flipBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Flip Card';
        }
    }
    
    // Helper function for next card
    function nextCard() {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            updateCardDisplay();
        }
    }
    
    // Helper function for previous card
    function prevCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCardDisplay();
        }
    }
    
    // Helper function to mark card as memorized
    function markAsMemorized() {
        const memBtn = document.getElementById('memorized-btn');
        memBtn.innerHTML = '<i class="fas fa-check me-2"></i>Memorized!';
        memBtn.classList.add('pulse-animation');
        
        setTimeout(() => {
            memBtn.innerHTML = '<i class="fas fa-check me-2"></i>Memorized';
            memBtn.classList.remove('pulse-animation');
            
            // Move to next card if available
            if (currentCardIndex < cards.length - 1) {
                nextCard();
            }
        }, 1000);
    }
    
    // Helper function to handle keyboard shortcuts
    function handleKeyPress(e) {
        if (studyModeContainer.style.display === 'none') return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault(); // Prevent page scroll
                flipCard();
                break;
            case 'ArrowRight':
                nextCard();
                break;
            case 'ArrowLeft':
                prevCard();
                break;
            case 'm':
            case 'M':
                markAsMemorized();
                break;
        }
    }
    
    // Update card display
    function updateCardDisplay() {
        // Reset to question side
        isShowingAnswer = false;
        
        // Update progress bar
        const progress = ((currentCardIndex + 1) / cards.length) * 100;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${currentCardIndex + 1}/${cards.length}`;
        
        // Update card content
        document.getElementById('card-text').textContent = cards[currentCardIndex].question;
        document.getElementById('flip-btn').innerHTML = '<i class="fas fa-sync-alt me-2"></i>Flip Card';
        
        // Update card counter
        const cardCounter = document.getElementById('card-counter');
        cardCounter.textContent = `Card ${currentCardIndex + 1} of ${cards.length}`;
        
        // Update button states
        document.getElementById('prev-btn').disabled = currentCardIndex === 0;
        document.getElementById('next-btn').disabled = currentCardIndex === cards.length - 1;
    }
    
    // Exit study mode
    function exitStudyMode() {
        if (studyModeContainer) {
            studyModeContainer.style.display = 'none';
        }
        if (flashcardsContainer) {
            flashcardsContainer.style.display = 'block';
        }
    }
}

export { startDeckStudyMode, startFirstAvailableDeckStudyMode, activateStudyMode };
