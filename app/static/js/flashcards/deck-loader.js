// Flashcards deck loading and filtering functionality

/**
 * Loads and displays decks based on filters and search
 * @param {Object} flashcardsData - The flashcards data
 * @param {String} currentCategory - The current category filter
 * @param {String} currentDifficulty - The current difficulty filter
 * @param {String} searchTerm - The current search term
 * @param {HTMLElement} decksContainer - The container to render decks into
 * @param {HTMLElement} noResultsMessage - The message to show when no results
 * @param {HTMLElement} instructionsMessage - The instructions message element
 * @returns {void}
 */
function loadDecks(flashcardsData, currentCategory, currentDifficulty, searchTerm, decksContainer, noResultsMessage, instructionsMessage) {
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
    
    // Show/hide appropriate messages
    if (decksFound) {
        noResultsMessage.style.display = 'none';
        instructionsMessage.style.display = 'none';
    } else {
        noResultsMessage.style.display = 'block';
        instructionsMessage.style.display = 'none';
    }
    
    return decksFound;
}

export { loadDecks };
