/**
 * Duct Friction Calculator Chart
 */

/**
 * Create the friction chart
 */
export function createFrictionChart() {
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

/**
 * Initialize the friction chart
 */
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
