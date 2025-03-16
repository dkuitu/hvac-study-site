/**
 * Ad Manager for HVAC Study Site
 * Handles the insertion of ads at strategic points in the application
 */

class AdManager {
    constructor() {
        this.adIndex = 0;
        this.adSlots = [
            'flashcard-ad-slot',
            'quiz-ad-slot'
        ];
        this.initialized = false;
    }

    /**
     * Initialize the ad manager
     */
    init() {
        if (this.initialized) return;
        
        // Create ad container if it doesn't exist
        this.ensureAdContainersExist();
        
        console.log('[AdManager] Initialized');
        this.initialized = true;
    }

    /**
     * Make sure ad containers exist in the DOM
     */
    ensureAdContainersExist() {
        this.adSlots.forEach(slotId => {
            if (!document.getElementById(slotId)) {
                const adContainer = document.createElement('div');
                adContainer.id = slotId;
                adContainer.className = 'ad-container my-4 text-center';
                adContainer.style.minHeight = '90px';
                
                // Append to main content
                const main = document.querySelector('main');
                if (main) {
                    main.appendChild(adContainer);
                }
            }
        });
    }
    
    /**
     * Display an ad when a flashcard deck is opened
     */
    showFlashcardDeckAd(deckName) {
        const adSlot = document.getElementById('flashcard-ad-slot');
        if (!adSlot) return;
        
        console.log(`[AdManager] Showing ad for flashcard deck: ${deckName}`);
        
        // Ensure the slot is visible and positioned correctly
        adSlot.style.display = 'block';
        
        // Find the study mode container
        const studyModeContainer = document.getElementById('study-mode-container');
        if (studyModeContainer) {
            // Move the ad into the study mode container
            const targetLocation = studyModeContainer.querySelector('.row.justify-content-center.mb-4');
            if (targetLocation) {
                targetLocation.after(adSlot);
                
                // Request an ad
                this.requestAd(adSlot);
            }
        }
    }
    
    /**
     * Display an ad when a quiz is started
     */
    showQuizAd(quizTitle) {
        const adSlot = document.getElementById('quiz-ad-slot');
        if (!adSlot) return;
        
        console.log(`[AdManager] Showing ad for quiz: ${quizTitle}`);
        
        // Ensure the slot is visible
        adSlot.style.display = 'block';
        
        // Find the results area
        const resultsArea = document.getElementById('results-area');
        if (resultsArea) {
            // Move the ad into the results area before the review section
            const targetLocation = resultsArea.querySelector('.review-section');
            if (targetLocation) {
                targetLocation.before(adSlot);
                
                // Request an ad
                this.requestAd(adSlot);
            }
        }
    }
    
    /**
     * Request an ad to be displayed in the given slot
     */
    requestAd(adSlot) {
        if (!adSlot) return;
        
        // Clear any existing ad content
        adSlot.innerHTML = '';
        
        // Create a new ad unit
        const adUnit = document.createElement('ins');
        adUnit.className = 'adsbygoogle';
        adUnit.style.display = 'block';
        adUnit.style.minHeight = '280px';
        adUnit.style.width = '100%';
        adUnit.setAttribute('data-ad-client', 'ca-pub-1203109085130787');
        adUnit.setAttribute('data-ad-slot', '1234567890');  // Replace with your actual ad slot ID
        adUnit.setAttribute('data-ad-format', 'auto');
        adUnit.setAttribute('data-full-width-responsive', 'true');
        
        // Add the ad unit to the slot
        adSlot.appendChild(adUnit);
        
        // Request the ad
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            console.log('[AdManager] Ad requested');
        } catch (error) {
            console.error('[AdManager] Error requesting ad:', error);
        }
    }
}

// Create a global instance of the ad manager
window.adManager = new AdManager();

// Initialize the ad manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.adManager.init();
});

// Override the activateStudyMode function to show ads when a deck is opened
const originalActivateStudyMode = window.activateStudyMode;
if (typeof originalActivateStudyMode === 'function') {
    window.activateStudyMode = function(deck, categoryName) {
        // Call the original function first
        originalActivateStudyMode(deck, categoryName);
        
        // Show an ad
        if (window.adManager) {
            window.adManager.showFlashcardDeckAd(deck ? deck.name : 'Unknown deck');
        }
    };
}

// Override the startQuiz function to show ads when a quiz is opened
const originalStartQuiz = window.startQuiz;
if (typeof originalStartQuiz === 'function') {
    window.startQuiz = async function(quizId) {
        // Call the original function first
        await originalStartQuiz(quizId);
        
        // Show an ad when quiz completes (in the results section)
        if (window.adManager) {
            // We'll hook this into the submitQuiz function to show the ad when results appear
            const originalSubmitQuiz = submitQuiz;
            if (typeof originalSubmitQuiz === 'function') {
                window.submitQuiz = function() {
                    originalSubmitQuiz();
                    window.adManager.showQuizAd('Quiz Results');
                };
            }
        }
    };
}