// Flashcards data fetching functionality

/**
 * Fetches flashcards data from the API
 * @returns {Promise} Promise that resolves with the flashcards data
 */
async function fetchFlashcardsData() {
    try {
        console.log('%c🔄 ATTEMPTING TO FETCH FROM DATABASE API', 'background: #0066cc; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
        const response = await fetch('/api/flashcards');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch flashcards from API: ${response.status}`);
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
            
            const data = await fallbackResponse.json();
            
            // Count total cards for logging
            let totalCards = 0;
            data.categories.forEach(category => {
                category.chapters.forEach(chapter => {
                    chapter.decks.forEach(deck => {
                        totalCards += deck.cards.length;
                    });
                });
            });
            
            console.log('%c⚠️ NOTICE: USING JSON FALLBACK', 'background: #ff9900; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;');
            console.log(`📊 Fallback data summary: ${data.categories.length} categories, ${totalCards} total cards`);
            
            return data;
            
        } catch (fallbackError) {
            console.error('%c❌ CRITICAL: BOTH API AND FALLBACK FAILED', 'background: #cc0000; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;', fallbackError);
            alert('Failed to load flashcards. Please try refreshing the page.');
            throw fallbackError;
        }
    }
}

export { fetchFlashcardsData };
