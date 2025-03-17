/**
 * Duct Friction Loss Calculator Demo
 * A practical tool for HVAC technicians to calculate duct friction loss
 * and understand the relationship between airflow, duct size, and static pressure.
 */

// Constants for calculations
const AIR_DENSITY = 0.075; // lbs/ft³ at standard conditions
const DEFAULT_FRICTION_RATE = 0.1; // in.wc per 100 ft
const DEFAULT_VELOCITY_LIMIT = 1000; // fpm

// Standard round duct sizes in inches
const STANDARD_ROUND_SIZES = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 42, 44, 46, 48];

// Standard rectangular dimensions in inches (width)
const STANDARD_RECT_WIDTHS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 42, 44, 46, 48, 52, 56, 60];

// Standard rectangular dimensions in inches (height)
const STANDARD_RECT_HEIGHTS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

// Common duct materials with relative roughness factors
const DUCT_MATERIALS = [
    { id: 'galvanized', name: 'Galvanized Steel', roughness: 1.0 },
    { id: 'flexible', name: 'Flexible Duct', roughness: 1.35 },
    { id: 'fibrous', name: 'Fibrous Glass Duct Board', roughness: 1.2 },
    { id: 'spiral', name: 'Spiral Duct', roughness: 0.95 }
];

// Initialize the demo
function initDuctFrictionCalculator() {
    console.log('Duct friction calculator initializing...');
    
    // Get the container
    const demoContainer = document.getElementById('duct-friction-demo');
    
    if (!demoContainer) {
        console.error('Demo container not found');
        return;
    }
    
    // Simple initialization for testing
    demoContainer.innerHTML = `
        <div class="alert alert-info">
            <h3>Duct Friction Calculator</h3>
            <p>This is a simple test to confirm the demo is initializing correctly.</p>
        </div>
    `;
    
    console.log('Duct friction calculator initialized with test content');
}

// Render the main UI
function renderUI() {
    const demoContainer = document.getElementById('duct-friction-demo');
    if (!demoContainer) {
        console.error('Demo container not found');
        return;
    }
    
    demoContainer.innerHTML = `
    <div class="row mb-4">
        <div class="col-lg-8">
            <h2 class="mb-3">Duct Friction Loss Calculator</h2>
            <p class="lead">Calculate duct friction loss, velocity, and find optimal duct sizes based on the Equal Friction Method.</p>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                The Equal Friction Method is commonly used to size ducts in HVAC systems. It maintains a constant friction rate 
                throughout the system, typically between 0.08-0.1 inches water column per 100 feet of duct.
            </div>
        </div>
    </div>
    
    <!-- Calculator Inputs and Results -->
    <div class="row g-4 mb-5">
        <!-- Left Column - Calculator Modes -->
        <div class="col-lg-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Calculator Mode</h3>
                </div>
                <div class="card-body">
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" name="calc-mode" id="mode-duct-size" value="duct-size" checked>
                        <label class="form-check-label" for="mode-duct-size">
                            <strong>Find Duct Size</strong>
                            <span class="d-block text-muted small">Calculate the required duct size for a given airflow and friction rate</span>
                        </label>
                    </div>
                    
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" name="calc-mode" id="mode-airflow" value="airflow">
                        <label class="form-check-label" for="mode-airflow">
                            <strong>Find Airflow</strong>
                            <span class="d-block text-muted small">Calculate the maximum airflow for a given duct size and friction rate</span>
                        </label>
                    </div>
                    
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="radio" name="calc-mode" id="mode-friction" value="friction">
                        <label class="form-check-label" for="mode-friction">
                            <strong>Find Friction Rate</strong>
                            <span class="d-block text-muted small">Calculate the friction rate for a given duct size and airflow</span>
                        </label>
                    </div>
                    
                    <div class="mb-3">
                        <label for="duct-material" class="form-label">Duct Material</label>
                        <select class="form-select" id="duct-material">
                            ${DUCT_MATERIALS.map(material => 
                                `<option value="${material.id}" data-roughness="${material.roughness}">${material.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="duct-length" class="form-label">Duct Length (ft)</label>
                        <input type="number" class="form-control" id="duct-length" value="100">
                        <div class="form-text">Actual duct run length</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="fitting-count" class="form-label">Number of Fittings</label>
                        <input type="number" class="form-control" id="fitting-count" value="2">
                        <div class="form-text">Elbows, transitions, etc.</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Middle Column - Input Parameters -->
        <div class="col-lg-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Input Parameters</h3>
                </div>
                <div class="card-body">
                    <!-- Airflow Input - Always visible -->
                    <div class="mb-3" id="airflow-input-group">
                        <label for="airflow-input" class="form-label">Airflow (CFM)</label>
                        <input type="number" class="form-control" id="airflow-input" value="400">
                        <div class="form-text">Cubic feet per minute</div>
                    </div>
                    
                    <!-- Friction Rate Input - Visible in modes 1 and 2 -->
                    <div class="mb-3" id="friction-input-group">
                        <label for="friction-input" class="form-label">Friction Rate (in.wc/100ft)</label>
                        <input type="number" class="form-control" id="friction-input" value="0.1" step="0.01">
                        <div class="form-text">0.08-0.1 is typical for residential</div>
                    </div>
                    
                    <!-- Velocity Limit Input - Visible in modes 1 and 2 -->
                    <div class="mb-3" id="velocity-input-group">
                        <label for="velocity-limit" class="form-label">Maximum Velocity (FPM)</label>
                        <input type="number" class="form-control" id="velocity-limit" value="1200">
                        <div class="form-text">Typically 700-1200 FPM for supply</div>
                    </div>
                    
                    <!-- Duct Shape Selection - Always visible -->
                    <div class="mb-3">
                        <label class="form-label">Duct Shape</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="duct-shape" id="shape-round" value="round" checked>
                            <label class="form-check-label" for="shape-round">Round Duct</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="duct-shape" id="shape-rect" value="rectangular">
                            <label class="form-check-label" for="shape-rect">Rectangular Duct</label>
                        </div>
                    </div>
                    
                    <!-- Round Duct Size Input - Visible in modes 2 and 3 -->
                    <div id="round-size-group" style="display: block;">
                        <div class="mb-3">
                            <label for="round-diameter" class="form-label">Diameter (inches)</label>
                            <select class="form-select" id="round-diameter">
                                ${STANDARD_ROUND_SIZES.map(size => 
                                    `<option value="${size}">${size}"</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <!-- Rectangular Duct Size Input - Hidden initially -->
                    <div id="rect-size-group" style="display: none;">
                        <div class="mb-3">
                            <label for="rect-width" class="form-label">Width (inches)</label>
                            <select class="form-select" id="rect-width">
                                ${STANDARD_RECT_WIDTHS.map(size => 
                                    `<option value="${size}">${size}"</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="rect-height" class="form-label">Height (inches)</label>
                            <select class="form-select" id="rect-height">
                                ${STANDARD_RECT_HEIGHTS.map(size => 
                                    `<option value="${size}">${size}"</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-100 mt-3" id="calculate-btn">Calculate</button>
                </div>
            </div>
        </div>
        
        <!-- Right Column - Results -->
        <div class="col-lg-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Results</h3>
                </div>
                <div class="card-body">
                    <!-- Duct Size Results - For mode 1 -->
                    <div id="duct-size-results">
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Recommended Round Duct</h5>
                            <h2 id="round-result" class="mb-0">0"</h2>
                            <p class="text-muted mb-0">Standard size</p>
                        </div>
                        
                        <div class="result-card p-3 border rounded mb-4">
                            <h5>Rectangular Equivalent</h5>
                            <h2 id="rect-result" class="mb-0">0" × 0"</h2>
                            <p class="text-muted mb-0">Width × Height</p>
                        </div>
                    </div>
                    
                    <!-- Airflow Results - For mode 2 -->
                    <div id="airflow-results" style="display: none;">
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Maximum Airflow</h5>
                            <h2 id="max-airflow-result" class="mb-0">0 CFM</h2>
                            <p class="text-muted mb-0">For selected duct size</p>
                        </div>
                    </div>
                    
                    <!-- Friction Results - For mode 3 -->
                    <div id="friction-results" style="display: none;">
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Friction Rate</h5>
                            <h2 id="friction-result" class="mb-0">0.000 in.wc/100ft</h2>
                            <p id="friction-rating" class="mb-0 text-success">Within range</p>
                        </div>
                    </div>
                    
                    <!-- Common Results - For all modes -->
                    <div id="common-results">
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Air Velocity</h5>
                            <h2 id="velocity-result" class="mb-0">0 FPM</h2>
                            <p id="velocity-rating" class="mb-0 text-success">Within range</p>
                        </div>
                        
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Equivalent Length</h5>
                            <h2 id="equivalent-length" class="mb-0">0 ft</h2>
                            <p class="text-muted mb-0">Including fittings</p>
                        </div>
                        
                        <div class="result-card p-3 border rounded mb-3">
                            <h5>Total Pressure Drop</h5>
                            <h2 id="total-pressure-drop" class="mb-0">0.000 in.wc</h2>
                            <p class="text-muted mb-0">For entire duct run</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Friction Chart Section -->
    <div class="row mt-4 mb-5">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Friction Chart</h3>
                </div>
                <div class="card-body">
                    <canvas id="friction-chart" height="350"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Educational Content -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0">Understanding Duct Friction Loss</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">The Equal Friction Method</h4>
                            <p>The equal friction method is used to design duct systems where each foot of duct has the same pressure drop:</p>
                            <ul>
                                <li><strong>Typical friction rate:</strong> 0.08-0.1 inches water column per 100 feet for residential systems</li>
                                <li><strong>Higher friction rates</strong> result in smaller ducts but more noise and higher operating costs</li>
                                <li><strong>Lower friction rates</strong> result in larger ducts but lower noise and operating costs</li>
                                <li>Duct size decreases as you move away from the fan as airflow decreases</li>
                                <li>This method balances initial cost and operating cost considerations</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">Factors That Increase Friction Loss</h4>
                            <ul>
                                <li><strong>Rougher duct material:</strong> Flexible ducts have significantly higher friction loss than smooth metal ducts</li>
                                <li><strong>Higher velocity:</strong> Friction increases exponentially with air velocity</li>
                                <li><strong>Smaller duct diameter:</strong> Smaller ducts have higher friction per unit airflow</li>
                                <li><strong>Fittings:</strong> Elbows, transitions, and branches add equivalent length to the system</li>
                                <li><strong>Sharp turns:</strong> Gradual bends create less turbulence and pressure loss than sharp turns</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">Equivalent Length of Fittings</h4>
                            <ul>
                                <li><strong>90° elbow (smooth radius):</strong> 15-30 feet of straight duct</li>
                                <li><strong>90° elbow (sharp mitered):</strong> 35-50 feet of straight duct</li>
                                <li><strong>45° elbow:</strong> 10-15 feet of straight duct</li>
                                <li><strong>Branch takeoff:</strong> 20-40 feet of straight duct</li>
                                <li><strong>Abrupt entrance/exit:</strong> 10-15 feet of straight duct</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h4 class="h6 fw-bold">Velocity Recommendations</h4>
                            <ul>
                                <li><strong>Main supply ducts:</strong> 700-1200 FPM</li>
                                <li><strong>Branch supply ducts:</strong> 600-900 FPM</li>
                                <li><strong>Supply outlets:</strong> 400-700 FPM</li>
                                <li><strong>Return ducts:</strong> 600-900 FPM</li>
                                <li><strong>Return grilles:</strong> 300-500 FPM</li>
                            </ul>
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>Note:</strong> Velocities above 900 FPM in residential applications may create noticeable noise.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

// Set up event listeners
function setupEventListeners() {
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

// Update calculator mode (which inputs/outputs to show)
function updateCalculatorMode() {
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

// Update all calculations based on current inputs
function updateCalculations() {
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

// Calculate duct size based on airflow and friction rate
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

// Calculate maximum airflow based on duct size and friction rate
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

// Calculate friction rate based on duct size and airflow
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

// Find the nearest standard round duct size (round up)
function findNearestStandardRound(diameter) {
    for (const size of STANDARD_ROUND_SIZES) {
        if (size >= diameter) {
            return size;
        }
    }
    return STANDARD_ROUND_SIZES[STANDARD_ROUND_SIZES.length - 1]; // Return largest if none found
}

// Find rectangular equivalent for round duct
function findRectangularEquivalent(roundDiameter, aspectRatio = 1.5) {
    const roundArea = Math.PI * Math.pow(roundDiameter / 2, 2);
    
    // Calculate ideal dimensions based on aspect ratio
    let height = Math.sqrt(roundArea / aspectRatio);
    let width = height * aspectRatio;
    
    // Find nearest standard sizes
    const stdHeight = findNearestStandardHeight(height);
    const stdWidth = findNearestStandardWidth(width);
    
    return { width: stdWidth, height: stdHeight };
}

// Find the nearest standard rectangular height
function findNearestStandardHeight(height) {
    for (const size of STANDARD_RECT_HEIGHTS) {
        if (size >= height) {
            return size;
        }
    }
    return STANDARD_RECT_HEIGHTS[STANDARD_RECT_HEIGHTS.length - 1]; // Return largest if none found
}

// Find the nearest standard rectangular width
function findNearestStandardWidth(width) {
    for (const size of STANDARD_RECT_WIDTHS) {
        if (size >= width) {
            return size;
        }
    }
    return STANDARD_RECT_WIDTHS[STANDARD_RECT_WIDTHS.length - 1]; // Return largest if none found
}

// Create the friction chart
function createFrictionChart() {
    if (typeof Chart === 'undefined') {
        // Load Chart.js if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            initFrictionChart();
        };
        document.head.appendChild(script);
    } else {
        initFrictionChart();
    }
}

// Initialize the friction chart
function initFrictionChart() {
    const ctx = document.getElementById('friction-chart');
    if (!ctx) return;
    
    // Generate data points for the chart
    const roundSizes = [6, 8, 10, 12, 14, 16, 18, 20, 24]; // Duct diameters
    const frictionRates = [0.05, 0.1, 0.2]; // Friction rates to show
    
    const datasets = [];
    
    // Create a dataset for each friction rate
    frictionRates.forEach((frictionRate, index) => {
        const data = [];
        const colors = ['rgba(0, 123, 255, 0.7)', 'rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'];
        
        // Calculate airflow for each duct size at this friction rate
        roundSizes.forEach(size => {
            const hydraulicDiameter = size / 12; // Diameter in feet
            const airflow = 4005 * Math.pow(hydraulicDiameter, 2.5) * Math.sqrt(frictionRate);
            data.push({ x: airflow, y: size });
        });
        
        datasets.push({
            label: `${frictionRate} in.wc/100ft`,
            data: data,
            borderColor: colors[index],
            backgroundColor: colors[index],
            fill: false,
            tension: 0.4
        });
    });
    
    // Create the chart
    const frictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Airflow (CFM)'
                    },
                    min: 0,
                    max: 2000
                },
                y: {
                    title: {
                        display: true,
                        text: 'Duct Diameter (inches)'
                    },
                    min: 4,
                    max: 26
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Duct Size vs. Airflow at Different Friction Rates'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${Math.round(context.parsed.x)} CFM at ${context.parsed.y}" diameter`;
                        }
                    }
                }
            }
        }
    });
}

// Make initialize function available to the page
window.initDuctFrictionCalculator = initDuctFrictionCalculator;

// Call this to debug the issue
console.log('Duct friction calculator script loaded, function available:', Boolean(window.initDuctFrictionCalculator));