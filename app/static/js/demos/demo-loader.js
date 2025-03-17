/**
 * Demo Loader Module
 * Handles loading and initialization of different HVAC interactive demos
 */

// Demo initialization functions will be loaded from separate script files

// Demo registry - add new demos here
const demoRegistry = [
    {
        id: 'refrigeration',
        name: 'Refrigeration Diagnostics',
        description: 'Practice diagnosing common HVAC system issues using pressure and temperature readings.',
        icon: 'fas fa-thermometer-half',
        initFunction: window.initRefrigerationDemo
    },
    {
        id: 'electrical',
        name: 'Electrical Troubleshooting',
        description: 'Identify faults in electrical circuits using Ohm\'s Law and measurement techniques.',
        icon: 'fas fa-bolt',
        initFunction: window.initElectricalDemo
    },
    {
        id: 'airflow',
        name: 'Duct Sizing Calculator',
        description: 'Calculate proper duct sizes based on airflow requirements and velocity constraints.',
        icon: 'fas fa-wind',
        initFunction: window.initAirflowDemo
    },
    {
        id: 'heat-load',
        name: 'Heat Load Calculator',
        description: 'Calculate heating and cooling requirements for different spaces.',
        icon: 'fas fa-calculator',
        comingSoon: true
    },
    {
        id: 'psychrometrics',
        name: 'Psychrometric Chart',
        description: 'Interactive psychrometric chart to understand air properties and conditioning processes.',
        icon: 'fas fa-chart-line',
        comingSoon: true
    }
];

// Function to generate demo list
function renderDemoList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="row">';
    
    demoRegistry.forEach(demo => {
        html += `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h3 class="h5 mb-0"><i class="${demo.icon} me-2"></i>${demo.name}</h3>
                </div>
                <div class="card-body">
                    <p class="card-text">${demo.description}</p>
                    ${demo.comingSoon ? 
                        `<span class="badge bg-secondary">Coming Soon</span>` : 
                        `<button type="button" class="btn btn-outline-primary mt-2 demo-launch-btn" 
                           data-bs-target="#${demo.id}-demo" data-demo-id="${demo.id}">Launch Demo</button>`
                    }
                </div>
            </div>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners to launch buttons after rendering
    document.querySelectorAll('.demo-launch-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            const tabElement = document.querySelector(`a[href="${target}"]`);
            if (tabElement) {
                const bsTab = new bootstrap.Tab(tabElement);
                bsTab.show();
            }
        });
    });
}

// Initialize demo navigation
function initDemoNavigation() {
    // Create tabs dynamically
    const demoNav = document.getElementById('demo-nav');
    if (!demoNav) return;
    
    let navHtml = '';
    demoRegistry.forEach((demo, index) => {
        if (!demo.comingSoon) {
            navHtml += `
            <li class="nav-item">
                <a class="nav-link ${index === 0 ? 'active' : ''}" 
                   id="${demo.id}-tab" 
                   data-bs-toggle="pill" 
                   href="#${demo.id}-demo" 
                   role="tab">
                    <i class="${demo.icon} me-2"></i>${demo.name}
                </a>
            </li>`;
        }
    });
    demoNav.innerHTML = navHtml;
    
    // Set up tab change event handler using Bootstrap's tab API
    document.querySelectorAll('#demo-nav a').forEach(function (tabEl) {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            const demoId = this.getAttribute('href').replace('#', '').replace('-demo', '');
            const demo = demoRegistry.find(d => d.id === demoId);
            if (demo && demo.initFunction) {
                demo.initFunction();
            }
        });
    });
    
    // Initialize the first demo
    const firstDemo = demoRegistry.find(d => !d.comingSoon);
    if (firstDemo && firstDemo.initFunction) {
        setTimeout(() => {
            firstDemo.initFunction();
        }, 100); // Small delay to ensure DOM is ready
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the demos page
    if (document.getElementById('demo-container')) {
        renderDemoList('demo-list');
        initDemoNavigation();
    }
});