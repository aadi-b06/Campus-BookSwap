/**
 * Sustainability Dashboard for Campus BookSwap
 * Tracks environmental impact of buying used books
 */

class SustainabilityDashboard {
    constructor() {
        this.metrics = this.loadMetricsFromStorage() || this.getDefaultMetrics();
        this.currentUser = this.getCurrentUser();
        this.userMetrics = this.getUserMetrics();
        
        // Environmental impact factors (approximate values)
        this.impactFactors = {
            // Per book values
            newBook: {
                trees: 0.002, // Fraction of a tree saved per book
                water: 3.5, // Gallons of water saved
                carbon: 2.1, // kg of CO2 emissions avoided
                waste: 0.5 // kg of waste reduced
            }
        };
        
        // Initialize the dashboard
        this.initDashboard();
    }
    
    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    /**
     * Load sustainability metrics from localStorage
     */
    loadMetricsFromStorage() {
        const metricsJson = localStorage.getItem('bookswap_sustainability_metrics');
        return metricsJson ? JSON.parse(metricsJson) : null;
    }
    
    /**
     * Save sustainability metrics to localStorage
     */
    saveMetricsToStorage() {
        localStorage.setItem('bookswap_sustainability_metrics', JSON.stringify(this.metrics));
    }
    
    /**
     * Get default metrics for new users
     */
    getDefaultMetrics() {
        return {
            global: {
                booksReused: 1250,
                treesSaved: 2.5,
                waterSaved: 4375, // gallons
                carbonReduced: 2625, // kg
                wasteReduced: 625 // kg
            },
            users: {}
        };
    }
    
    /**
     * Get metrics for the current user
     */
    getUserMetrics() {
        if (!this.currentUser) return null;
        
        // If user doesn't have metrics yet, create default user metrics
        if (!this.metrics.users[this.currentUser.id]) {
            this.metrics.users[this.currentUser.id] = {
                booksReused: 0,
                treesSaved: 0,
                waterSaved: 0,
                carbonReduced: 0,
                wasteReduced: 0
            };
            this.saveMetricsToStorage();
        }
        
        return this.metrics.users[this.currentUser.id];
    }
    
    /**
     * Initialize the sustainability dashboard
     */
    initDashboard() {
        // Add event listeners for dashboard interactions
        this.addEventListeners();
    }
    
    /**
     * Add event listeners for dashboard interactions
     */
    addEventListeners() {
        // Listen for tab changes to update charts if needed
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.tab === 'sustainability') {
                    this.updateCharts();
                }
            });
        });
    }
    
    /**
     * Update sustainability metrics when a book is purchased used
     */
    updateMetricsForPurchase(bookCount = 1) {
        if (!this.currentUser) return;
        
        // Update global metrics
        this.metrics.global.booksReused += bookCount;
        this.metrics.global.treesSaved += this.impactFactors.newBook.trees * bookCount;
        this.metrics.global.waterSaved += this.impactFactors.newBook.water * bookCount;
        this.metrics.global.carbonReduced += this.impactFactors.newBook.carbon * bookCount;
        this.metrics.global.wasteReduced += this.impactFactors.newBook.waste * bookCount;
        
        // Update user metrics
        this.userMetrics.booksReused += bookCount;
        this.userMetrics.treesSaved += this.impactFactors.newBook.trees * bookCount;
        this.userMetrics.waterSaved += this.impactFactors.newBook.water * bookCount;
        this.userMetrics.carbonReduced += this.impactFactors.newBook.carbon * bookCount;
        this.userMetrics.wasteReduced += this.impactFactors.newBook.waste * bookCount;
        
        // Save updated metrics
        this.saveMetricsToStorage();
        
        // Update dashboard if it's visible
        const sustainabilityTab = document.querySelector('.tab-content[data-tab="sustainability"]');
        if (sustainabilityTab && sustainabilityTab.classList.contains('active')) {
            this.updateDashboard();
        }
    }
    
    /**
     * Update the dashboard display
     */
    updateDashboard() {
        this.updateGlobalMetrics();
        this.updateUserMetrics();
        this.updateCharts();
    }
    
    /**
     * Update global metrics display
     */
    updateGlobalMetrics() {
        const globalMetricsContainer = document.getElementById('global-metrics');
        if (!globalMetricsContainer) return;
        
        const { booksReused, treesSaved, waterSaved, carbonReduced, wasteReduced } = this.metrics.global;
        
        globalMetricsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="metric-value">${booksReused.toLocaleString()}</div>
                <div class="metric-label">Books Reused</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-tree"></i>
                </div>
                <div class="metric-value">${treesSaved.toFixed(1)}</div>
                <div class="metric-label">Trees Saved</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-tint"></i>
                </div>
                <div class="metric-value">${waterSaved.toLocaleString()}</div>
                <div class="metric-label">Gallons of Water Saved</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-cloud"></i>
                </div>
                <div class="metric-value">${carbonReduced.toLocaleString()}</div>
                <div class="metric-label">kg CO₂ Reduced</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <div class="metric-value">${wasteReduced.toLocaleString()}</div>
                <div class="metric-label">kg Waste Reduced</div>
            </div>
        `;
    }
    
    /**
     * Update user metrics display
     */
    updateUserMetrics() {
        if (!this.currentUser) return;
        
        const userMetricsContainer = document.getElementById('user-metrics');
        if (!userMetricsContainer) return;
        
        const { booksReused, treesSaved, waterSaved, carbonReduced, wasteReduced } = this.userMetrics;
        
        userMetricsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="metric-value">${booksReused.toLocaleString()}</div>
                <div class="metric-label">Your Books Reused</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-tree"></i>
                </div>
                <div class="metric-value">${treesSaved.toFixed(3)}</div>
                <div class="metric-label">Your Trees Saved</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-tint"></i>
                </div>
                <div class="metric-value">${waterSaved.toLocaleString()}</div>
                <div class="metric-label">Your Gallons of Water Saved</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-cloud"></i>
                </div>
                <div class="metric-value">${carbonReduced.toLocaleString()}</div>
                <div class="metric-label">Your kg CO₂ Reduced</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <div class="metric-value">${wasteReduced.toLocaleString()}</div>
                <div class="metric-label">Your kg Waste Reduced</div>
            </div>
        `;
    }
    
    /**
     * Update charts display
     */
    updateCharts() {
        // This would use a charting library like Chart.js in a real implementation
        // For this demo, we'll just update a placeholder
        const chartsContainer = document.getElementById('sustainability-charts');
        if (!chartsContainer) return;
        
        chartsContainer.innerHTML = `
            <div class="chart-container">
                <h3>Environmental Impact Over Time</h3>
                <div class="chart-placeholder">
                    <p>Charts would be displayed here using Chart.js or similar library</p>
                    <p>Showing trends of resources saved over time</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate the complete sustainability dashboard HTML
     */
    generateDashboardHTML(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = `
            <div class="sustainability-dashboard">
                <div class="dashboard-header">
                    <h2>Sustainability Impact</h2>
                    <p>See the positive environmental impact of buying and selling used textbooks</p>
                </div>
                
                <div class="dashboard-section">
                    <h3>Campus-Wide Impact</h3>
                    <div id="global-metrics" class="metrics-container">
                        <!-- Global metrics will be inserted here -->
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Your Personal Impact</h3>
                    <div id="user-metrics" class="metrics-container">
                        <!-- User metrics will be inserted here -->
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Impact Visualization</h3>
                    <div id="sustainability-charts" class="charts-container">
                        <!-- Charts will be inserted here -->
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Environmental Facts</h3>
                    <div class="facts-container">
                        <div class="fact-card">
                            <div class="fact-icon">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="fact-content">
                                <h4>Paper Production</h4>
                                <p>Producing one new textbook requires approximately 7.5 kg of CO₂ emissions and consumes about 2 trees worth of paper over its lifecycle.</p>
                            </div>
                        </div>
                        <div class="fact-card">
                            <div class="fact-icon">
                                <i class="fas fa-water"></i>
                            </div>
                            <div class="fact-content">
                                <h4>Water Usage</h4>
                                <p>The paper industry is the 3rd largest industrial consumer of water. Reusing textbooks helps conserve this precious resource.</p>
                            </div>
                        </div>
                        <div class="fact-card">
                            <div class="fact-icon">
                                <i class="fas fa-recycle"></i>
                            </div>
                            <div class="fact-content">
                                <h4>Waste Reduction</h4>
                                <p>Each year, millions of textbooks end up in landfills. By participating in book reuse, you're helping reduce waste and extend the lifecycle of valuable educational resources.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>How You Can Help</h3>
                    <div class="tips-container">
                        <div class="tip-card">
                            <div class="tip-number">1</div>
                            <div class="tip-content">
                                <h4>Sell Your Used Books</h4>
                                <p>Instead of throwing away your textbooks, list them on Campus BookSwap to give them a second life.</p>
                            </div>
                        </div>
                        <div class="tip-card">
                            <div class="tip-number">2</div>
                            <div class="tip-content">
                                <h4>Buy Used When Possible</h4>
                                <p>Check Campus BookSwap first before buying new textbooks for your courses.</p>
                            </div>
                        </div>
                        <div class="tip-card">
                            <div class="tip-number">3</div>
                            <div class="tip-content">
                                <h4>Spread the Word</h4>
                                <p>Tell your friends and classmates about the environmental benefits of reusing textbooks.</p>
                            </div>
                        </div>
                        <div class="tip-card">
                            <div class="tip-number">4</div>
                            <div class="tip-content">
                                <h4>Consider Digital Options</h4>
                                <p>When used books aren't available, consider digital textbooks as an eco-friendly alternative.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Update metrics displays
        this.updateGlobalMetrics();
        this.updateUserMetrics();
        this.updateCharts();
    }
}

// Initialize sustainability dashboard when the script is loaded
window.sustainabilityDashboard = null;

// Function to initialize sustainability dashboard
function initializeSustainabilityDashboard() {
    window.sustainabilityDashboard = new SustainabilityDashboard();
}