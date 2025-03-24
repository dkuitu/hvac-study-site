/**
 * Duct Friction Calculator Calculation Functions
 */
import { STANDARD_ROUND_SIZES, STANDARD_RECT_WIDTHS, STANDARD_RECT_HEIGHTS } from './constants.js';

/**
 * Updates calculator mode (which inputs/outputs to show)
 */
export function updateCalculatorMode() {
    const mode = document.querySelector('input[name="calc-mode"]:checked').value;
    
    // Default - everything visible
    const airflowGroup = document.getElementById('airflow-input-group');
    const frictionGroup = document.getElementById('friction-input-group');
    const velocityGroup = document.getElementById('velocity-input-group');
    const roundSizeGroup = document.getElementById('round-size-group');
    const rectSizeGroup = document.getElementById('rect-size-group');
    
    // Results sections
    const ductSizeResults = document.getElementById('duct-size-results');
    const airflowResults = document.getElementById('airflow-results');
    const frictionResults = document.getElementById('friction-results');
    
    // Hide all by default
    ductSizeResults.style.display = 'none';
    airflowResults.style.display = 'none';
    frictionResults.style.display = 'none';
    
    // Show based on mode
    if (mode === 'duct-size') {
        // Show airflow and friction inputs
        airflowGroup.style.display = 'block';
        frictionGroup.style.display = 'block';
        velocityGroup.style.display = 'block';
        
        // Hide duct size selectors
        const isRound = document.querySelector('input[name="duct-shape"]:checked').value === 'round';
        roundSizeGroup.style.display = 'none';
        rectSizeGroup.style.display = 'none';
        
        // Show duct size results
        ductSizeResults.style.display = 'block';
    }
    else if (mode === 'airflow') {
        // Hide airflow input, show friction input
        airflowGroup.style.display = 'none';
        frictionGroup.style.display = 'block';
        velocityGroup.style.display = 'block';
        
        // Show duct size selectors
        const isRound = document.querySelector('input[name="duct-shape"]:checked').value === 'round';
        roundSizeGroup.style.display = isRound ? 'block' : 'none';
        rectSizeGroup.style.display = isRound ? 'none' : 'block';
        
        // Show airflow results
        airflowResults.style.display = 'block';
    }
    else if (mode === 'friction') {
        // Show airflow input, hide friction input
        airflowGroup.style.display = 'block';
        frictionGroup.style.display = 'none';
        velocityGroup.style.display = 'none';
        
        // Show duct size selectors
        const isRound = document.querySelector('input[name="duct-shape"]:checked').value === 'round';
        roundSizeGroup.style.display = isRound ? 'block' : 'none';
        rectSizeGroup.style.display = isRound ? 'none' : 'block';
        
        // Show friction results
        frictionResults.style.display = 'block';
    }
    
    // Run calculation with current values
    updateCalculations();
}

/**
 * Update all calculations based on current inputs
 */
export function updateCalculations() {
    const mode = document.querySelector('input[name="calc-mode"]:checked').value;
    const ductShape = document.querySelector('input[name="duct-shape"]:checked').value;
    
    // Get the material roughness factor
    const materialElement = document.getElementById('duct-material');
    const roughnessFactor = parseFloat(materialElement.options[materialElement.selectedIndex].getAttribute('data-roughness')) || 1.0;
    
    // Get other inputs
    const ductLength = parseFloat(document.getElementById('duct-length').value) || 100;
    const fittingCount = parseInt(document.getElementById('fitting-count').value) || 0;
    
    // Calculate equivalent length (simple approximation)
    // Each fitting is assumed to add 25 feet
    const equivalentLength = ductLength + (fittingCount * 25);
    document.getElementById('equivalent-length').textContent = equivalentLength.toFixed(0) + ' ft';
    
    // Perform mode-specific calculations
    if (mode === 'duct-size') {
        calculateDuctSize(ductShape, roughnessFactor, equivalentLength);
    }
    else if (mode === 'airflow') {
        calculateAirflow(ductShape, roughnessFactor, equivalentLength);
    }
    else if (mode === 'friction') {
        calculateFriction(ductShape, roughnessFactor, equivalentLength);
    }
}

/**
 * Calculate duct size based on airflow and friction rate
 * @param {String} ductShape - The duct shape (round or rectangular)
 * @param {Number} roughnessFactor - The roughness factor for the duct material
 * @param {Number} equivalentLength - The equivalent length of the duct including fittings
 */
function calculateDuctSize(ductShape, roughnessFactor, equivalentLength) {
    const airflow = parseFloat(document.getElementById('airflow-input').value) || 400;
    const frictionRate = parseFloat(document.getElementById('friction-input').value) || 0.1;
    const velocityLimit = parseFloat(document.getElementById('velocity-limit').value) || 1200;
    
    // Calculate diameter using friction rate formula
    // Darcy equation rearranged for diameter
    const factor = Math.pow((airflow / 4005) / Math.sqrt(frictionRate / roughnessFactor), 0.4);
    let recommendedDiameter = factor * 12; // Convert to inches
    
    // Check velocity constraint (area in sq.ft = π×r² = π×(d/24)²)
    const minDiameterForVelocity = Math.sqrt((airflow / velocityLimit) * 4 / Math.PI) * 12;
    
    // Use the larger diameter to ensure velocity limit is not exceeded
    recommendedDiameter = Math.max(recommendedDiameter, minDiameterForVelocity);
    
    // Find nearest standard size (round up)
    const roundSize = findNearestStandardRound(recommendedDiameter);
    document.getElementById('round-result').textContent = roundSize + '"';
    
    // Calculate rectangular equivalent (aspect ratio around 1.5)
    const rectSize = findRectangularEquivalent(roundSize, 1.5);
    document.getElementById('rect-result').textContent = rectSize.width + '" × ' + rectSize.height + '"';
    
    // Calculate velocity for the round duct
    const roundArea = Math.PI * Math.pow(roundSize / 24, 2); // Area in square feet
    const velocity = airflow / roundArea;
    document.getElementById('velocity-result').textContent = Math.round(velocity) + ' FPM';
    
    // Rate the velocity
    const velocityRating = document.getElementById('velocity-rating');
    if (velocity > velocityLimit) {
        velocityRating.textContent = 'Too high - consider larger duct';
        velocityRating.className = 'mb-0 text-danger';
    } else if (velocity < 400) {
        velocityRating.textContent = 'Low - may cause poor air mixing';
        velocityRating.className = 'mb-0 text-warning';
    } else {
        velocityRating.textContent = 'Good range';
        velocityRating.className = 'mb-0 text-success';
    }
    
    // Calculate total pressure drop
    const totalPressureDrop = (frictionRate / 100) * equivalentLength;
    document.getElementById('total-pressure-drop').textContent = totalPressureDrop.toFixed(3) + ' in.wc';
}

/**
 * Calculate maximum airflow based on duct size and friction rate
 * @param {String} ductShape - The duct shape (round or rectangular)
 * @param {Number} roughnessFactor - The roughness factor for the duct material
 * @param {Number} equivalentLength - The equivalent length of the duct including fittings
 */
function calculateAirflow(ductShape, roughnessFactor, equivalentLength) {
    const frictionRate = parseFloat(document.getElementById('friction-input').value) || 0.1;
    const velocityLimit = parseFloat(document.getElementById('velocity-limit').value) || 1200;
    
    let ductArea, hydraulicDiameter;
    
    if (ductShape === 'round') {
        const diameter = parseInt(document.getElementById('round-diameter').value) || 8;
        ductArea = Math.PI * Math.pow(diameter / 24, 2); // Area in square feet
        hydraulicDiameter = diameter / 12; // Diameter in feet
    } else {
        const width = parseInt(document.getElementById('rect-width').value) || 12;
        const height = parseInt(document.getElementById('rect-height').value) || 8;
        ductArea = (width * height) / 144; // Area in square feet
        
        // Hydraulic diameter for rectangular ducts
        const perimeter = 2 * (width + height) / 12; // Perimeter in feet
        hydraulicDiameter = 4 * ductArea / perimeter; // Hydraulic diameter in feet
    }
    
    // Calculate maximum airflow based on friction rate
    // Darcy equation rearranged for flow rate
    const maxAirflowByFriction = 4005 * Math.pow(hydraulicDiameter, 2.5) * Math.sqrt(frictionRate / roughnessFactor);
    
    // Calculate maximum airflow based on velocity limit
    const maxAirflowByVelocity = ductArea * velocityLimit;
    
    // Use the smaller of the two limits
    const maxAirflow = Math.min(maxAirflowByFriction, maxAirflowByVelocity);
    document.getElementById('max-airflow-result').textContent = Math.round(maxAirflow) + ' CFM';
    
    // Calculate velocity for the selected duct
    const velocity = maxAirflow / ductArea;
    document.getElementById('velocity-result').textContent = Math.round(velocity) + ' FPM';
    
    // Rate the velocity
    const velocityRating = document.getElementById('velocity-rating');
    if (velocity > velocityLimit) {
        velocityRating.textContent = 'Too high - reduce airflow';
        velocityRating.className = 'mb-0 text-danger';
    } else if (velocity < 400) {
        velocityRating.textContent = 'Low - may cause poor air mixing';
        velocityRating.className = 'mb-0 text-warning';
    } else {
        velocityRating.textContent = 'Good range';
        velocityRating.className = 'mb-0 text-success';
    }
    
    // Calculate total pressure drop
    const totalPressureDrop = (frictionRate / 100) * equivalentLength;
    document.getElementById('total-pressure-drop').textContent = totalPressureDrop.toFixed(3) + ' in.wc';
}

/**
 * Calculate friction rate based on duct size and airflow
 * @param {String} ductShape - The duct shape (round or rectangular)
 * @param {Number} roughnessFactor - The roughness factor for the duct material
 * @param {Number} equivalentLength - The equivalent length of the duct including fittings
 */
function calculateFriction(ductShape, roughnessFactor, equivalentLength) {
    const airflow = parseFloat(document.getElementById('airflow-input').value) || 400;
    
    let ductArea, hydraulicDiameter;
    
    if (ductShape === 'round') {
        const diameter = parseInt(document.getElementById('round-diameter').value) || 8;
        ductArea = Math.PI * Math.pow(diameter / 24, 2); // Area in square feet
        hydraulicDiameter = diameter / 12; // Diameter in feet
    } else {
        const width = parseInt(document.getElementById('rect-width').value) || 12;
        const height = parseInt(document.getElementById('rect-height').value) || 8;
        ductArea = (width * height) / 144; // Area in square feet
        
        // Hydraulic diameter for rectangular ducts
        const perimeter = 2 * (width + height) / 12; // Perimeter in feet
        hydraulicDiameter = 4 * ductArea / perimeter; // Hydraulic diameter in feet
    }
    
    // Calculate friction rate using the Darcy equation
    // f = 0.618 × 10⁻⁷ × L^1.852 × Q^1.852 / D^4.973
    // where L is length in feet, Q is flow in CFM, D is hydraulic diameter in feet
    const frictionRate = roughnessFactor * Math.pow(airflow / (4005 * Math.pow(hydraulicDiameter, 2.5)), 2);
    document.getElementById('friction-result').textContent = frictionRate.toFixed(3) + ' in.wc/100ft';
    
    // Rate the friction
    const frictionRating = document.getElementById('friction-rating');
    if (frictionRate > 0.15) {
        frictionRating.textContent = 'High - consider larger duct';
        frictionRating.className = 'mb-0 text-danger';
    } else if (frictionRate < 0.05) {
        frictionRating.textContent = 'Low - consider smaller duct';
        frictionRating.className = 'mb-0 text-warning';
    } else {
        frictionRating.textContent = 'Good range';
        frictionRating.className = 'mb-0 text-success';
    }
    
    // Calculate velocity
    const velocity = airflow / ductArea;
    document.getElementById('velocity-result').textContent = Math.round(velocity) + ' FPM';
    
    // Rate the velocity
    const velocityRating = document.getElementById('velocity-rating');
    if (velocity > 1200) {
        velocityRating.textContent = 'Too high - noise issues likely';
        velocityRating.className = 'mb-0 text-danger';
    } else if (velocity < 400) {
        velocityRating.textContent = 'Low - may cause poor air mixing';
        velocityRating.className = 'mb-0 text-warning';
    } else {
        velocityRating.textContent = 'Good range';
        velocityRating.className = 'mb-0 text-success';
    }
    
    // Calculate total pressure drop
    const totalPressureDrop = (frictionRate / 100) * equivalentLength;
    document.getElementById('total-pressure-drop').textContent = totalPressureDrop.toFixed(3) + ' in.wc';
}

/**
 * Find the nearest standard round duct size (round up)
 * @param {Number} diameter - The calculated diameter in inches
 * @returns {Number} The nearest standard round duct size
 */
export function findNearestStandardRound(diameter) {
    for (const size of STANDARD_ROUND_SIZES) {
        if (size >= diameter) {
            return size;
        }
    }
    return STANDARD_ROUND_SIZES[STANDARD_ROUND_SIZES.length - 1]; // Return largest if none found
}

/**
 * Find rectangular equivalent for round duct
 * @param {Number} roundDiameter - The round duct diameter in inches
 * @param {Number} aspectRatio - The desired aspect ratio (width/height)
 * @returns {Object} The equivalent rectangular dimensions {width, height}
 */
export function findRectangularEquivalent(roundDiameter, aspectRatio = 1.5) {
    const roundArea = Math.PI * Math.pow(roundDiameter / 2, 2);
    
    // Calculate ideal dimensions based on aspect ratio
    let height = Math.sqrt(roundArea / aspectRatio);
    let width = height * aspectRatio;
    
    // Find nearest standard sizes
    const stdHeight = findNearestStandardHeight(height);
    const stdWidth = findNearestStandardWidth(width);
    
    return { width: stdWidth, height: stdHeight };
}

/**
 * Find the nearest standard rectangular height
 * @param {Number} height - The calculated height in inches
 * @returns {Number} The nearest standard height
 */
function findNearestStandardHeight(height) {
    for (const size of STANDARD_RECT_HEIGHTS) {
        if (size >= height) {
            return size;
        }
    }
    return STANDARD_RECT_HEIGHTS[STANDARD_RECT_HEIGHTS.length - 1]; // Return largest if none found
}

/**
 * Find the nearest standard rectangular width
 * @param {Number} width - The calculated width in inches
 * @returns {Number} The nearest standard width
 */
function findNearestStandardWidth(width) {
    for (const size of STANDARD_RECT_WIDTHS) {
        if (size >= width) {
            return size;
        }
    }
    return STANDARD_RECT_WIDTHS[STANDARD_RECT_WIDTHS.length - 1]; // Return largest if none found
}
