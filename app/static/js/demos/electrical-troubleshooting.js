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
    
    // Setup coordinates
    const startX = 70;
    const startY = 60;
    const horizontalSpacing = 90; // Component spacing on horizontal segments
    const verticalSpacing = 100;  // Height between top and bottom segments
    const wireLength = 20;
    
    // Colors
    const wireColor = '#333';
    const componentColor = '#0056b3';
    const textColor = '#333';
    const powerColor = circuitState.powerOn ? '#00cc00' : '#cc0000';
    const motorRunningColor = '#4CAF50';
    
    // Calculate motor color based on state
    let motorColor = componentColor;
    const circuitValues = calculateCircuitValues();
    const isMotorRunning = circuitState.powerOn && 
                         circuitValues.current > 0 && 
                         circuitState.components.motor.state !== 'open';
    
    if (isMotorRunning) {
        motorColor = motorRunningColor; // Green when running
    }
    
    // Draw power source
    draw.circle(30).fill('none').stroke({ color: powerColor, width: 2 }).move(startX - 15, startY - 15);
    draw.text('+').move(startX - 7, startY - 12).font({ fill: powerColor, family: 'Arial', size: 18 });
    draw.text('−').move(startX - 7, startY + 2).font({ fill: powerColor, family: 'Arial', size: 18 });
    draw.text('24V').move(startX - 15, startY + 20).font({ fill: textColor, family: 'Arial', size: 12 });
    
    // Starting point for the circuit
    let currentX = startX + 20;
    let currentY = startY;
    
    // Draw wire to first component
    draw.line(startX, startY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Add some space
    currentX += wireLength;
    
    // Draw fuse
    const fuseWidth = 60;
    const fuseHeight = 24;
    if (circuitState.components.fuse.state === 'blown') {
        // Blown fuse (with break)
        draw.line(currentX, currentY, currentX + (fuseWidth/2 - 10), currentY).stroke({ color: componentColor, width: 2 });
        draw.line(currentX + (fuseWidth/2 + 10), currentY, currentX + fuseWidth, currentY).stroke({ color: componentColor, width: 2 });
        draw.circle(4).fill('#cc0000').move(currentX + fuseWidth/2, currentY - 2);
    } else {
        // Normal fuse
        draw.line(currentX, currentY, currentX + fuseWidth, currentY).stroke({ color: componentColor, width: 2 });
    }
    draw.rect(fuseWidth, fuseHeight).fill('none').stroke({ color: componentColor, width: 1 }).move(currentX, currentY - fuseHeight/2);
    draw.text('Fuse').move(currentX + fuseWidth/2 - 12, currentY + 15).font({ fill: textColor, family: 'Arial', size: 12 });
    
    // Move to after fuse
    currentX += fuseWidth + wireLength;
    
    // Draw wire to vertical segment
    draw.line(currentX - wireLength, currentY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Draw vertical wire segment
    let cornerX = currentX;
    let cornerY = currentY;
    currentY += verticalSpacing; // Move down to bottom segment
    
    draw.line(cornerX, cornerY, cornerX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Create the switch as a clickable component
    const switchWidth = 60;
    const switchGroup = draw.group();
    
    // Interactive switching functionality
    switchGroup.click(function() {
        // Toggle switch state when clicked
        circuitState.components.switch.state = 
            circuitState.components.switch.state === 'open' ? 'closed' : 'open';
        
        // Redraw the circuit
        drawCircuit();
    });
    
    // Draw switch
    if (circuitState.components.switch.state === 'open') {
        // Open switch
        switchGroup.line(cornerX, currentY, cornerX + switchWidth/2, currentY - 15).stroke({ color: componentColor, width: 2 });
        switchGroup.line(cornerX + switchWidth - wireLength, currentY, cornerX + switchWidth, currentY).stroke({ color: componentColor, width: 2 });
    } else {
        // Closed switch
        switchGroup.line(cornerX, currentY, cornerX + switchWidth, currentY).stroke({ color: componentColor, width: 2 });
    }
    
    switchGroup.circle(6).fill('none').stroke({ color: componentColor, width: 1 }).move(cornerX - 3, currentY - 3);
    switchGroup.circle(6).fill('none').stroke({ color: componentColor, width: 1 }).move(cornerX + switchWidth - 3, currentY - 3);
    switchGroup.text('Switch').move(cornerX + switchWidth/2 - 15, currentY + 10).font({ fill: textColor, family: 'Arial', size: 12 });
    switchGroup.rect(switchWidth + 10, 30).fill('none').opacity(0).move(cornerX - 5, currentY - 20);
    
    // Add a hover effect to indicate it's clickable
    switchGroup.mouseover(function() {
        this.css('cursor', 'pointer');
    });
    
    // Move to after switch
    currentX = cornerX + switchWidth + wireLength;
    
    // Draw wire to resistor
    draw.line(cornerX + switchWidth, currentY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Draw resistor
    const resistorWidth = 70;
    if (circuitState.components.resistor.state === 'open') {
        // Open resistor (with break)
        draw.line(currentX, currentY, currentX + resistorWidth/2 - 10, currentY).stroke({ color: componentColor, width: 2 });
        draw.line(currentX + resistorWidth/2 + 10, currentY, currentX + resistorWidth, currentY).stroke({ color: componentColor, width: 2 });
        draw.circle(4).fill('#cc0000').move(currentX + resistorWidth/2, currentY - 2);
    } else if (circuitState.components.resistor.state === 'shorted') {
        // Shorted resistor (with bypass)
        draw.line(currentX, currentY, currentX + resistorWidth, currentY).stroke({ color: wireColor, width: 2 });
        
        // Draw resistor symbol with dashed line to indicate short
        const zigzagPath = 'M ' + currentX + ' ' + currentY + 
              ' L ' + (currentX + 5) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 15) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 25) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 35) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 45) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 55) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 65) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + resistorWidth) + ' ' + currentY;
        draw.path(zigzagPath).fill('none').stroke({ color: componentColor, width: 1, dasharray: '2,2' });
    } else {
        // Normal resistor
        const zigzagPath = 'M ' + currentX + ' ' + currentY + 
              ' L ' + (currentX + 5) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 15) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 25) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 35) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 45) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + 55) + ' ' + (currentY + 8) + 
              ' L ' + (currentX + 65) + ' ' + (currentY - 8) + 
              ' L ' + (currentX + resistorWidth) + ' ' + currentY;
        draw.path(zigzagPath).fill('none').stroke({ color: componentColor, width: 2 });
    }
    draw.text('Resistor (8Ω)').move(currentX + 5, currentY + 10).font({ fill: textColor, family: 'Arial', size: 12 });
    
    // Move to after resistor
    currentX += resistorWidth + wireLength;
    
    // Draw wire segment and up to top row
    draw.line(currentX - wireLength, currentY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    cornerX = currentX;
    currentY = startY; // Move back to top row
    draw.line(cornerX, currentY + verticalSpacing, cornerX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Draw motor
    const motorSize = 30;
    // Draw wire to motor
    currentX += horizontalSpacing - wireLength;
    draw.line(cornerX, currentY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    
    if (circuitState.components.motor.state === 'open') {
        // Open motor (with break)
        draw.line(currentX, currentY, currentX + motorSize/2 - 10, currentY).stroke({ color: motorColor, width: 2 });
        draw.line(currentX + motorSize/2 + 10, currentY, currentX + motorSize, currentY).stroke({ color: motorColor, width: 2 });
        draw.circle(4).fill('#cc0000').move(currentX + motorSize/2, currentY - 2);
        draw.circle(motorSize).fill('none').stroke({ color: motorColor, width: 2 }).move(currentX, currentY - motorSize/2);
        draw.text('M').move(currentX + motorSize/2 - 5, currentY - 7).font({ fill: motorColor, family: 'Arial', size: 16 });
    } else if (circuitState.components.motor.state === 'shorted') {
        // Shorted motor - ensure continuous wire through motor
        draw.line(currentX, currentY, currentX + motorSize, currentY).stroke({ color: wireColor, width: 2 });
        draw.circle(motorSize).fill('none').stroke({ color: motorColor, width: 2 }).move(currentX, currentY - motorSize/2);
        draw.text('M').move(currentX + motorSize/2 - 5, currentY - 7).font({ fill: motorColor, family: 'Arial', size: 16 });
        
        // Add visual indication of short circuit
        draw.line(currentX - 5, currentY - 10, currentX + motorSize + 5, currentY + 10)
           .stroke({ color: '#cc0000', width: 1, dasharray: '3,2' });
    } else {
        // Normal motor - ensure continuous wire through motor
        draw.line(currentX, currentY, currentX + motorSize, currentY).stroke({ color: wireColor, width: 2 });
        draw.circle(motorSize).fill('none').stroke({ color: motorColor, width: 2 }).move(currentX, currentY - motorSize/2);
        
        // Add pulsing effect for running motor
        if (isMotorRunning) {
            // Add a pulsing circle inside the motor to indicate it's running
            const pulseCircle = draw.circle(motorSize/2)
                .fill(motorRunningColor)
                .opacity(0.3)
                .move(currentX + motorSize/4, currentY - motorSize/4);
        }
        
        draw.text('M').move(currentX + motorSize/2 - 5, currentY - 7).font({ fill: motorColor, family: 'Arial', size: 16 });
    }
    draw.text('Motor (16Ω)').move(currentX, currentY + 15).font({ fill: textColor, family: 'Arial', size: 12 });
    
    // Move to after motor
    currentX += motorSize + wireLength;
    
    // Draw wire from motor to ground
    draw.line(currentX - wireLength, currentY, currentX, currentY).stroke({ color: wireColor, width: 2 });
    
    // Draw ground symbol
    draw.line(currentX, currentY, currentX, currentY + 20).stroke({ color: wireColor, width: 2 });
    draw.line(currentX - 15, currentY + 20, currentX + 15, currentY + 20).stroke({ color: wireColor, width: 2 });
    draw.line(currentX - 10, currentY + 25, currentX + 10, currentY + 25).stroke({ color: wireColor, width: 2 });
    draw.line(currentX - 5, currentY + 30, currentX + 5, currentY + 30).stroke({ color: wireColor, width: 2 });
    
    // Complete the circuit back to power source 
    // (first draw vertical segment down from ground)
    draw.line(startX, currentY + 40, currentX, currentY + 40).stroke({ color: wireColor, width: 2 });
    draw.line(currentX, currentY + 30, currentX, currentY + 40).stroke({ color: wireColor, width: 2 });
    draw.line(startX, currentY + 15, startX, currentY + 40).stroke({ color: wireColor, width: 2 });
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