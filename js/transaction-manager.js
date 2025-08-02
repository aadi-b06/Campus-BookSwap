/**
 * Transaction Manager for Campus BookSwap
 * Handles dynamic transaction creation, updates, and display
 */

class TransactionManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.transactions = this.loadTransactions() || [];
        this.initTransactionSystem();
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Load transactions from localStorage
     */
    loadTransactions() {
        const transactionsJson = localStorage.getItem('bookswap_transactions');
        return transactionsJson ? JSON.parse(transactionsJson) : [];
    }

    /**
     * Save transactions to localStorage
     */
    saveTransactions() {
        localStorage.setItem('bookswap_transactions', JSON.stringify(this.transactions));
    }

    /**
     * Initialize the transaction system
     */
    initTransactionSystem() {
        // Listen for book sale events
        document.addEventListener('bookMarkedAsSold', (event) => {
            this.handleBookSold(event.detail);
        });

        // Listen for tab changes to update transaction display
        this.setupTabListeners();
    }

    /**
     * Set up event listeners for tab changes
     */
    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.tab === 'transactions') {
                    setTimeout(() => this.renderTransactionsTable(), 100);
                }
            });
        });
    }

    /**
     * Handle when a book is marked as sold
     * @param {Object} saleData - Data about the book sale
     */
    handleBookSold(saleData) {
        const transaction = this.createTransaction(saleData);
        this.addTransaction(transaction);
        
        // Update analytics if available
        if (window.analyticsDashboard) {
            window.analyticsDashboard.recordBookSale(saleData.bookData, saleData.price);
        }

        // Send notification
        if (window.notificationSystem) {
            window.notificationSystem.addNotification({
                type: 'transaction',
                message: `Book "${saleData.bookData.title}" marked as sold for $${saleData.price}`,
                data: { transactionId: transaction.id },
                link: 'dashboard.html?tab=transactions'
            });
        }

        // Update transaction display if currently visible
        const transactionsTab = document.getElementById('transactions');
        if (transactionsTab && transactionsTab.classList.contains('active')) {
            this.renderTransactionsTable();
        }
    }

    /**
     * Create a new transaction record
     * @param {Object} saleData - Data about the book sale
     * @returns {Object} Transaction object
     */
    createTransaction(saleData) {
        const transaction = {
            id: this.generateTransactionId(),
            date: new Date().toISOString(),
            bookId: saleData.bookData.id,
            bookTitle: saleData.bookData.title,
            bookAuthor: saleData.bookData.author,
            type: saleData.type || 'Sale', // Sale, Swap, Purchase
            sellerId: this.currentUser?.id || 'unknown',
            sellerName: this.currentUser?.name || 'Unknown User',
            buyerId: saleData.buyerId || 'pending',
            buyerName: saleData.buyerName || 'Pending',
            amount: saleData.price || 0,
            status: saleData.status || 'Completed',
            paymentMethod: saleData.paymentMethod || 'Cash',
            meetingLocation: saleData.meetingLocation || 'Campus',
            notes: saleData.notes || ''
        };

        return transaction;
    }

    /**
     * Generate a unique transaction ID
     * @returns {string} Unique transaction ID
     */
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `TXN-${timestamp}-${random}`;
    }

    /**
     * Add a new transaction
     * @param {Object} transaction - Transaction object
     */
    addTransaction(transaction) {
        this.transactions.unshift(transaction); // Add to beginning for newest first
        this.saveTransactions();
    }

    /**
     * Get transactions for current user
     * @param {string} filter - Filter type ('all', 'sales', 'purchases', 'swaps')
     * @returns {Array} Filtered transactions
     */
    getUserTransactions(filter = 'all') {
        if (!this.currentUser) return [];

        const userId = this.currentUser.id;
        let userTransactions = this.transactions.filter(transaction => 
            transaction.sellerId === userId || transaction.buyerId === userId
        );

        // Apply filter
        switch (filter) {
            case 'sales':
                userTransactions = userTransactions.filter(t => 
                    t.sellerId === userId && t.type === 'Sale'
                );
                break;
            case 'purchases':
                userTransactions = userTransactions.filter(t => 
                    t.buyerId === userId && t.type === 'Sale'
                );
                break;
            case 'swaps':
                userTransactions = userTransactions.filter(t => t.type === 'Swap');
                break;
            default:
                // 'all' - no additional filtering
                break;
        }

        return userTransactions;
    }

    /**
     * Render the transactions table in the dashboard
     */
    renderTransactionsTable() {
        const transactionsTab = document.getElementById('transactions');
        if (!transactionsTab) return;

        const transactions = this.getUserTransactions();
        
        // Create filter buttons
        const filterHTML = `
            <div class="transaction-filters" style="margin-bottom: 1rem;">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="sales">Sales</button>
                <button class="filter-btn" data-filter="purchases">Purchases</button>
                <button class="filter-btn" data-filter="swaps">Swaps</button>
            </div>
        `;

        // Create table HTML
        let tableHTML = `
            ${filterHTML}
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Book</th>
                        <th>Type</th>
                        <th>With</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (transactions.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="6" class="empty-transactions">
                        <div class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h3>No Transactions Yet</h3>
                            <p>Your completed transactions will appear here.</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            transactions.forEach(transaction => {
                const date = new Date(transaction.date).toLocaleDateString();
                const isUserSeller = transaction.sellerId === this.currentUser?.id;
                const otherParty = isUserSeller ? transaction.buyerName : transaction.sellerName;
                const transactionType = isUserSeller ? 'Sale' : 'Purchase';
                const amount = transaction.type === 'Swap' ? '-' : `$${transaction.amount.toFixed(2)}`;
                
                tableHTML += `
                    <tr>
                        <td>${date}</td>
                        <td>${transaction.bookTitle}</td>
                        <td>${transactionType}</td>
                        <td>${otherParty}</td>
                        <td>${amount}</td>
                        <td><span class="transaction-status status-${transaction.status.toLowerCase().replace(' ', '-')}">${transaction.status}</span></td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                </tbody>
            </table>
        `;

        transactionsTab.innerHTML = tableHTML;

        // Add filter event listeners
        this.setupTransactionFilters();
    }

    /**
     * Set up event listeners for transaction filters
     */
    setupTransactionFilters() {
        const filterButtons = document.querySelectorAll('.transaction-filters .filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter transactions
                const filter = button.dataset.filter;
                this.filterTransactions(filter);
            });
        });
    }

    /**
     * Filter and re-render transactions
     * @param {string} filter - Filter type
     */
    filterTransactions(filter) {
        const transactions = this.getUserTransactions(filter);
        const tbody = document.querySelector('.transactions-table tbody');
        
        if (!tbody) return;

        // Clear existing rows
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-transactions">
                        <div class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h3>No ${filter === 'all' ? '' : filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions</h3>
                            <p>Your ${filter === 'all' ? '' : filter} transactions will appear here.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Add filtered transactions
        transactions.forEach(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            const isUserSeller = transaction.sellerId === this.currentUser?.id;
            const otherParty = isUserSeller ? transaction.buyerName : transaction.sellerName;
            const transactionType = isUserSeller ? 'Sale' : 'Purchase';
            const amount = transaction.type === 'Swap' ? '-' : `$${transaction.amount.toFixed(2)}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${transaction.bookTitle}</td>
                <td>${transactionType}</td>
                <td>${otherParty}</td>
                <td>${amount}</td>
                <td><span class="transaction-status status-${transaction.status.toLowerCase().replace(' ', '-')}">${transaction.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Simulate a book purchase (for demo purposes)
     * @param {Object} bookData - Book data
     * @param {number} price - Purchase price
     */
    simulateBookPurchase(bookData, price) {
        const transaction = {
            id: this.generateTransactionId(),
            date: new Date().toISOString(),
            bookId: bookData.id,
            bookTitle: bookData.title,
            bookAuthor: bookData.author,
            type: 'Sale',
            sellerId: bookData.sellerId || 'other-user',
            sellerName: bookData.sellerName || 'Other User',
            buyerId: this.currentUser?.id || 'unknown',
            buyerName: this.currentUser?.name || 'Unknown User',
            amount: price,
            status: 'Completed',
            paymentMethod: 'PayPal',
            meetingLocation: 'Library',
            notes: 'Demo transaction'
        };

        this.addTransaction(transaction);
        
        // Update analytics if available
        if (window.analyticsDashboard) {
            window.analyticsDashboard.recordBookPurchase(bookData, price);
        }

        // Send notification
        if (window.notificationSystem) {
            window.notificationSystem.addNotification({
                type: 'transaction',
                message: `Successfully purchased "${bookData.title}" for $${price}`,
                data: { transactionId: transaction.id },
                link: 'dashboard.html?tab=transactions'
            });
        }
    }
}

// Initialize transaction manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transactionManager = new TransactionManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransactionManager;
}