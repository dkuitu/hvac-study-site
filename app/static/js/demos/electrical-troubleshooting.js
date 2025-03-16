/**
 * Electrical Troubleshooting Demo
 * Interactive simulation for diagnosing electrical circuit issues
 * using a simple blower motor circuit and Ohm's Law.
 */

// Import libraries
// Note: SVG.js is loaded from CDN in the main HTML

// Constants
const POWER_VOLTAGE = 24;
const RESISTOR_VALUE = 8;
const MOTOR_VALUE = 16;
const FUSE_RATING = 5;

// Circuit state
let circuitState = {
    powerOn: true,
    currentFault: 'normal',
    components: {
        fuse: { type: 'fuse', state: 'normal', resistance: 0 },
        switch: { type: 'switch', state: 'closed', resistance: 0 },
        resistor: { type: 'resistor', state: 'normal', resistance: RESISTOR_VALUE },
        motor: { type: 'motor', state: 'normal', resistance: MOTOR_VALUE }
    }
};

// Current measurement mode
let currentMode = 'voltage';

// SVG drawing object
let draw;

// Initialize the demo
function initElectricalDemo() {
    // DOM Elements
    const powerSwitch = document.getElementById('power-switch');
    const circuitSvg = document.getElementById('circuit-svg');
    const meterMode = document.getElementById('meter-mode');
    const meterValue = document.getElementById('meter-value');
    const modeVoltageBtn = document.getElementById('mode-voltage');
    const modeResistanceBtn = document.getElementById('mode-resistance');
    const modeCurrentBtn = document.getElementById('mode-current');
    const testPointsSelect = document.getElementById('test-points');
    const measureButton = document.getElementById('measure-button');
    const resetCircuitBtn = document.getElementById('reset-circuit');
    const introduceFaultBtn = document.getElementById('introduce-fault');
    const submitDiagnosisBtn = document.getElementById('submit-electrical-diagnosis');
    const nextScenarioBtn = document.getElementById('next-electrical-scenario');
    const diagnosisResult = document.getElementById('electrical-diagnosis-result');
    const diagnosisSelect = document.getElementById('fault-diagnosis-electrical');
    
    // Create an SVG.js instance
    draw = SVG().addTo('#circuit-svg').size('100%', 300);
    
    // Event listeners
    powerSwitch.addEventListener('change', function() {
        circuitState.powerOn = this.checked;
        drawCircuit();
    });
    
    modeVoltageBtn.addEventListener('click', function() {
        currentMode = 'voltage';
        meterMode.textContent = 'Volts (V)';
        modeVoltageBtn.classList.add('active');
        modeResistanceBtn.classList.remove('active');
        modeCurrentBtn.classList.remove('active');
    });
    
    modeResistanceBtn.addEventListener('click', function() {
        currentMode = 'resistance';
        meterMode.textContent = 'Ohms (Ω)';
        modeVoltageBtn.classList.remove('active');
        modeResistanceBtn.classList.add('active');
        modeCurrentBtn.classList.remove('active');
    });
    
    modeCurrentBtn.addEventListener('click', function() {
        currentMode = 'current';
        meterMode.textContent = 'Amps (A)';
        modeVoltageBtn.classList.remove('active');
        modeResistanceBtn.classList.remove('active');
        modeCurrentBtn.classList.add('active');
    });
    
    measureButton.addEventListener('click', takeMeasurement);
    resetCircuitBtn.addEventListener('click', resetCircuit);
    introduceFaultBtn.addEventListener('click', introduceFault);
    submitDiagnosisBtn.addEventListener('click', checkDiagnosis);
    nextScenarioBtn.addEventListener('click', introduceFault);
    
    // Initialize the circuit
    drawCircuit();
}

// Draw the circuit
function drawCircuit() {
    // Clear previous drawing
    draw.clear();
    
    // Setup coordinates and dimensions
    const startX = 120;
    const endX = 780;
    const centerY = 170;
    const componentSpacing = 130;
    
    // Colors
    const wireColor = '#0078d7'; // Blue wire color
    const componentColor = '#333'; // Dark color for components
    const textColor = '#333'; // Text color
    const powerColor = circuitState.powerOn ? '#00cc00' : '#cc0000'; // Green when on, red when off
    const motorRunningColor = '#4CAF50'; // Green for running motor
    
    // Calculate circuit values
    const circuitValues = calculateCircuitValues();
    const isMotorRunning = circuitState.powerOn && 
                         circuitValues.current > 0 && 
                         circuitState.components.motor.state !== 'open';
    
    // Add a background for better visibility
    draw.rect('100%', '100%').fill('#f8f9fa').radius(8);
    
    // Create a group for the entire circuit
    const circuitGroup = draw.group();
    
    // Main horizontal wire
    const mainWire = circuitGroup.line(startX, centerY, endX, centerY);
    if (circuitState.powerOn) {
        mainWire.stroke({
            color: wireColor,
            width: 3
        });
    } else {
        mainWire.stroke({
            color: componentColor,
            width: 2
        });
    }
    
    // Position components along the main wire
    let currentX = startX + 80; // Starting position for first component
    
    // LEFT GROUND
    const leftGroundGroup = circuitGroup.group();
    // Draw ground symbol
    leftGroundGroup.line(startX, centerY, startX, centerY + 20)
        .stroke({ color: componentColor, width: 2 });
    leftGroundGroup.line(startX - 15, centerY + 20, startX + 15, centerY + 20)
        .stroke({ color: componentColor, width: 2 });
    leftGroundGroup.line(startX - 10, centerY + 25, startX + 10, centerY + 25)
        .stroke({ color: componentColor, width: 2 });
    leftGroundGroup.line(startX - 5, centerY + 30, startX + 5, centerY + 30)
        .stroke({ color: componentColor, width: 2 });
    
    // 1. POWER SOURCE
    const powerSize = 36; // Slightly smaller
    const powerGroup = circuitGroup.group();
    
    // Draw power source circle
    powerGroup.circle(powerSize).fill('none').stroke({ color: powerColor, width: 2 }).center(currentX, centerY);
    
    // Add power indication 
    if (circuitState.powerOn) {
        // Green fill when on
        powerGroup.circle(powerSize - 4)
            .fill(powerColor)
            .opacity(0.2)
            .center(currentX, centerY);
            
        // Draw "+" and "-" symbols for the power source
        const ledSize = 20;
        powerGroup.circle(ledSize).fill(powerColor).center(currentX, centerY);
        powerGroup.text("||").move(currentX - 5, centerY - 10)
            .font({ fill: "#fff", family: 'Arial', size: 16, weight: 'bold' });
    }
    
    // Label
    powerGroup.text('24V').move(currentX - 10, centerY + 25)
        .font({ fill: textColor, family: 'Arial', size: 11, weight: 'bold' });
    
    // Move to next component
    currentX += componentSpacing;
    
    // 2. FUSE
    const fuseWidth = 36;
    const fuseHeight = 18;
    const fuseGroup = circuitGroup.group();
    
    // Draw fuse box (rectangle with rounded ends)
    if (circuitState.components.fuse.state === 'blown') {
        // Blown fuse (with break)
        fuseGroup.line(currentX - fuseWidth/2, centerY, currentX - 10, centerY)
            .stroke({ color: componentColor, width: 2 });
        fuseGroup.line(currentX + 10, centerY, currentX + fuseWidth/2, centerY)
            .stroke({ color: componentColor, width: 2 });
        
        // Add visual indication of blown fuse
        fuseGroup.circle(6).fill('#cc0000').center(currentX, centerY);
    } else {
        // Normal fuse
        fuseGroup.line(currentX - fuseWidth/2, centerY, currentX + fuseWidth/2, centerY)
            .stroke({ color: wireColor, width: 2 });
    }
    
    // Draw fuse symbol - rectangular shape with rounded ends
    fuseGroup.rect(fuseWidth, fuseHeight)
        .radius(fuseHeight/2) // Fully rounded ends
        .fill('none')
        .stroke({ color: componentColor, width: 1.5 })
        .move(currentX - fuseWidth/2, centerY - fuseHeight/2);
        
    // Add fuse label
    fuseGroup.text('Fuse (5A)').move(currentX - 20, centerY + 15)
        .font({ fill: textColor, family: 'Arial', size: 11, weight: 'bold' });
    
    // Move to next component
    currentX += componentSpacing;
    
    // 3. SWITCH
    const switchWidth = 35;
    const switchGroup = circuitGroup.group();
    
    // Draw switch circles (connection points)
    switchGroup.circle(6).fill('#f8f9fa').stroke({ color: componentColor, width: 1.5 }).center(currentX - switchWidth/2, centerY);
    switchGroup.circle(6).fill('#f8f9fa').stroke({ color: componentColor, width: 1.5 }).center(currentX + switchWidth/2, centerY);
    
    // Interactive switching functionality
    switchGroup.click(function() {
        // Toggle switch state when clicked
        circuitState.components.switch.state = 
            circuitState.components.switch.state === 'open' ? 'closed' : 'open';
        
        // Redraw the circuit
        drawCircuit();
    });
    
    // Add hover effect
    switchGroup.mouseover(function() {
        this.css('cursor', 'pointer');
    });
    
    // Draw switch based on state
    if (circuitState.components.switch.state === 'open') {
        // Open switch - lever in up position
        switchGroup.line(currentX - switchWidth/2, centerY, currentX, centerY - 15)
            .stroke({ color: componentColor, width: 2 });
    } else {
        // Closed switch - connected
        switchGroup.line(currentX - switchWidth/2, centerY, currentX + switchWidth/2, centerY)
            .stroke({ color: wireColor, width: 2 });
    }
    
    // Label
    switchGroup.text('Switch').move(currentX - 15, centerY + 15)
        .font({ fill: textColor, family: 'Arial', size: 11, weight: 'bold' });
    
    // Move to next component
    currentX += componentSpacing;
    
    // 4. MOTOR
    const motorSize = 36;
    const motorGroup = circuitGroup.group();
    
    // Different motor display based on state
    if (circuitState.components.motor.state === 'open') {
        // Open motor (with break)
        motorGroup.line(currentX - motorSize/2, centerY, currentX - 5, centerY)
            .stroke({ color: componentColor, width: 2 });
        motorGroup.line(currentX + 5, centerY, currentX + motorSize/2, centerY)
            .stroke({ color: componentColor, width: 2 });
        
        // Add red dot indicating open circuit
        motorGroup.circle(6).fill('#cc0000').center(currentX, centerY);
    } else if (circuitState.components.motor.state === 'shorted') {
        // Shorted motor - straight line
        motorGroup.line(currentX - motorSize/2, centerY, currentX + motorSize/2, centerY)
            .stroke({ color: wireColor, width: 2 });
            
        // Add visual indication of short circuit
        motorGroup.line(currentX - 15, centerY - 15, currentX + 15, centerY + 15)
           .stroke({ color: '#cc0000', width: 1.5, dasharray: '2,2' });
        motorGroup.line(currentX - 15, centerY + 15, currentX + 15, centerY - 15)
           .stroke({ color: '#cc0000', width: 1.5, dasharray: '2,2' });
    } else {
        // Normal motor connection
        motorGroup.line(currentX - motorSize/2, centerY, currentX + motorSize/2, centerY)
            .stroke({ color: wireColor, width: 2 });
    }
    
    // Motor circle
    let motorColor = componentColor;
    if (isMotorRunning) {
        motorColor = motorRunningColor;
    }
    
    // Draw the motor as a circle with M inside
    motorGroup.circle(motorSize).fill('none').stroke({ color: motorColor, width: 2 }).center(currentX, centerY);
    
    // Add "M" label
    motorGroup.text('M').move(currentX - 8, centerY - 10)
        .font({ fill: isMotorRunning ? motorRunningColor : componentColor, family: 'Arial', size: 18, weight: 'bold' });
    
    // Add running motor effect
    if (isMotorRunning) {
        // Green fill with low opacity
        motorGroup.circle(motorSize - 4)
            .fill(motorRunningColor)
            .opacity(0.2)
            .center(currentX, centerY);
    }
    
    // Label
    motorGroup.text('Motor (16Ω)').move(currentX - 28, centerY + 25)
        .font({ fill: textColor, family: 'Arial', size: 11, weight: 'bold' });
    
    // Move to next component
    currentX += componentSpacing;
    
    // 5. RESISTOR
    const resistorWidth = 50;
    const resistorGroup = circuitGroup.group();
    
    if (circuitState.components.resistor.state === 'open') {
        // Open resistor (with break)
        resistorGroup.line(currentX - resistorWidth/2, centerY, currentX - 10, centerY)
            .stroke({ color: componentColor, width: 2 });
        resistorGroup.line(currentX + 10, centerY, currentX + resistorWidth/2, centerY)
            .stroke({ color: componentColor, width: 2 });
        
        // Add red dot indicating open circuit
        resistorGroup.circle(6).fill('#cc0000').center(currentX, centerY);
    } else if (circuitState.components.resistor.state === 'shorted') {
        // Shorted resistor - straight line
        resistorGroup.line(currentX - resistorWidth/2, centerY, currentX + resistorWidth/2, centerY)
            .stroke({ color: wireColor, width: 2 });
            
        // Add visual indication of short circuit
        resistorGroup.line(currentX - 15, centerY - 15, currentX + 15, centerY + 15)
           .stroke({ color: '#cc0000', width: 1.5, dasharray: '2,2' });
        resistorGroup.line(currentX - 15, centerY + 15, currentX + 15, centerY - 15)
           .stroke({ color: '#cc0000', width: 1.5, dasharray: '2,2' });
    } else {
        // Normal resistor with zigzag
        const zigzagPath = 'M ' + (currentX - resistorWidth/2) + ' ' + centerY + 
              ' L ' + (currentX - resistorWidth/3) + ' ' + (centerY - 10) + 
              ' L ' + (currentX - resistorWidth/6) + ' ' + (centerY + 10) + 
              ' L ' + (currentX) + ' ' + (centerY - 10) + 
              ' L ' + (currentX + resistorWidth/6) + ' ' + (centerY + 10) + 
              ' L ' + (currentX + resistorWidth/3) + ' ' + (centerY - 10) + 
              ' L ' + (currentX + resistorWidth/2) + ' ' + centerY;
        
        resistorGroup.path(zigzagPath).fill('none')
            .stroke({ color: wireColor, width: 2 });
    }
    
    // Label
    resistorGroup.text('Resistor (8Ω)').move(currentX - 30, centerY + 25)
        .font({ fill: textColor, family: 'Arial', size: 11, weight: 'bold' });
    
    // RIGHT GROUND
    const rightGroundGroup = circuitGroup.group();
    // Draw ground symbol
    rightGroundGroup.line(endX, centerY, endX, centerY + 20)
        .stroke({ color: componentColor, width: 2 });
    rightGroundGroup.line(endX - 15, centerY + 20, endX + 15, centerY + 20)
        .stroke({ color: componentColor, width: 2 });
    rightGroundGroup.line(endX - 10, centerY + 25, endX + 10, centerY + 25)
        .stroke({ color: componentColor, width: 2 });
    rightGroundGroup.line(endX - 5, centerY + 30, endX + 5, centerY + 30)
        .stroke({ color: componentColor, width: 2 });
    
    // Add instruction text
    circuitGroup.text('Tip: Click on the switch to open/close it')
        .move(300, centerY + 60)
        .font({ fill: '#666', family: 'Arial', size: 12, style: 'italic' });
    
    // Add Power Switch UI
    const powerSwitchX = 100;
    const powerSwitchY = centerY + 80;
    
    // Power switch toggle
    const switchBox = circuitGroup.rect(20, 20)
        .radius(3)
        .fill(circuitState.powerOn ? '#3498db' : '#ccc')
        .stroke({ color: '#999', width: 1 })
        .move(powerSwitchX, powerSwitchY);
    
    // Add checkmark when on
    if (circuitState.powerOn) {
        circuitGroup.path('M ' + (powerSwitchX + 5) + ' ' + (powerSwitchY + 10) + 
                         ' L ' + (powerSwitchX + 8) + ' ' + (powerSwitchY + 15) + 
                         ' L ' + (powerSwitchX + 15) + ' ' + (powerSwitchY + 5))
            .stroke({ color: '#fff', width: 2, linecap: 'round', linejoin: 'round' });
    }
    
    // Make the switch clickable
    switchBox.click(function() {
        circuitState.powerOn = !circuitState.powerOn;
        drawCircuit();
    });
    
    // Add hover effect
    switchBox.mouseover(function() {
        this.css('cursor', 'pointer');
    });
    
    // Add label
    circuitGroup.text('Power (24V)')
        .move(powerSwitchX + 30, powerSwitchY + 5)
        .font({ fill: textColor, family: 'Arial', size: 14 });
    
    // Add buttons
    const buttonY = powerSwitchY;
    const resetBtnX = 400;
    const faultBtnX = 550;
    
    // Reset button
    const resetBtn = circuitGroup.group();
    resetBtn.rect(100, 30)
        .radius(5)
        .fill('#f8f9fa')
        .stroke({ color: '#ccc', width: 1 })
        .move(resetBtnX, buttonY);
    
    resetBtn.text('Reset Circuit')
        .move(resetBtnX + 10, buttonY + 7)
        .font({ fill: '#555', family: 'Arial', size: 14 });
    
    resetBtn.click(function() {
        resetCircuit();
    });
    
    resetBtn.mouseover(function() {
        this.css('cursor', 'pointer');
    });
    
    // Fault button
    const faultBtn = circuitGroup.group();
    faultBtn.rect(120, 30)
        .radius(5)
        .fill('#f8f9fa')
        .stroke({ color: '#ccc', width: 1 })
        .move(faultBtnX, buttonY);
    
    faultBtn.text('Introduce Fault')
        .move(faultBtnX + 10, buttonY + 7)
        .font({ fill: '#555', family: 'Arial', size: 14 });
        
    faultBtn.click(function() {
        introduceFault();
    });
    
    faultBtn.mouseover(function() {
        this.css('cursor', 'pointer');
    });
    
    // Center the circuit in the SVG canvas
    const svgWidth = draw.width();
    const actualCircuitWidth = endX - startX;
    const offsetX = (svgWidth / 2) - (actualCircuitWidth / 2) - 50;
    if (offsetX > 0) {
        circuitGroup.dx(offsetX);
    }
}

// Calculate circuit values
function calculateCircuitValues() {
    // If power is off, current is 0
    if (!circuitState.powerOn) {
        return {
            totalResistance: Infinity,
            current: 0,
            voltage: 0,
            componentVoltages: {
                fuse: 0,
                switch: 0,
                resistor: 0,
                motor: 0
            }
        };
    }
    
    // Check if any component is open circuit
    for (const component in circuitState.components) {
        if (circuitState.components[component].state === 'open' || 
            circuitState.components[component].state === 'blown') {
            return {
                totalResistance: Infinity,
                current: 0,
                voltage: POWER_VOLTAGE,
                componentVoltages: {
                    fuse: component === 'fuse' ? POWER_VOLTAGE : 0,
                    switch: component === 'switch' ? POWER_VOLTAGE : 0,
                    resistor: component === 'resistor' ? POWER_VOLTAGE : 0,
                    motor: component === 'motor' ? POWER_VOLTAGE : 0
                }
            };
        }
    }
    
    // Calculate total resistance (for normal and shorted components)
    let totalResistance = 0;
    for (const component in circuitState.components) {
        if (circuitState.components[component].state === 'shorted') {
            // Shorted component has no resistance
            continue;
        }
        totalResistance += circuitState.components[component].resistance;
    }
    
    // Calculate current using Ohm's Law (I = V/R)
    const current = POWER_VOLTAGE / totalResistance;
    
    // Calculate voltage drop across each component (V = I*R)
    const componentVoltages = {};
    for (const component in circuitState.components) {
        if (circuitState.components[component].state === 'shorted') {
            componentVoltages[component] = 0; // No voltage drop across a short
        } else {
            componentVoltages[component] = current * circuitState.components[component].resistance;
        }
    }
    
    // Check if fuse is blown due to excess current
    if (current > FUSE_RATING && circuitState.components.fuse.state !== 'blown') {
        circuitState.components.fuse.state = 'blown';
        return calculateCircuitValues(); // Recalculate with blown fuse
    }
    
    return {
        totalResistance,
        current,
        voltage: POWER_VOLTAGE,
        componentVoltages
    };
}

// Take a measurement with the multimeter
function takeMeasurement() {
    const testPoint = document.getElementById('test-points').value;
    const circuitValues = calculateCircuitValues();
    let measurementValue = 0;
    
    // Determine what to measure based on the mode and test point
    if (currentMode === 'voltage') {
        switch(testPoint) {
            case 'power':
                measurementValue = circuitState.powerOn ? POWER_VOLTAGE : 0;
                break;
            case 'fuse':
                measurementValue = circuitValues.componentVoltages.fuse;
                break;
            case 'switch':
                measurementValue = circuitValues.componentVoltages.switch;
                break;
            case 'resistor':
                measurementValue = circuitValues.componentVoltages.resistor;
                break;
            case 'motor':
                measurementValue = circuitValues.componentVoltages.motor;
                break;
            case 'ground':
                measurementValue = 0; // Ground is always 0V
                break;
        }
    } else if (currentMode === 'resistance') {
        // When measuring resistance, we assume the circuit is de-energized
        switch(testPoint) {
            case 'power':
                measurementValue = 0; // Power source has negligible internal resistance
                break;
            case 'fuse':
                measurementValue = circuitState.components.fuse.state === 'blown' ? Infinity : 0;
                break;
            case 'switch':
                measurementValue = circuitState.components.switch.state === 'open' ? Infinity : 0;
                break;
            case 'resistor':
                if (circuitState.components.resistor.state === 'open') {
                    measurementValue = Infinity;
                } else if (circuitState.components.resistor.state === 'shorted') {
                    measurementValue = 0;
                } else {
                    measurementValue = RESISTOR_VALUE;
                }
                break;
            case 'motor':
                if (circuitState.components.motor.state === 'open') {
                    measurementValue = Infinity;
                } else if (circuitState.components.motor.state === 'shorted') {
                    measurementValue = 0;
                } else {
                    measurementValue = MOTOR_VALUE;
                }
                break;
            case 'ground':
                measurementValue = 0; // Ground has ideally zero resistance
                break;
        }
    } else if (currentMode === 'current') {
        // Current is the same throughout a series circuit
        measurementValue = circuitValues.current;
    }
    
    // Format and display the measured value
    let formattedValue;
    if (measurementValue === Infinity) {
        formattedValue = 'OL'; // Overload/Open Line
    } else if (currentMode === 'voltage') {
        formattedValue = measurementValue.toFixed(2) + ' V';
    } else if (currentMode === 'resistance') {
        if (measurementValue < 0.1) {
            formattedValue = '0.00 Ω';
        } else {
            formattedValue = measurementValue.toFixed(2) + ' Ω';
        }
    } else if (currentMode === 'current') {
        formattedValue = measurementValue.toFixed(2) + ' A';
    }
    
    document.getElementById('meter-value').textContent = formattedValue;
}

// Introduce a random fault
function introduceFault() {
    // Reset circuit first
    resetCircuit();
    
    // List of possible faults
    const faults = [
        'blown-fuse',
        'open-switch',
        'open-resistor',
        'open-motor',
        'short-motor',
        'short-resistor'
    ];
    
    // Pick a random fault
    const randomFault = faults[Math.floor(Math.random() * faults.length)];
    
    // Apply the fault
    applyFault(randomFault);
    
    // Store the current fault
    circuitState.currentFault = randomFault;
    
    // Redraw the circuit
    drawCircuit();
    
    // Clear the diagnosis result
    document.getElementById('electrical-diagnosis-result').style.display = 'none';
    
    // Reset diagnosis select
    document.getElementById('fault-diagnosis-electrical').value = '';
    
    // Disable the next button
    document.getElementById('next-electrical-scenario').classList.add('disabled');
}

// Apply a specific fault
function applyFault(fault) {
    switch (fault) {
        case 'blown-fuse':
            circuitState.components.fuse.state = 'blown';
            break;
        case 'open-switch':
            circuitState.components.switch.state = 'open';
            break;
        case 'open-resistor':
            circuitState.components.resistor.state = 'open';
            break;
        case 'open-motor':
            circuitState.components.motor.state = 'open';
            break;
        case 'short-motor':
            circuitState.components.motor.state = 'shorted';
            circuitState.components.motor.resistance = 0;
            break;
        case 'short-resistor':
            circuitState.components.resistor.state = 'shorted';
            circuitState.components.resistor.resistance = 0;
            break;
    }
}

// Reset the circuit to normal operation
function resetCircuit() {
    circuitState = {
        powerOn: true,
        currentFault: 'normal',
        components: {
            fuse: { type: 'fuse', state: 'normal', resistance: 0 },
            switch: { type: 'switch', state: 'closed', resistance: 0 },
            resistor: { type: 'resistor', state: 'normal', resistance: RESISTOR_VALUE },
            motor: { type: 'motor', state: 'normal', resistance: MOTOR_VALUE }
        }
    };
    
    // Update power switch
    document.getElementById('power-switch').checked = true;
    
    // Redraw the circuit
    drawCircuit();
    
    // Reset meter
    document.getElementById('meter-value').textContent = '0.00';
    
    // Clear diagnosis result
    document.getElementById('electrical-diagnosis-result').style.display = 'none';
    
    // Reset diagnosis select
    document.getElementById('fault-diagnosis-electrical').value = '';
    
    // Disable the next button
    document.getElementById('next-electrical-scenario').classList.add('disabled');
}

// Check the user's diagnosis
function checkDiagnosis() {
    const userDiagnosis = document.getElementById('fault-diagnosis-electrical').value;
    const diagnosisResult = document.getElementById('electrical-diagnosis-result');
    
    if (!userDiagnosis) {
        diagnosisResult.textContent = 'Please select a diagnosis.';
        diagnosisResult.className = 'alert alert-warning mt-3';
        diagnosisResult.style.display = 'block';
        return;
    }
    
    if (userDiagnosis === circuitState.currentFault) {
        // Get explanation based on the fault type
        let explanation = '';
        switch (circuitState.currentFault) {
            case 'normal':
                explanation = 'The circuit is operating normally with 24V power source and a total resistance of 24Ω (8Ω resistor + 16Ω motor). Current = 24V ÷ 24Ω = 1A.';
                break;
            case 'blown-fuse':
                explanation = 'The blown fuse creates an open circuit, stopping current flow completely. Voltage measurements would show full voltage (24V) across the fuse, and 0V across other components.';
                break;
            case 'open-switch':
                explanation = 'The open switch prevents current flow through the circuit. Voltage measurements would show full voltage (24V) across the switch, and 0V across other components.';
                break;
            case 'open-resistor':
                explanation = 'The open resistor creates an open circuit, preventing current flow. Voltage measurements would show full voltage (24V) across the resistor, and 0V across other components.';
                break;
            case 'open-motor':
                explanation = 'The open motor winding prevents current flow. Voltage measurements would show full voltage (24V) across the motor, and 0V across other components.';
                break;
            case 'short-motor':
                explanation = 'The shorted motor has near-zero resistance, creating excessive current flow (24V ÷ 8Ω = 3A), which typically blows the fuse. If the fuse hasn\'t blown, voltage across the motor would be near 0V.';
                break;
            case 'short-resistor':
                explanation = 'The shorted resistor bypasses the 8Ω resistance, resulting in a circuit with only the 16Ω motor. This increases current to 24V ÷ 16Ω = 1.5A. Voltage across the resistor would be 0V.';
                break;
        }
        
        diagnosisResult.innerHTML = `<strong>Correct!</strong> ${explanation}`;
        diagnosisResult.className = 'alert alert-success mt-3';
    } else {
        let actualFaultName;
        let hint = '';
        
        switch (circuitState.currentFault) {
            case 'normal':
                actualFaultName = 'Normal Operation';
                hint = 'Check the voltage distribution and current flow. In normal operation, voltage divides proportionally across components based on their resistance.';
                break;
            case 'blown-fuse':
                actualFaultName = 'Blown Fuse';
                hint = 'Use the voltage measurement setting. In an open circuit, the full supply voltage appears across the open component.';
                break;
            case 'open-switch':
                actualFaultName = 'Open Switch';
                hint = 'Measure voltage across the switch. What happens when a switch is open?';
                break;
            case 'open-resistor':
                actualFaultName = 'Open Resistor';
                hint = 'Use the resistance measurement setting across the resistor. An open component will show infinite resistance.';
                break;
            case 'open-motor':
                actualFaultName = 'Open Motor';
                hint = 'Is there current flowing in the circuit? What does an open motor winding do to the circuit?';
                break;
            case 'short-motor':
                actualFaultName = 'Shorted Motor';
                hint = 'A shorted component has near-zero resistance. What happens to current when resistance decreases dramatically?';
                break;
            case 'short-resistor':
                actualFaultName = 'Shorted Resistor';
                hint = 'Measure the resistance across the resistor. What voltage would you expect across a short?';
                break;
        }
        
        diagnosisResult.innerHTML = `<strong>Incorrect.</strong> The actual fault is: ${actualFaultName}.<br><strong>Hint:</strong> ${hint}`;
        diagnosisResult.className = 'alert alert-danger mt-3';
    }
    
    diagnosisResult.style.display = 'block';
    document.getElementById('next-electrical-scenario').classList.remove('disabled');
}

// Make initialize function global
window.initElectricalDemo = initElectricalDemo;