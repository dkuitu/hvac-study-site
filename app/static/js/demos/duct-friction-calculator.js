/**
 * Duct Friction Loss Calculator Demo
 * A practical tool for HVAC technicians to calculate duct friction loss
 * and understand the relationship between airflow, duct size, and static pressure.
 * 
 * This is now a wrapper file that imports the modular components
 */

// Import main entry point
import { initDuctFrictionCalculator } from './duct-calculator/index.js';

// Make the function available globally
window.initDuctFrictionCalculator = initDuctFrictionCalculator;

// Log initialization status
console.log('Duct friction calculator wrapper loaded');
