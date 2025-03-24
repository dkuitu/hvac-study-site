// Flashcards functionality
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
            loadDecks();
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
            loadDecks();
        });
    });
    
    // Add event listener for search button
    searchBtn.addEventListener('click', function() {
        searchTerm = searchInput.value.trim().toLowerCase();
        loadDecks();
    });
    
    // Add event listener for search input (search on Enter)
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchTerm = searchInput.value.trim().toLowerCase();
            loadDecks();
        }
    });
    
    // Initialize
    fetchFlashcardsData();
    
    // Function to fetch flashcards data
    async function fetchFlashcardsData() {
        try {
            console.log('%c🔄 ATTEMPTING TO FETCH FROM DATABASE API', 'background: #0066cc; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            const response = await fetch('/api/flashcards');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch flashcards from API: ${response.status}`);
            }
            
            flashcardsData = await response.json();
            
            // Count total cards for logging
            let totalCards = 0;
            flashcardsData.categories.forEach(category => {
                category.chapters.forEach(chapter => {
                    chapter.decks.forEach(deck => {
                        totalCards += deck.cards.length;
                    });
                });
            });
            
            console.log('%c✅ SUCCESS: LOADED FROM DATABASE API', 'background: #00cc66; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            console.log(`📊 Data summary: ${flashcardsData.categories.length} categories, ${totalCards} total cards`);
            
            // Load decks once data is available
            loadDecks();
            
        } catch (error) {
            console.error('%c❌ ERROR FETCHING FROM API:', 'background: #cc0000; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;', error);
            
            // Fallback to local JSON file if API fails
            try {
                console.log('%c🔄 FALLBACK: ATTEMPTING TO FETCH FROM JSON FILE', 'background: #ff9900; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
                const fallbackResponse = await fetch('/static/data/flashcards.json');
                
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to fetch fallback: ${fallbackResponse.status}`);
                }
                
                flashcardsData = await fallbackResponse.json();
                
                // Count total cards for logging
                let totalCards = 0;
                flashcardsData.categories.forEach(category => {
                    category.chapters.forEach(chapter => {
                        chapter.decks.forEach(deck => {
                            totalCards += deck.cards.length;
                        });
                    });
                });
                
                console.log('%c⚠️ NOTICE: USING JSON FALLBACK', 'background: #ff9900; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
                console.log(`📊 Fallback data summary: ${flashcardsData.categories.length} categories, ${totalCards} total cards`);
                
                // Load decks once data is available
                loadDecks();
                
            } catch (fallbackError) {
                console.error('%c❌ CRITICAL: BOTH API AND FALLBACK FAILED', 'background: #cc0000; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;', fallbackError);
                alert('Failed to load flashcards. Please try refreshing the page.');
            }
        }
    }
    
    // Function to load and display decks based on filters and search
    function loadDecks() {
        if (!flashcardsData) return;
        
        // Clear current decks
        decksContainer.innerHTML = '';
        
        // Filter categories
        let filteredCategories = flashcardsData.categories;
        if (currentCategory !== 'all') {
            filteredCategories = filteredCategories.filter(category => category.id === currentCategory);
        }
        
        // Helper function to make tables mobile-friendly
        function makeMobileFriendlyTable(table) {
            table.classList.add('mobile-friendly-table');
            
            // Apply responsive classes to table cells
            const headerCells = table.querySelectorAll('thead th');
            const bodyRows = table.querySelectorAll('tbody tr');
            
            // Mark columns with priorities
            headerCells.forEach((cell, index) => {
                if (index === 0) { // Category column (least important on mobile)
                    cell.classList.add('mobile-priority-low');
                }
                else if (index === 1) { // Topic column (medium priority)
                    cell.classList.add('mobile-priority-medium');
                }
            });
            
            // Apply the same classes to body cells
            bodyRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (index === 0) {
                        cell.classList.add('mobile-priority-low');
                    }
                    else if (index === 1) {
                        cell.classList.add('mobile-priority-medium');
                    }
                });
            });
            
            return table;
        }
        
        // Apply search filtering if a search term exists
        if (searchTerm) {
            // Create a deep clone of the filtered categories to avoid modifying the original data
            const searchFilteredCategories = JSON.parse(JSON.stringify(filteredCategories));
            
            // For each category, filter chapters and decks to only include those that match the search term
            const categoriesWithSearchResults = searchFilteredCategories.map(category => {
                // Filter chapters that contain decks matching the search term
                category.chapters = category.chapters.map(chapter => {
                    // Filter decks whose name or cards match the search term
                    chapter.decks = chapter.decks.filter(deck => {
                        // Check if deck name contains the search term
                        if (deck.name.toLowerCase().includes(searchTerm)) {
                            return true;
                        }
                        
                        // Check if any card questions or answers contain the search term
                        const hasMatchingCards = deck.cards.some(card => 
                            card.question.toLowerCase().includes(searchTerm) || 
                            card.answer.toLowerCase().includes(searchTerm)
                        );
                        
                        return hasMatchingCards;
                    });
                    
                    // Only keep chapters with matching decks
                    return chapter;
                }).filter(chapter => chapter.decks.length > 0);
                
                // Return the filtered category
                return category;
            }).filter(category => category.chapters.length > 0);
            
            // Replace filtered categories with search-filtered categories
            filteredCategories = categoriesWithSearchResults;
        }
        
        let decksFound = false;
        
        // Check if we're showing all categories and all difficulties
        const showingAllFilters = currentCategory === 'all' && currentDifficulty === 'all';
        
        // Create a more compact view when showing all decks
        if (showingAllFilters) {
            // Create a table-like display for all decks
            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive';
            
            const table = document.createElement('table');
            table.className = 'table table-hover align-middle';
            
            // Create table header
            const thead = document.createElement('thead');
            thead.className = 'table-light';
            thead.innerHTML = `
                <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Topic</th>
                    <th scope="col">Deck Name</th>
                    <th scope="col">Difficulty</th>
                    <th scope="col">Cards</th>
                    <th scope="col" class="text-end">Action</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Loop through categories to populate table rows
            filteredCategories.forEach(category => {
                category.chapters.forEach(chapter => {
                    // Filter decks by difficulty
                    let filteredDecks = chapter.decks;
                    if (currentDifficulty !== 'all') {
                        filteredDecks = filteredDecks.filter(deck => deck.difficulty === currentDifficulty);
                    }
                    
                    if (filteredDecks.length === 0) return; // Skip to next chapter
                    
                    // We found at least one deck to display
                    decksFound = true;
                    
                    // Add each deck as a row in the table
                    filteredDecks.forEach(deck => {
                        // Set difficulty badge class
                        let difficultyClass = 'bg-success';
                        if (deck.difficulty === 'intermediate') difficultyClass = 'bg-primary';
                        if (deck.difficulty === 'advanced') difficultyClass = 'bg-danger';
                        
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="text-truncate" style="max-width: 100px;" title="${category.name}">${category.name}</td>
                            <td class="text-truncate" style="max-width: 100px;" title="${chapter.name}">${chapter.name}</td>
                            <td class="text-truncate" style="max-width: 120px;" title="${deck.name}">${deck.name}</td>
                            <td class="text-center"><span class="badge ${difficultyClass} rounded-pill">${deck.difficulty}</span></td>
                            <td class="text-center">${deck.cards.length}</td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-primary study-deck-btn" 
                                    data-category="${category.id}" 
                                    data-chapter="${chapter.id}" 
                                    data-deck="${deck.id}">
                                    Study
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                });
            });
            
            table.appendChild(tbody);
            
            // Make the table mobile-friendly
            makeMobileFriendlyTable(table);
            
            tableContainer.appendChild(table);
            decksContainer.appendChild(tableContainer);
        } else {
            // Use the original card layout for filtered views
            // Create HTML for each category
            filteredCategories.forEach(category => {
                // Create category section
                const categorySection = document.createElement('div');
                categorySection.className = 'category-section mb-5';
                categorySection.innerHTML = `
                    <h2 class="mb-4">${category.name}</h2>
                    <p class="lead mb-4">${category.description}</p>
                `;
                
                // Process chapters
                category.chapters.forEach(chapter => {
                    // Create decks row for this chapter
                    const decksRow = document.createElement('div');
                    decksRow.className = 'row g-4 mb-4';
                    
                    // Add chapter heading
                    const chapterHeading = document.createElement('div');
                    chapterHeading.className = 'col-12';
                    chapterHeading.innerHTML = `<h3 class="h4 mb-3">${chapter.name}</h3>`;
                    decksRow.appendChild(chapterHeading);
                    
                    // Filter decks by difficulty
                    let filteredDecks = chapter.decks;
                    if (currentDifficulty !== 'all') {
                        filteredDecks = filteredDecks.filter(deck => deck.difficulty === currentDifficulty);
                    }
                    
                    // No decks match the difficulty filter for this chapter
                    if (filteredDecks.length === 0) {
                        return; // Skip to next chapter
                    }
                    
                    // We found at least one deck to display
                    decksFound = true;
                    
                    // Add decks to the row
                    filteredDecks.forEach(deck => {
                        const deckCol = document.createElement('div');
                        deckCol.className = 'col-md-6 col-lg-4';
                        
                        // Create deck card with difficulty badge
                        let difficultyClass = 'bg-success';
                        if (deck.difficulty === 'intermediate') difficultyClass = 'bg-primary';
                        if (deck.difficulty === 'advanced') difficultyClass = 'bg-danger';
                        
                        deckCol.innerHTML = `
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-header d-flex justify-content-between align-items-center py-3">
                                    <h4 class="h5 mb-0">${deck.name}</h4>
                                    <span class="badge ${difficultyClass} rounded-pill">${deck.difficulty}</span>
                                </div>
                                <div class="card-body">
                                    <p class="card-text mb-3">${deck.cards.length} cards in this deck</p>
                                    <button class="btn btn-primary w-100 study-deck-btn" 
                                            data-category="${category.id}" 
                                            data-chapter="${chapter.id}" 
                                            data-deck="${deck.id}">
                                        Study This Deck
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        decksRow.appendChild(deckCol);
                    });
                    
                    // Add the row of decks to the category section
                    categorySection.appendChild(decksRow);
                });
                
                // Add the category section to the container
                decksContainer.appendChild(categorySection);
            });
        }
        
        // Add event listeners to study deck buttons
        document.querySelectorAll('.study-deck-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                const chapterId = this.getAttribute('data-chapter');
                const deckId = this.getAttribute('data-deck');
                
                startDeckStudyMode(categoryId, chapterId, deckId);
            });
        });
        
        // Show/hide appropriate messages
        if (decksFound) {
            noResultsMessage.style.display = 'none';
            instructionsMessage.style.display = 'none';
        } else {
            noResultsMessage.style.display = 'block';
            instructionsMessage.style.display = 'none';
        }
    }
    
    // Function to start study mode for a specific deck
    function startDeckStudyMode(categoryId, chapterId, deckId) {
        // Find the selected deck
        const category = flashcardsData.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        const chapter = category.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        
        const deck = chapter.decks.find(d => d.id === deckId);
        if (!deck) return;
        
        // Set current study state
        currentDeck = deck;
        currentCards = deck.cards;
        currentCardIndex = 0;
        
        // Start study mode with this deck
        activateStudyMode(deck, category.name);
    }
    
    // Function to start study mode based on first available filtered deck
    function startFirstAvailableDeckStudyMode() {
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
                        deck: deck
                    });
                });
            });
        });
        
        // If no matching decks, show message
        if (matchingDecks.length === 0) {
            alert('No decks match your current filters. Please change your filters and try again.');
            return;
        }
        
        // Use the first deck in the filtered list
        const selectedDeck = matchingDecks[0];
        
        // Set current study state
        currentDeck = selectedDeck.deck;
        currentCards = selectedDeck.deck.cards;
        currentCardIndex = 0;
        
        // Start study mode with this deck
        activateStudyMode(selectedDeck.deck, selectedDeck.categoryName);
    }
    
    // Make study mode button start first available deck
    if (studyModeBtn) {
        studyModeBtn.onclick = function(e) {
            e.preventDefault();
            startFirstAvailableDeckStudyMode();
        };
    }
});

// Global function for study mode
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