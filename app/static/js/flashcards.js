// Flashcards functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flashcards script loaded');
    
    // DOM elements
    const studyModeBtn = document.getElementById('study-mode-btn');
    const flashcardsContainer = document.getElementById('flashcards-container');
    let studyModeContainer = document.getElementById('study-mode-container');
    
    // Study mode state
    let currentDeck = null;
    let currentCategory = null;
    let cards = [];
    let currentCardIndex = 0;
    let isShowingAnswer = false;
    
    // Event listeners
    if (studyModeBtn) {
        console.log('Study mode button found, adding event listener');
        studyModeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Study mode button clicked');
            enterStudyMode();
        });
    } else {
        console.warn('Study mode button not found');
    }
    
    // Function to fetch flashcards data
    async function fetchFlashcards() {
        try {
            console.log('%c🔄 ATTEMPTING TO FETCH FROM DATABASE API', 'background: #0066cc; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            const response = await fetch('/api/flashcards');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Count total cards for logging
            let totalCards = 0;
            data.categories.forEach(category => {
                category.chapters.forEach(chapter => {
                    chapter.decks.forEach(deck => {
                        totalCards += deck.cards.length;
                    });
                });
            });
            
            console.log('%c✅ SUCCESS: LOADED FROM DATABASE API', 'background: #00cc66; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            console.log(`📊 Data summary: ${data.categories.length} categories, ${totalCards} total cards`);
            console.log('📋 Full data:', data);
            
            return data;
        } catch (error) {
            console.error('%c❌ ERROR FETCHING FROM API:', 'background: #cc0000; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;', error);
            
            // Fallback to local JSON file if API fails
            try {
                console.log('%c🔄 FALLBACK: ATTEMPTING TO FETCH FROM JSON FILE', 'background: #ff9900; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
                const fallbackResponse = await fetch('/static/data/flashcards.json');
                
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to fetch fallback: ${fallbackResponse.status}`);
                }
                
                const fallbackData = await fallbackResponse.json();
                
                // Count total cards for logging
                let totalCards = 0;
                fallbackData.categories.forEach(category => {
                    category.chapters.forEach(chapter => {
                        chapter.decks.forEach(deck => {
                            totalCards += deck.cards.length;
                        });
                    });
                });
                
                console.log('%c⚠️ NOTICE: USING JSON FALLBACK', 'background: #ff9900; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
                console.log(`📊 Fallback data summary: ${fallbackData.categories.length} categories, ${totalCards} total cards`);
                
                return fallbackData;
            } catch (fallbackError) {
                console.error('%c❌ CRITICAL: BOTH API AND FALLBACK FAILED', 'background: #cc0000; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;', fallbackError);
                alert('Failed to load flashcards. Please try refreshing the page.');
                return null;
            }
        }
    }
    
    // Enter study mode
    async function enterStudyMode() {
        console.log('Entering study mode');
        const flashcardsData = await fetchFlashcards();
        if (!flashcardsData) {
            console.error('Could not load flashcards data');
            return;
        }
        
        // Default to first category and first deck
        const firstCategory = flashcardsData.categories[0];
        const firstChapter = firstCategory.chapters[0];
        const firstDeck = firstChapter.decks[0];
        
        console.log('Setting up study mode with:', {
            category: firstCategory.name,
            chapter: firstChapter.name,
            deck: firstDeck.name
        });
        
        setupStudyMode(flashcardsData, firstCategory.id, firstChapter.id, firstDeck.id);
    }
    
    // Setup study mode with specific deck
    function setupStudyMode(data, categoryId, chapterId, deckId) {
        // Find the selected category, chapter and deck
        const category = data.categories.find(c => c.id === categoryId);
        if (!category) {
            console.error('Category not found:', categoryId);
            return;
        }
        
        const chapter = category.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            console.error('Chapter not found:', chapterId);
            return;
        }
        
        const deck = chapter.decks.find(d => d.id === deckId);
        if (!deck) {
            console.error('Deck not found:', deckId);
            return;
        }
        
        console.log('Found deck:', deck);
        
        // Set current state
        currentCategory = category;
        currentDeck = deck;
        cards = deck.cards;
        currentCardIndex = 0;
        isShowingAnswer = false;
        
        // Hide flashcards container
        if (flashcardsContainer) {
            console.log('Hiding flashcards container');
            flashcardsContainer.style.display = 'none';
        } else {
            console.warn('Flashcards container not found');
        }
        
        // Create study mode UI if it doesn't exist
        if (!studyModeContainer) {
            console.log('Creating study mode UI');
            createStudyModeUI();
        } else {
            console.log('Using existing study mode container');
            studyModeContainer.style.display = 'block';
        }
        
        // Update UI with first card
        updateStudyModeUI();
        
        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeyPress);
    }
    
    // Create study mode UI
    function createStudyModeUI() {
        console.log('Creating study mode container');
        
        // Create a container for the study mode
        const container = document.createElement('div');
        container.id = 'study-mode-container';
        container.className = 'study-mode py-5';
        
        // Create all the needed HTML
        container.innerHTML = `
            <div class="container">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">
                            <h2 id="study-deck-title">Study Mode</h2>
                            <div>
                                <button id="exit-study-mode" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-2"></i>Exit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="progress">
                            <div id="study-progress" class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="row justify-content-center mb-4">
                    <div class="col-lg-8">
                        <div id="study-card" class="flashcard study-card">
                            <div class="flashcard-inner">
                                <div id="card-front" class="flashcard-front p-5 d-flex flex-column justify-content-between">
                                    <div class="card-content">
                                        <h3 id="card-question" class="text-center mb-4">Card Question</h3>
                                    </div>
                                    <p class="text-center text-muted mt-3">Press SPACE to flip or click the card</p>
                                </div>
                                <div id="card-back" class="flashcard-back p-5">
                                    <h3 id="card-answer" class="text-center mb-4">Card Answer</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="d-flex justify-content-between">
                            <button id="prev-card-btn" class="btn btn-outline-primary">
                                <i class="fas fa-chevron-left me-2"></i>Previous (←)
                            </button>
                            
                            <div>
                                <button id="memorized-btn" class="btn btn-success mx-2">
                                    <i class="fas fa-check me-2"></i>Memorized (M)
                                </button>
                                <button id="flip-card-btn" class="btn btn-primary mx-2">
                                    <i class="fas fa-sync me-2"></i>Flip (SPACE)
                                </button>
                            </div>
                            
                            <button id="next-card-btn" class="btn btn-outline-primary">
                                Next (→)<i class="fas fa-chevron-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h5 class="card-title">Keyboard Shortcuts</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="list-unstyled">
                                            <li><kbd>←</kbd> Previous card</li>
                                            <li><kbd>→</kbd> Next card</li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <ul class="list-unstyled">
                                            <li><kbd>SPACE</kbd> Flip card</li>
                                            <li><kbd>M</kbd> Mark as memorized</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the container to the page (right after the flashcards section)
        console.log('Inserting study mode container into the DOM');
        const targetSection = document.querySelector('section.py-5');
        
        if (targetSection && targetSection.parentNode) {
            console.log('Found target section, inserting study mode after it');
            targetSection.parentNode.insertBefore(container, targetSection.nextSibling);
        } else {
            console.warn('Target section not found, inserting at end of body');
            document.body.appendChild(container);
        }
        
        studyModeContainer = container;
        
        // Show the container
        studyModeContainer.style.display = 'block';
        
        console.log('Adding event listeners to study mode elements');
        
        // Add event listeners to new elements
        document.getElementById('exit-study-mode').addEventListener('click', exitStudyMode);
        document.getElementById('prev-card-btn').addEventListener('click', showPreviousCard);
        document.getElementById('next-card-btn').addEventListener('click', showNextCard);
        document.getElementById('flip-card-btn').addEventListener('click', flipCard);
        document.getElementById('memorized-btn').addEventListener('click', markAsMemorized);
        document.getElementById('study-card').addEventListener('click', flipCard);
    }
    
    // Update study mode UI with current card
    function updateStudyModeUI() {
        if (!studyModeContainer || !cards.length) return;
        
        const card = cards[currentCardIndex];
        const deckTitle = document.getElementById('study-deck-title');
        const cardQuestion = document.getElementById('card-question');
        const cardAnswer = document.getElementById('card-answer');
        const progress = document.getElementById('study-progress');
        const studyCard = document.getElementById('study-card');
        
        // Update title and card content
        deckTitle.textContent = `${currentDeck.name} (${currentCardIndex + 1}/${cards.length})`;
        cardQuestion.textContent = card.question;
        cardAnswer.textContent = card.answer;
        
        // Update progress bar
        const progressPercent = ((currentCardIndex + 1) / cards.length) * 100;
        progress.style.width = `${progressPercent}%`;
        progress.setAttribute('aria-valuenow', progressPercent);
        
        // Reset card flip state
        isShowingAnswer = false;
        studyCard.classList.remove('flipped');
        
        // Enable/disable navigation buttons
        document.getElementById('prev-card-btn').disabled = currentCardIndex === 0;
        document.getElementById('next-card-btn').disabled = currentCardIndex === cards.length - 1;
    }
    
    // Flip card to show answer or question
    function flipCard() {
        console.log('Flipping card');
        const studyCard = document.getElementById('study-card');
        if (!studyCard) {
            console.error('Study card element not found');
            return;
        }
        
        isShowingAnswer = !isShowingAnswer;
        
        if (isShowingAnswer) {
            console.log('Showing answer');
            studyCard.classList.add('flipped');
        } else {
            console.log('Showing question');
            studyCard.classList.remove('flipped');
        }
    }
    
    // Show previous card
    function showPreviousCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateStudyModeUI();
        }
    }
    
    // Show next card
    function showNextCard() {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            updateStudyModeUI();
        }
    }
    
    // Mark current card as memorized
    function markAsMemorized() {
        // In a real app, this would update a user's progress
        // For now, just provide visual feedback
        const memorizedBtn = document.getElementById('memorized-btn');
        
        memorizedBtn.innerHTML = '<i class="fas fa-check me-2"></i>Memorized!';
        memorizedBtn.classList.add('pulse-animation');
        
        setTimeout(() => {
            memorizedBtn.innerHTML = '<i class="fas fa-check me-2"></i>Memorized (M)';
            memorizedBtn.classList.remove('pulse-animation');
            
            // Move to next card if not the last card
            if (currentCardIndex < cards.length - 1) {
                showNextCard();
            }
        }, 1000);
    }
    
    // Handle keyboard shortcuts
    function handleKeyPress(e) {
        if (!studyModeContainer || studyModeContainer.style.display === 'none') return;
        
        switch (e.key) {
            case ' ':  // Space bar
                flipCard();
                break;
            case 'ArrowLeft':
                showPreviousCard();
                break;
            case 'ArrowRight':
                showNextCard();
                break;
            case 'm':
            case 'M':
                markAsMemorized();
                break;
        }
    }
    
    // Exit study mode
    function exitStudyMode() {
        console.log('Exiting study mode');
        
        if (studyModeContainer) {
            console.log('Hiding study mode container');
            studyModeContainer.style.display = 'none';
        } else {
            console.warn('Study mode container not found for hiding');
        }
        
        if (flashcardsContainer) {
            console.log('Showing flashcards container');
            flashcardsContainer.style.display = 'block';
        } else {
            console.warn('Flashcards container not found for showing');
        }
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleKeyPress);
    }
});