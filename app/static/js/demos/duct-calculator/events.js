/**
 * Duct Friction Calculator Event Listeners
 */

import { updateCalculations, updateCalculatorMode } from './calculations.js';

/**
 * Set up all event listeners for the calculator
 */
export function setupEventListeners() {
    // Mode selection
    document.querySelectorAll('input[name="calc-mode"]').forEach(radio => {
        radio.addEventListener('change', updateCalculatorMode);
    });
    
    // Duct shape selection
    document.querySelectorAll('input[name="duct-shape"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const isRound = this.value === 'round';
            document.getElementById('round-size-group').style.display = isRound ? 'block' : 'none';
            document.getElementById('rect-size-group').style.display = isRound ? 'none' : 'block';
            updateCalculations();
        });
    });
    
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', updateCalculations);
    
    // Duct material selection
    document.getElementById('duct-material').addEventListener('change', updateCalculations);
    
    // Setup other input listeners - size selectors, etc.
    const inputElements = [
        'airflow-input', 'friction-input', 'velocity-limit',
        'round-diameter', 'rect-width', 'rect-height',
        'duct-length', 'fitting-count'
    ];
    
    inputElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateCalculations);
            // Also update on input for numeric fields
            if (element.type === 'number') {
                element.addEventListener('input', updateCalculations);
            }
        }
    });
}
