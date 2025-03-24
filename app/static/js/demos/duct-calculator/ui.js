/**
 * Duct Friction Calculator UI Components
 */
import { 
    STANDARD_ROUND_SIZES, 
    STANDARD_RECT_WIDTHS, 
    STANDARD_RECT_HEIGHTS, 
    DUCT_MATERIALS 
} from './constants.js';

/**
 * Renders the main UI for the duct friction calculator
 * @param {HTMLElement} demoContainer - The container element for the demo
 */
export function renderUI(demoContainer) {
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
