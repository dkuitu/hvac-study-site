/**
 * Refrigeration Diagnostics Demo
 * Interactive simulation for diagnosing HVAC refrigeration system issues
 * using pressure and temperature readings.
 */

// R-410A PT Chart Data - Standard industry chart values
const ptChartData = {
    '-60': 1.2,
    '-55': 3.4,
    '-50': 5.8,
    '-45': 8.6,
    '-40': 11.6,
    '-35': 14.9,
    '-30': 18.5,
    '-25': 22.5,
    '-20': 26.9,
    '-15': 31.7,
    '-10': 36.8,
    '-5': 42.5,
    '0': 48.6,
    '1': 49.9,
    '2': 51.2,
    '3': 52.5,
    '4': 53.8,
    '5': 55.2,
    '6': 56.6,
    '7': 58.0,
    '8': 59.4,
    '9': 60.9,
    '10': 62.3,
    '11': 63.8,
    '12': 65.4,
    '13': 66.9,
    '14': 68.5,
    '15': 70.0,
    '16': 71.7,
    '17': 73.3,
    '18': 75.0,
    '19': 76.6,
    '20': 78.3,
    '21': 80.1,
    '22': 81.8,
    '23': 83.6,
    '24': 85.4,
    '25': 87.3,
    '26': 89.1,
    '27': 91.0,
    '28': 92.9,
    '29': 94.9,
    '30': 96.8,
    '31': 98.8,
    '32': 100.8,
    '33': 102.9,
    '34': 105.0,
    '35': 107.1,
    '36': 109.2,
    '37': 111.4,
    '38': 113.6,
    '39': 115.8,
    '40': 118.0,
    '41': 120.3,
    '42': 122.6,
    '43': 125.0,
    '44': 127.3,
    '45': 129.7,
    '46': 132.2,
    '47': 134.6,
    '48': 137.1,
    '49': 139.6,
    '50': 142.2,
    '55': 155.6,
    '60': 169.6,
    '65': 184.6,
    '70': 200.6,
    '75': 217.4,
    '80': 235.3,
    '85': 254.1,
    '90': 274.1,
    '95': 295.1,
    '100': 317.2,
    '105': 340.5,
    '110': 365.0,
    '115': 390.7,
    '120': 417.7,
    '125': 445.9,
    '130': 475.6,
    '135': 506.5,
    '140': 539.0,
    '145': 572.8,
    '150': 608.1,
    '155': 645.0
};

// Diagnostic scenarios
const scenarios = [
    {
        name: "Normal Operation",
        highPressure: 295.1,
        lowPressure: 125.0,
        ambientTemp: 85,
        refrigerant: "R-410A",
        condExitTemp: 85,
        evapExitTemp: 55,
        correctSuperheat: 12,
        correctSubcooling: 10,
        correctDiagnosis: "normal",
        hint: "Normal operation typically shows 8-12°F superheat and 8-12°F subcooling"
    },
    {
        name: "Low Refrigerant Charge",
        highPressure: 274.1,
        lowPressure: 107.1,
        ambientTemp: 85,
        refrigerant: "R-410A",
        condExitTemp: 80,
        evapExitTemp: 60,
        correctSuperheat: 25,
        correctSubcooling: 5,
        correctDiagnosis: "low-charge",
        hint: "Low charge typically shows high superheat and low subcooling"
    },
    {
        name: "High Refrigerant Charge",
        highPressure: 340.5,
        lowPressure: 142.2,
        ambientTemp: 85, 
        refrigerant: "R-410A",
        condExitTemp: 90,
        evapExitTemp: 53,
        correctSuperheat: 3,
        correctSubcooling: 15,
        correctDiagnosis: "high-charge",
        hint: "High charge typically shows low superheat and high subcooling"
    },
    {
        name: "Restricted TXV",
        highPressure: 295.1,
        lowPressure: 92.9,
        ambientTemp: 85,
        refrigerant: "R-410A",
        condExitTemp: 85,
        evapExitTemp: 60,
        correctSuperheat: 32,
        correctSubcooling: 10,
        correctDiagnosis: "restricted-txv",
        hint: "Restricted TXV typically shows high superheat with normal subcooling"
    },
    {
        name: "Dirty Condenser",
        highPressure: 365.0,
        lowPressure: 132.2,
        ambientTemp: 85,
        refrigerant: "R-410A",
        condExitTemp: 100,
        evapExitTemp: 50,
        correctSuperheat: 4,
        correctSubcooling: 10,
        correctDiagnosis: "dirty-condenser",
        hint: "Dirty condenser typically shows high discharge pressure and often lower superheat"
    }
];

// Game state
let currentScenarioIndex = 0;
let score = 0;
let attempts = 0;
let highPressureGauge, lowPressureGauge;

// Initialize the demo
function initRefrigerationDemo() {
    // Populate PT chart
    populatePTChart();
    
    // Initialize gauges
    initializeGauges();
    
    // Load first scenario
    loadScenario(0);
    
    // Add event listeners for buttons
    document.getElementById('submit-diagnosis').addEventListener('click', checkDiagnosis);
    document.getElementById('next-scenario').addEventListener('click', nextScenario);
    
    // Modal event listeners for superheat
    const superheatModal = document.getElementById('superheatModal');
    const superheatInfo = document.getElementById('superheat-info');
    const closeSuperheatModal = document.getElementById('closeSuperheatModal');
    
    superheatInfo.addEventListener('click', function() {
        superheatModal.style.display = 'block';
    });
    
    closeSuperheatModal.addEventListener('click', function() {
        superheatModal.style.display = 'none';
    });
    
    // Modal event listeners for subcooling
    const subcoolingModal = document.getElementById('subcoolingModal');
    const subcoolingInfo = document.getElementById('subcooling-info');
    const closeSubcoolingModal = document.getElementById('closeSubcoolingModal');
    
    subcoolingInfo.addEventListener('click', function() {
        subcoolingModal.style.display = 'block';
    });
    
    closeSubcoolingModal.addEventListener('click', function() {
        subcoolingModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == superheatModal) {
            superheatModal.style.display = 'none';
        }
        if (event.target == subcoolingModal) {
            subcoolingModal.style.display = 'none';
        }
    });
}

// Fill PT chart table
function populatePTChart() {
    const tbody = document.getElementById('pt-table').getElementsByTagName('tbody')[0];
    const temps = Object.keys(ptChartData);
    let html = '';

    for (let i = 0; i < temps.length; i += 2) {
        html += '<tr>';
        html += `<td>${temps[i]}°</td><td>${ptChartData[temps[i]]}</td>`;
        if (temps[i+1]) {
            html += `<td>${temps[i+1]}°</td><td>${ptChartData[temps[i+1]]}</td>`;
        } else {
            html += '<td></td><td></td>';
        }
        html += '</tr>';
    }
    
    tbody.innerHTML = html;
}

// Initialize gauges
function initializeGauges() {
    const highPressureCanvas = document.getElementById('highPressureGauge');
    highPressureGauge = new Gauge(highPressureCanvas).setOptions({
        angle: 0,
        lineWidth: 0.2,
        radiusScale: 0.9,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#6FADCF',
        colorStop: '#8FC0DA',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
        staticZones: [
            {strokeStyle: "rgb(60, 190, 60)", min: 0, max: 200},
            {strokeStyle: "rgb(255, 200, 0)", min: 200, max: 350},
            {strokeStyle: "rgb(255, 30, 0)", min: 350, max: 650}
        ],
    });
    highPressureGauge.maxValue = 650;
    highPressureGauge.setMinValue(0);
    highPressureGauge.animationSpeed = 32;
    
    const lowPressureCanvas = document.getElementById('lowPressureGauge');
    lowPressureGauge = new Gauge(lowPressureCanvas).setOptions({
        angle: 0,
        lineWidth: 0.2,
        radiusScale: 0.9,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#6FADCF',
        colorStop: '#8FC0DA',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
        staticZones: [
            {strokeStyle: "rgb(255, 30, 0)", min: 0, max: 50},
            {strokeStyle: "rgb(60, 190, 60)", min: 50, max: 150},
            {strokeStyle: "rgb(255, 200, 0)", min: 150, max: 200},
            {strokeStyle: "rgb(255, 30, 0)", min: 200, max: 250}
        ],
    });
    lowPressureGauge.maxValue = 250;
    lowPressureGauge.setMinValue(0);
    lowPressureGauge.animationSpeed = 32;
}

// Load scenario
function loadScenario(index) {
    const scenario = scenarios[index];
    
    // Update gauge values
    highPressureGauge.set(scenario.highPressure);
    lowPressureGauge.set(scenario.lowPressure);
    
    // Update displayed pressure values
    document.getElementById('high-pressure-value').textContent = `${scenario.highPressure.toFixed(1)} psig`;
    document.getElementById('low-pressure-value').textContent = `${scenario.lowPressure.toFixed(1)} psig`;
    
    // Update display values
    document.getElementById('ambient-temp').textContent = `${scenario.ambientTemp}°F`;
    document.getElementById('refrigerant-type').textContent = scenario.refrigerant;
    document.getElementById('cond-exit-temp').textContent = `${scenario.condExitTemp}°F`;
    document.getElementById('evap-exit-temp').textContent = `${scenario.evapExitTemp}°F`;
    
    // Reset inputs
    document.getElementById('superheat-calc').value = '';
    document.getElementById('subcooling-calc').value = '';
    document.getElementById('fault-diagnosis').value = '';
    
    // Hide result
    document.getElementById('diagnosis-result').style.display = 'none';
}

// Temperature lookup function
function getTempFromPressure(pressure) {
    // Find the closest pressure in our table
    const temps = Object.keys(ptChartData);
    let closestTemp = temps[0];
    let minDiff = Math.abs(ptChartData[temps[0]] - pressure);
    
    for (let i = 1; i < temps.length; i++) {
        const diff = Math.abs(ptChartData[temps[i]] - pressure);
        if (diff < minDiff) {
            minDiff = diff;
            closestTemp = temps[i];
        }
    }
    
    return parseInt(closestTemp);
}

// Check diagnosis
function checkDiagnosis() {
    const scenario = scenarios[currentScenarioIndex];
    const userSuperheat = parseFloat(document.getElementById('superheat-calc').value);
    const userSubcooling = parseFloat(document.getElementById('subcooling-calc').value);
    const userDiagnosis = document.getElementById('fault-diagnosis').value;
    
    const resultElement = document.getElementById('diagnosis-result');
    const nextButton = document.getElementById('next-scenario');
    
    // Check if all inputs are filled
    if (isNaN(userSuperheat) || isNaN(userSubcooling) || userDiagnosis === '') {
        resultElement.textContent = 'Please fill in all fields before submitting.';
        resultElement.className = 'results incorrect alert alert-danger';
        resultElement.style.display = 'block';
        return;
    }
    
    // Only increment attempt count once per scenario
    if (!scenario.attempted) {
        attempts++;
        scenario.attempted = true;
    }
    
    let isCorrect = true;
    let message = '';
    
    // Check superheat (allow +/- 2°F)
    if (Math.abs(userSuperheat - scenario.correctSuperheat) > 2) {
        isCorrect = false;
        message += `Incorrect superheat. You calculated ${userSuperheat}°F, but it should be around ${scenario.correctSuperheat}°F. `;
    }
    
    // Check subcooling (allow +/- 2°F)
    if (Math.abs(userSubcooling - scenario.correctSubcooling) > 2) {
        isCorrect = false;
        message += `Incorrect subcooling. You calculated ${userSubcooling}°F, but it should be around ${scenario.correctSubcooling}°F. `;
    }
    
    // Check diagnosis
    if (userDiagnosis !== scenario.correctDiagnosis) {
        isCorrect = false;
        message += `Incorrect diagnosis. You selected "${document.getElementById('fault-diagnosis').options[document.getElementById('fault-diagnosis').selectedIndex].text}", but the correct diagnosis is "${scenarios[currentScenarioIndex].name}". `;
    }
    
    // Only increment score once per scenario
    if (isCorrect && !scenario.scored) {
        score++;
        scenario.scored = true;
        message = `Correct! Superheat: ${scenario.correctSuperheat}°F, Subcooling: ${scenario.correctSubcooling}°F, Diagnosis: ${scenarios[currentScenarioIndex].name}.`;
        resultElement.className = 'results correct alert alert-success';
    } else if (isCorrect) {
        message = `Correct! Superheat: ${scenario.correctSuperheat}°F, Subcooling: ${scenario.correctSubcooling}°F, Diagnosis: ${scenarios[currentScenarioIndex].name}.`;
        resultElement.className = 'results correct alert alert-success';
    } else {
        message += `Hint: ${scenario.hint}`;
        resultElement.className = 'results incorrect alert alert-danger';
    }
    
    resultElement.textContent = message;
    resultElement.style.display = 'block';
    
    // Enable next button
    nextButton.classList.remove('disabled');
}

// Move to next scenario
function nextScenario() {
    currentScenarioIndex++;
    
    if (currentScenarioIndex < scenarios.length) {
        loadScenario(currentScenarioIndex);
        document.getElementById('next-scenario').classList.add('disabled');
    } else {
        // Show final score
        const scoreElement = document.getElementById('final-score');
        const percentage = Math.round((score / scenarios.length) * 100);
        scoreElement.textContent = `Final Score: ${score}/${scenarios.length} (${percentage}%)`;
        scoreElement.style.display = 'block';
        
        // Disable inputs
        document.getElementById('superheat-calc').disabled = true;
        document.getElementById('subcooling-calc').disabled = true;
        document.getElementById('fault-diagnosis').disabled = true;
        document.getElementById('submit-diagnosis').disabled = true;
        document.getElementById('next-scenario').disabled = true;
    }
}

// Make initialize function global
window.initRefrigerationDemo = initRefrigerationDemo;