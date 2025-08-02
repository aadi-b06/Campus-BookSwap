/**
 * User Analytics Dashboard for Campus BookSwap
 * Tracks books bought/sold/swapped, money saved, and transaction history
 */

// Check if UserAnalyticsDashboard is already defined to prevent redeclaration
if (typeof UserAnalyticsDashboard === 'undefined') {
class UserAnalyticsDashboard {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.userAnalytics = this.loadUserAnalytics() || this.createDefaultAnalytics();
        this.marketRates = this.getMarketRates();
        
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
     * Load user analytics from localStorage
     */
    loadUserAnalytics() {
        if (!this.currentUser) return null;
        
        const analyticsJson = localStorage.getItem(`bookswap_analytics_${this.currentUser.id}`);
        return analyticsJson ? JSON.parse(analyticsJson) : null;
    }
    
    /**
     * Save user analytics to localStorage
     */
    saveUserAnalytics() {
        if (!this.currentUser) return;
        
        localStorage.setItem(`bookswap_analytics_${this.currentUser.id}`, JSON.stringify(this.userAnalytics));
    }
    
    /**
     * Create default analytics for new users
     */
    createDefaultAnalytics() {
        return {
            booksBought: 0,
            booksSold: 0,
            booksSwapped: 0,
            moneySaved: 0,
            moneyEarned: 0,
            transactions: []
        };
    }
    
    /**
     * Get market rates for books (in a real app, this would come from an API)
     */
    getMarketRates() {
        // Sample market rates for demonstration
        return {
            // Format: ISBN: { newPrice: X, usedPrice: Y }
            '9780136019701': { newPrice: 150.00, usedPrice: 95.00 },
            '9780133970777': { newPrice: 180.00, usedPrice: 120.00 },
            '9780134093413': { newPrice: 200.00, usedPrice: 140.00 },
            '9780321982384': { newPrice: 160.00, usedPrice: 100.00 },
            '9780134472119': { newPrice: 175.00, usedPrice: 115.00 },
            // Default values for books not in the database
            'default': { newPrice: 150.00, usedPrice: 100.00 }
        };
    }
    
    /**
     * Initialize the dashboard
     */
    initDashboard() {
        // Add event listeners for dashboard interactions
        this.addEventListeners();
        
        // Initialize event listeners for My Listings navigation
        this.initializeEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Link to My Listings section
        const viewListingsBtn = document.getElementById('view-my-listings');
        if (viewListingsBtn) {
            viewListingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToListings();
            });
        }
    }
    
    /**
     * Navigate to My Listings tab
     */
    navigateToListings() {
        // Find the My Listings tab button
        const listingsTabBtn = document.querySelector('.tab-button[data-tab="listings"]');
        if (listingsTabBtn) {
            // Trigger a click on the My Listings tab button
            listingsTabBtn.click();
        }
    }
    
    /**
     * Add event listeners for dashboard interactions
     */
    addEventListeners() {
        // Listen for tab changes to update charts if needed
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.tab === 'analytics') {
                    this.updateDashboard();
                }
            });
        });
    }
    
    /**
     * Record a new book purchase transaction
     */
    recordBookPurchase(bookData, price) {
        if (!this.currentUser) return;
        
        // Get market rate for comparison
        const isbn = bookData.isbn || 'default';
        const marketRate = this.marketRates[isbn] || this.marketRates['default'];
        const moneySaved = marketRate.newPrice - price;
        
        // Update analytics
        this.userAnalytics.booksBought++;
        this.userAnalytics.moneySaved += moneySaved;
        
        // Add transaction record
        this.userAnalytics.transactions.push({
            type: 'purchase',
            bookData: bookData,
            price: price,
            marketPrice: marketRate.newPrice,
            moneySaved: moneySaved,
            date: new Date().toISOString()
        });
        
        // Save updated analytics
        this.saveUserAnalytics();
        
        // Update sustainability metrics if available
        if (window.sustainabilityDashboard) {
            window.sustainabilityDashboard.updateMetricsForPurchase(1);
        }
        
        // Update dashboard if it's visible
        const analyticsTab = document.querySelector('.tab-content[data-tab="analytics"]');
        if (analyticsTab && analyticsTab.classList.contains('active')) {
            this.updateDashboard();
        }
    }
    
    /**
     * Record a new book sale transaction
     */
    recordBookSale(bookData, price) {
        if (!this.currentUser) return;
        
        // Update analytics
        this.userAnalytics.booksSold++;
        this.userAnalytics.moneyEarned += price;
        
        // Add transaction record
        this.userAnalytics.transactions.push({
            type: 'sale',
            bookData: bookData,
            price: price,
            date: new Date().toISOString()
        });
        
        // Save updated analytics
        this.saveUserAnalytics();
        
        // Update dashboard if it's visible
        const analyticsTab = document.querySelector('.tab-content[data-tab="analytics"]');
        if (analyticsTab && analyticsTab.classList.contains('active')) {
            this.updateDashboard();
        }
    }
    
    /**
     * Record a new book swap transaction
     */
    recordBookSwap(bookGiven, bookReceived) {
        if (!this.currentUser) return;
        
        // Get market rate for comparison
        const isbnReceived = bookReceived.isbn || 'default';
        const marketRate = this.marketRates[isbnReceived] || this.marketRates['default'];
        const moneySaved = marketRate.newPrice;
        
        // Update analytics
        this.userAnalytics.booksSwapped++;
        this.userAnalytics.moneySaved += moneySaved;
        
        // Add transaction record
        this.userAnalytics.transactions.push({
            type: 'swap',
            bookGiven: bookGiven,
            bookReceived: bookReceived,
            marketPrice: marketRate.newPrice,
            moneySaved: moneySaved,
            date: new Date().toISOString()
        });
        
        // Save updated analytics
        this.saveUserAnalytics();
        
        // Update sustainability metrics if available
        if (window.sustainabilityDashboard) {
            window.sustainabilityDashboard.updateMetricsForPurchase(1);
        }
        
        // Update dashboard if it's visible
        const analyticsTab = document.querySelector('.tab-content[data-tab="analytics"]');
        if (analyticsTab && analyticsTab.classList.contains('active')) {
            this.updateDashboard();
        }
    }
    
    /**
     * Update the dashboard display
     */
    updateDashboard() {
        this.updateSummaryMetrics();
        this.updateTransactionHistory();
        this.updateCharts();
    }
    
    /**
     * Update summary metrics display
     */
    updateSummaryMetrics() {
        if (!this.currentUser) return;
        
        const summaryContainer = document.getElementById('analytics-summary');
        if (!summaryContainer) return;
        
        const { booksBought, booksSold, booksSwapped, moneySaved, moneyEarned } = this.userAnalytics;
        const totalBooks = booksBought + booksSold + booksSwapped;
        
        summaryContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="metric-value">${totalBooks}</div>
                <div class="metric-label">Total Books</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="metric-value">${booksBought}</div>
                <div class="metric-label">Books Bought</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-tag"></i>
                </div>
                <div class="metric-value">${booksSold}</div>
                <div class="metric-label">Books Sold</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="metric-value">${booksSwapped}</div>
                <div class="metric-label">Books Swapped</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="metric-value">$${moneySaved.toFixed(2)}</div>
                <div class="metric-label">Money Saved</div>
            </div>
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="metric-value">$${moneyEarned.toFixed(2)}</div>
                <div class="metric-label">Money Earned</div>
            </div>
        `;
    }
    
    /**
     * Update transaction history display
     */
    updateTransactionHistory() {
        if (!this.currentUser) return;
        
        const historyContainer = document.getElementById('transaction-history');
        if (!historyContainer) return;
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.userAnalytics.transactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (sortedTransactions.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt fa-3x"></i>
                    <p>No transactions yet. Start buying or selling books to see your history here.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Book</th>
                        <th>Price</th>
                        <th>Savings</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sortedTransactions.forEach(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            let bookTitle, price, savings;
            
            switch (transaction.type) {
                case 'purchase':
                    bookTitle = transaction.bookData.title;
                    price = `$${transaction.price.toFixed(2)}`;
                    savings = `$${transaction.moneySaved.toFixed(2)}`;
                    break;
                case 'sale':
                    bookTitle = transaction.bookData.title;
                    price = `$${transaction.price.toFixed(2)}`;
                    savings = 'N/A';
                    break;
                case 'swap':
                    bookTitle = `${transaction.bookGiven.title} ↔ ${transaction.bookReceived.title}`;
                    price = 'Swap';
                    savings = `$${transaction.moneySaved.toFixed(2)}`;
                    break;
            }
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                    <td>${bookTitle}</td>
                    <td>${price}</td>
                    <td>${savings}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        historyContainer.innerHTML = html;
    }
    
    /**
     * Update charts display
     */
    updateCharts() {
        // This would use a charting library like Chart.js in a real implementation
        // For this demo, we'll just update a placeholder
        const chartsContainer = document.getElementById('analytics-charts');
        if (!chartsContainer) return;
        
        chartsContainer.innerHTML = `
            <div class="chart-container">
                <h3>Transaction History</h3>
                <div class="chart-placeholder">
                    <p>Charts would be displayed here using Chart.js or similar library</p>
                    <p>Showing trends of books bought/sold/swapped over time</p>
                </div>
            </div>
            <div class="chart-container">
                <h3>Money Saved vs. Earned</h3>
                <div class="chart-placeholder">
                    <p>Charts would be displayed here using Chart.js or similar library</p>
                    <p>Comparing money saved from purchases vs. money earned from sales</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate the complete analytics dashboard HTML
     */
    generateDashboardHTML(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = `
            <div class="analytics-dashboard">
                <div class="dashboard-header">
                    <h2>Your BookSwap Analytics</h2>
                    <p>Track your book transactions and savings</p>
                </div>
                
                <div class="dashboard-section">
                    <h3>Summary</h3>
                    <div id="analytics-summary" class="metrics-container">
                        <!-- Summary metrics will be inserted here -->
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Transaction History</h3>
                    <div id="transaction-history" class="history-container">
                        <!-- Transaction history will be inserted here -->
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Analytics</h3>
                    <div id="analytics-charts" class="charts-container">
                        <!-- Charts will be inserted here -->
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Update displays
        this.updateSummaryMetrics();
        this.updateTransactionHistory();
        this.updateCharts();
    }
}

// Initialize analytics dashboard when the script is loaded
window.analyticsDashboard = null;

// Function to initialize analytics dashboard
function initializeAnalyticsDashboard() {
    window.analyticsDashboard = new UserAnalyticsDashboard();
}

} // Close the if (typeof UserAnalyticsDashboard === 'undefined') block