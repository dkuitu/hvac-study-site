/**
 * Duct Sizing Calculator Demo
 * A practical tool for HVAC technicians to understand the relationship
 * between duct size, airflow, and velocity.
 */

// Constants for calculations
const AIR_DENSITY = 0.075; // lbs/ft³ at standard conditions
const VELOCITY_MIN = 600; // minimum recommended velocity (fpm)
const VELOCITY_MAX = 1200; // maximum recommended velocity (fpm)

// Duct shapes
const ductShapes = [
    {
        id: "round",
        name: "Round Duct",
        description: "Standard round duct commonly used in residential HVAC"
    },
    {
        id: "rectangular",
        name: "Rectangular Duct",
        description: "Rectangular duct commonly used when space is limited or for main trunks"
    }
];

// Room types with typical CFM requirements
const roomTypes = [
    { id: "bedroom", name: "Bedroom", defaultCFM: 100, area: 150 },
    { id: "living", name: "Living Room", defaultCFM: 160, area: 250 },
    { id: "kitchen", name: "Kitchen", defaultCFM: 150, area: 200 },
    { id: "bathroom", name: "Bathroom", defaultCFM: 75, area: 50 },
    { id: "custom", name: "Custom Room", defaultCFM: 100, area: 100 }
];

// Initialize the demo
function initAirflowDemo() {
    console.log('Duct sizing calculator initialized');
    
    // Display the UI
    renderUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial calculation
    updateCalculations();
}

// Render the main UI
function renderUI() {
    const demoContainer = document.getElementById('airflow-demo');
    if (!demoContainer) return;
    
    demoContainer.innerHTML = `
    <div class="row mb-4">
        <div class="col-lg-8">
            <h2 class="mb-3">Duct Sizing Calculator</h2>
            <p class="lead">Calculate proper duct sizes based on required airflow (CFM) and recommended air velocity.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Proper duct sizing is critical for HVAC system efficiency. Ducts that are too small create high static pressure and noise, 
                while oversized ducts waste material and can reduce air velocity needed for proper mixing.
            </div>
        </div>
    </div>
    
    <!-- Calculator and Visualization -->
    <div class="row g-4 mb-5">
        <!-- Input Section -->
        <div class="col-lg-5">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Input Parameters</h3>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="room-type" class="form-label">Room Type</label>
                        <select class="form-select" id="room-type">
                            ${roomTypes.map(room => 
                                `<option value="${room.id}" data-cfm="${room.defaultCFM}" data-area="${room.area}">${room.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="room-area" class="form-label">Room Area (sq ft)</label>
                        <input type="number" class="form-control" id="room-area" value="${roomTypes[0].area}">
                    </div>
                    
                    <div class="mb-3">
                        <label for="airflow-input" class="form-label">Required Airflow (CFM)</label>
                        <input type="number" class="form-control" id="airflow-input" value="${roomTypes[0].defaultCFM}">
                        <div class="form-text">Typical range: 1 CFM per sq ft</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="velocity-input" class="form-label">Target Air Velocity (FPM)</label>
                        <input type="range" class="form-range" id="velocity-input" min="600" max="1200" value="900">
                        <div class="d-flex justify-content-between">
                            <span class="form-text">600 FPM</span>
                            <span class="form-text fw-bold" id="velocity-value">900 FPM</span>
                            <span class="form-text">1200 FPM</span>
                        </div>
                        <div class="form-text">Recommended range: 600-1200 FPM for supply, lower for return</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="duct-shape" class="form-label">Duct Type</label>
                        <select class="form-select" id="duct-shape">
                            ${ductShapes.map(shape => 
                                `<option value="${shape.id}">${shape.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div id="rectangular-dims" style="display: none;">
                        <div class="mb-3">
                            <label for="rect-width" class="form-label">Width (inches)</label>
                            <select class="form-select" id="rect-width">
                                ${generateSizeOptions(6, 36, 2)}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="rect-height" class="form-label">Height (inches)</label>
                            <select class="form-select" id="rect-height">
                                ${generateSizeOptions(6, 24, 2)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Results Section -->
        <div class="col-lg-7">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Calculation Results</h3>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="result-card p-3 border rounded mb-3">
                                <h5>Round Duct Diameter</h5>
                                <h2 id="round-diameter" class="mb-0">0.0"</h2>
                                <p class="text-muted">Calculated ideal diameter</p>
                                <h3 id="round-standard" class="mb-0 text-primary">0"</h3>
                                <p class="text-muted">Nearest standard size</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="result-card p-3 border rounded mb-3">
                                <h5>Rectangular Equivalent</h5>
                                <h2 id="rect-dimensions" class="mb-0">0" × 0"</h2>
                                <p class="text-muted">Width × Height</p>
                                <h3 id="rect-area" class="mb-0 text-primary">0 sq.in.</h3>
                                <p class="text-muted">Cross-sectional area</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="duct-visualization" class="text-center py-3">
                        <!-- SVG for duct visualization will be inserted here -->
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <div class="result-card p-3 border rounded mb-3">
                                <h5>Actual Air Velocity</h5>
                                <h2 id="actual-velocity" class="mb-0">0 FPM</h2>
                                <p id="velocity-status" class="mb-0 text-success">Within range</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="result-card p-3 border rounded mb-3">
                                <h5>Friction Loss</h5>
                                <h2 id="friction-loss" class="mb-0">0.000 in.wc/100ft</h2>
                                <p id="friction-status" class="mb-0 text-success">Good</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Educational Content -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Duct Sizing Fundamentals</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">Sizing Principles</h4>
                            <ul>
                                <li><strong>Airflow (CFM):</strong> The volume of air moved per minute, generally calculated at 1 CFM per square foot for residential applications.</li>
                                <li><strong>Velocity (FPM):</strong> The speed of air through the duct, typically kept between 600-1200 FPM for supply and 400-900 FPM for return.</li>
                                <li><strong>Equal Friction Method:</strong> Designs ductwork so each foot of duct has the same pressure drop, typically 0.08-0.1 in.wc per 100ft.</li>
                                <li><strong>Effective Length:</strong> The actual length plus equivalent length of all fittings.</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">Common Mistakes</h4>
                            <ul>
                                <li><strong>Undersized Ducts:</strong> Cause high static pressure, reduced airflow, and increased energy consumption.</li>
                                <li><strong>Oversized Ducts:</strong> Waste material, space, and can cause low velocity issues affecting air mixing.</li>
                                <li><strong>Sharp Turns:</strong> Create turbulence and increase pressure drop - use gradual turns or turning vanes.</li>
                                <li><strong>Ignoring Equivalent Length:</strong> Fittings add resistance that must be accounted for in total system design.</li>
                                <li><strong>Improper Balancing:</strong> Failing to properly balance supply and return can cause building pressure issues.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <h4 class="h6 fw-bold">Formulas Used in Calculations</h4>
                        <ul>
                            <li><strong>Area (sq in) = π × (Diameter/2)²</strong> for round ducts</li>
                            <li><strong>Area (sq in) = Width × Height</strong> for rectangular ducts</li>
                            <li><strong>Velocity (FPM) = CFM ÷ (Area ÷ 144)</strong></li>
                            <li><strong>Diameter (in) = 2 × √(Area ÷ π)</strong> when solving for round ducts</li>
                            <li><strong>Hydraulic Diameter = 4 × Area ÷ Perimeter</strong> for rectangular ducts</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// Generate options for dropdown
function generateSizeOptions(min, max, step) {
    let options = '';
    for (let i = min; i <= max; i += step) {
        options += `<option value="${i}">${i}"</option>`;
    }
    return options;
}

// Set up event listeners
function setupEventListeners() {
    // Room type selection
    document.getElementById('room-type').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const defaultCFM = selectedOption.getAttribute('data-cfm');
        const defaultArea = selectedOption.getAttribute('data-area');
        
        document.getElementById('airflow-input').value = defaultCFM;
        document.getElementById('room-area').value = defaultArea;
        
        updateCalculations();
    });
    
    // Room area input
    document.getElementById('room-area').addEventListener('input', function() {
        if (document.getElementById('room-type').value === 'custom') {
            // For custom room, suggest 1 CFM per square foot
            const area = parseFloat(this.value) || 0;
            document.getElementById('airflow-input').value = Math.round(area);
        }
        updateCalculations();
    });
    
    // Airflow input
    document.getElementById('airflow-input').addEventListener('input', function() {
        updateCalculations();
    });
    
    // Velocity slider
    document.getElementById('velocity-input').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('velocity-value').textContent = value + ' FPM';
        updateCalculations();
    });
    
    // Duct shape selection
    document.getElementById('duct-shape').addEventListener('change', function() {
        if (this.value === 'rectangular') {
            document.getElementById('rectangular-dims').style.display = 'block';
        } else {
            document.getElementById('rectangular-dims').style.display = 'none';
        }
        updateCalculations();
    });
    
    // Rectangular dimensions
    document.getElementById('rect-width').addEventListener('change', updateCalculations);
    document.getElementById('rect-height').addEventListener('change', updateCalculations);
}

// Update all calculations based on current inputs
function updateCalculations() {
    const airflow = parseFloat(document.getElementById('airflow-input').value) || 0;
    const targetVelocity = parseFloat(document.getElementById('velocity-input').value) || 900;
    const ductShape = document.getElementById('duct-shape').value;
    
    // Calculate cross-sectional area needed
    const requiredAreaSqFt = airflow / targetVelocity;
    const requiredAreaSqIn = requiredAreaSqFt * 144; // Convert to square inches
    
    // Round duct diameter calculation
    const exactDiameter = 2 * Math.sqrt(requiredAreaSqIn / Math.PI);
    const roundedDiameter = Math.round(exactDiameter * 10) / 10; // Round to nearest 0.1"
    
    // Find nearest standard round duct size
    const standardSizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 30, 36];
    let standardSize = standardSizes[0];
    for (const size of standardSizes) {
        if (size >= roundedDiameter) {
            standardSize = size;
            break;
        }
    }
    
    // Calculate actual area and velocity for the standard size
    const actualRoundArea = Math.PI * Math.pow(standardSize/2, 2);
    const actualRoundVelocity = airflow / (actualRoundArea / 144);
    
    // Display round duct results
    document.getElementById('round-diameter').textContent = roundedDiameter.toFixed(1) + '"';
    document.getElementById('round-standard').textContent = standardSize + '"';
    
    // Rectangular duct calculations
    let rectangularWidth, rectangularHeight, rectangularArea;
    
    if (ductShape === 'rectangular') {
        // Get user selected dimensions
        rectangularWidth = parseInt(document.getElementById('rect-width').value) || 8;
        rectangularHeight = parseInt(document.getElementById('rect-height').value) || 8;
        rectangularArea = rectangularWidth * rectangularHeight;
    } else {
        // Suggest a rectangular equivalent (aspect ratio around 1.5)
        const aspectRatio = 1.5;
        // Starting with area equivalent to the round duct
        rectangularArea = actualRoundArea;
        rectangularHeight = Math.round(Math.sqrt(rectangularArea / aspectRatio) / 2) * 2; // Round to even number
        rectangularWidth = Math.round((rectangularArea / rectangularHeight) / 2) * 2; // Round to even number
        
        // Ensure minimum dimensions
        if (rectangularHeight < 6) rectangularHeight = 6;
        if (rectangularWidth < 6) rectangularWidth = 6;
        
        // Recalculate area with adjusted dimensions
        rectangularArea = rectangularWidth * rectangularHeight;
    }
    
    // Calculate rectangular duct velocity
    const actualRectVelocity = airflow / (rectangularArea / 144);
    
    // Calculate hydraulic diameter for rectangular duct
    const hydraulicDiameter = (4 * rectangularArea) / (2 * (rectangularWidth + rectangularHeight));
    
    // Display rectangular duct results
    document.getElementById('rect-dimensions').textContent = rectangularWidth + '" × ' + rectangularHeight + '"';
    document.getElementById('rect-area').textContent = rectangularArea + ' sq.in.';
    
    // Display actual velocity and status
    const actualVelocity = ductShape === 'rectangular' ? actualRectVelocity : actualRoundVelocity;
    document.getElementById('actual-velocity').textContent = Math.round(actualVelocity) + ' FPM';
    
    const velocityStatus = document.getElementById('velocity-status');
    if (actualVelocity < VELOCITY_MIN) {
        velocityStatus.textContent = 'Too low - may cause poor air mixing';
        velocityStatus.className = 'mb-0 text-warning';
    } else if (actualVelocity > VELOCITY_MAX) {
        velocityStatus.textContent = 'Too high - may cause noise';
        velocityStatus.className = 'mb-0 text-danger';
    } else {
        velocityStatus.textContent = 'Within recommended range';
        velocityStatus.className = 'mb-0 text-success';
    }
    
    // Calculate friction loss (simplified calculation)
    // Using a common approximation formula for friction loss
    const diameter = ductShape === 'rectangular' ? hydraulicDiameter : standardSize;
    const frictionLoss = 0.0001 * Math.pow(actualVelocity, 1.9) / Math.pow(diameter, 1.22);
    document.getElementById('friction-loss').textContent = frictionLoss.toFixed(3) + ' in.wc/100ft';
    
    const frictionStatus = document.getElementById('friction-status');
    if (frictionLoss > 0.15) {
        frictionStatus.textContent = 'High - may cause excessive pressure drop';
        frictionStatus.className = 'mb-0 text-danger';
    } else if (frictionLoss < 0.05) {
        frictionStatus.textContent = 'Low - may indicate oversized duct';
        frictionStatus.className = 'mb-0 text-warning';
    } else {
        frictionStatus.textContent = 'Good range';
        frictionStatus.className = 'mb-0 text-success';
    }
    
    // Update the duct visualization
    drawDuctVisualization(ductShape, standardSize, rectangularWidth, rectangularHeight);
}

// Draw the duct visualization using SVG
function drawDuctVisualization(ductShape, roundDiameter, rectWidth, rectHeight) {
    const container = document.getElementById('duct-visualization');
    if (!container) return;
    
    // Scale for visualization (pixels per inch)
    const scale = 5;
    
    // Create SVG element
    container.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // Calculate dimensions based on duct size
    let svgWidth, svgHeight;
    
    if (ductShape === 'round') {
        svgWidth = roundDiameter * scale + 40;
        svgHeight = roundDiameter * scale + 40;
        svg.setAttribute('width', svgWidth);
        svg.setAttribute('height', svgHeight);
        svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        
        // Draw round duct
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', svgWidth/2);
        circle.setAttribute('cy', svgHeight/2);
        circle.setAttribute('r', (roundDiameter * scale)/2);
        circle.setAttribute('fill', '#d1e7ff');
        circle.setAttribute('stroke', '#0d6efd');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
        
        // Add dimension text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', svgWidth/2);
        text.setAttribute('y', svgHeight/2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#0d6efd');
        text.textContent = roundDiameter + '"';
        svg.appendChild(text);
        
    } else { // rectangular
        svgWidth = rectWidth * scale + 40;
        svgHeight = rectHeight * scale + 40;
        svg.setAttribute('width', svgWidth);
        svg.setAttribute('height', svgHeight);
        svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        
        // Draw rectangular duct
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 20);
        rect.setAttribute('y', 20);
        rect.setAttribute('width', rectWidth * scale);
        rect.setAttribute('height', rectHeight * scale);
        rect.setAttribute('fill', '#d1e7ff');
        rect.setAttribute('stroke', '#0d6efd');
        rect.setAttribute('stroke-width', '2');
        svg.appendChild(rect);
        
        // Add width dimension text
        const widthText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        widthText.setAttribute('x', 20 + (rectWidth * scale)/2);
        widthText.setAttribute('y', 15);
        widthText.setAttribute('text-anchor', 'middle');
        widthText.setAttribute('font-size', '12');
        widthText.setAttribute('fill', '#0d6efd');
        widthText.textContent = rectWidth + '"';
        svg.appendChild(widthText);
        
        // Add height dimension text
        const heightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        heightText.setAttribute('x', 10);
        heightText.setAttribute('y', 20 + (rectHeight * scale)/2);
        heightText.setAttribute('text-anchor', 'middle');
        heightText.setAttribute('dominant-baseline', 'middle');
        heightText.setAttribute('transform', `rotate(-90 10 ${20 + (rectHeight * scale)/2})`);
        heightText.setAttribute('font-size', '12');
        heightText.setAttribute('fill', '#0d6efd');
        heightText.textContent = rectHeight + '"';
        svg.appendChild(heightText);
    }
    
    container.appendChild(svg);
}

// Make initialize function global
window.initAirflowDemo = initAirflowDemo;