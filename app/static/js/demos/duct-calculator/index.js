/**
 * Duct Friction Loss Calculator Demo
 * A practical tool for HVAC technicians to calculate duct friction loss
 * and understand the relationship between airflow, duct size, and static pressure.
 */

// Import components
import { renderUI } from './ui.js';
import { setupEventListeners } from './events.js';
import { createFrictionChart } from './chart.js';

/**
 * Initialize the duct friction calculator demo
 */
function initDuctFrictionCalculator() {
    console.log('Duct friction calculator initializing...');
    
    // Get the container
    const demoContainer = document.getElementById('duct-friction-demo');
    
    if (!demoContainer) {
        console.error('Demo container not found');
        return;
    }
    
    try {
        // Render the UI
        renderUI(demoContainer);
        
        // Set up event listeners
        setupEventListeners();
        
        // Create the friction chart
        createFrictionChart();
        
        console.log('Duct friction calculator initialized successfully');
    } catch (error) {
        console.error('Error initializing duct friction calculator:', error);
        
        // Simple error message
        demoContainer.innerHTML = `
            <div class="alert alert-danger">
                <h3>Error Loading Calculator</h3>
                <p>There was a problem initializing the duct friction calculator.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;
    }
}

// Make initialize function available to the page
window.initDuctFrictionCalculator = initDuctFrictionCalculator;

// For debugging
console.log('Duct friction calculator script loaded, function available:', Boolean(window.initDuctFrictionCalculator));

// Export the init function
export { initDuctFrictionCalculator };
