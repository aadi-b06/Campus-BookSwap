/**
 * Demo Transaction Data Generator
 * Creates sample transactions for demonstration purposes
 */

class DemoTransactionGenerator {
    constructor() {
        this.sampleBooks = [
            {
                id: 'book-001',
                title: 'Data Structures and Algorithms',
                author: 'Thomas H. Cormen',
                isbn: '9780262033848',
                department: 'Computer Science'
            },
            {
                id: 'book-002',
                title: 'Calculus: Early Transcendentals',
                author: 'James Stewart',
                isbn: '9781285741550',
                department: 'Mathematics'
            },
            {
                id: 'book-003',
                title: 'Physics for Scientists and Engineers',
                author: 'Raymond A. Serway',
                isbn: '9781133947271',
                department: 'Physics'
            },
            {
                id: 'book-004',
                title: 'Introduction to Psychology',
                author: 'James W. Kalat',
                isbn: '9781305271555',
                department: 'Psychology'
            },
            {
                id: 'book-005',
                title: 'Organic Chemistry',
                author: 'Paula Yurkanis Bruice',
                isbn: '9780134042282',
                department: 'Chemistry'
            }
        ];

        this.sampleUsers = [
            { id: 'user-001', name: 'Mike Johnson' },
            { id: 'user-002', name: 'Sarah Davis' },
            { id: 'user-003', name: 'David Wilson' },
            { id: 'user-004', name: 'Emma Brown' },
            { id: 'user-005', name: 'Alex Chen' },
            { id: 'user-006', name: 'Lisa Rodriguez' }
        ];

        this.transactionStatuses = ['Completed', 'In Progress', 'Pending', 'Cancelled'];
        this.paymentMethods = ['Cash', 'PayPal', 'Venmo', 'Zelle', 'Credit Card'];
        this.meetingLocations = ['Library', 'Student Center', 'Coffee Shop', 'Campus Bookstore', 'Dormitory'];
    }

    /**
     * Generate sample transactions for demo purposes
     * @param {number} count - Number of transactions to generate
     * @returns {Array} Array of sample transactions
     */
    generateSampleTransactions(count = 10) {
        const transactions = [];
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            console.warn('No current user found for demo transactions');
            return [];
        }

        for (let i = 0; i < count; i++) {
            const book = this.getRandomBook();
            const otherUser = this.getRandomUser();
            const isUserSeller = Math.random() > 0.5;
            const transactionType = Math.random() > 0.8 ? 'Swap' : 'Sale';
            const status = this.getRandomStatus();
            const price = transactionType === 'Swap' ? 0 : this.getRandomPrice();
            
            // Create transaction date (within last 6 months)
            const daysAgo = Math.floor(Math.random() * 180);
            const transactionDate = new Date();
            transactionDate.setDate(transactionDate.getDate() - daysAgo);

            const transaction = {
                id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: transactionDate.toISOString(),
                bookId: book.id,
                bookTitle: book.title,
                bookAuthor: book.author,
                type: transactionType,
                sellerId: isUserSeller ? currentUser.id : otherUser.id,
                sellerName: isUserSeller ? currentUser.name : otherUser.name,
                buyerId: isUserSeller ? otherUser.id : currentUser.id,
                buyerName: isUserSeller ? otherUser.name : currentUser.name,
                amount: price,
                status: status,
                paymentMethod: this.getRandomPaymentMethod(),
                meetingLocation: this.getRandomMeetingLocation(),
                notes: this.generateRandomNotes()
            };

            transactions.push(transaction);
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            return JSON.parse(userJson);
        }
        
        // Return a default user for demo purposes
        return {
            id: 'demo-user',
            name: 'John Smith',
            email: 'john.smith@university.edu'
        };
    }

    /**
     * Get a random book from the sample books
     */
    getRandomBook() {
        return this.sampleBooks[Math.floor(Math.random() * this.sampleBooks.length)];
    }

    /**
     * Get a random user from the sample users
     */
    getRandomUser() {
        return this.sampleUsers[Math.floor(Math.random() * this.sampleUsers.length)];
    }

    /**
     * Get a random transaction status
     */
    getRandomStatus() {
        const weights = [0.7, 0.15, 0.1, 0.05]; // Completed, In Progress, Pending, Cancelled
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return this.transactionStatuses[i];
            }
        }
        
        return this.transactionStatuses[0];
    }

    /**
     * Get a random price between $15 and $150
     */
    getRandomPrice() {
        return Math.floor(Math.random() * 135) + 15; // $15 to $150
    }

    /**
     * Get a random payment method
     */
    getRandomPaymentMethod() {
        return this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)];
    }

    /**
     * Get a random meeting location
     */
    getRandomMeetingLocation() {
        return this.meetingLocations[Math.floor(Math.random() * this.meetingLocations.length)];
    }

    /**
     * Generate random transaction notes
     */
    generateRandomNotes() {
        const notes = [
            'Great condition, quick transaction',
            'Book in excellent condition',
            'Smooth exchange, friendly seller',
            'Met at agreed location on time',
            'Book as described, happy with purchase',
            'Quick and easy transaction',
            'Seller was very helpful',
            'Book in good condition as expected',
            'Pleasant transaction experience',
            'Would buy from this seller again'
        ];
        
        return Math.random() > 0.3 ? notes[Math.floor(Math.random() * notes.length)] : '';
    }

    /**
     * Initialize demo transactions if none exist
     */
    initializeDemoTransactions() {
        const existingTransactions = localStorage.getItem('bookswap_transactions');
        
        if (!existingTransactions || JSON.parse(existingTransactions).length === 0) {
            const demoTransactions = this.generateSampleTransactions(8);
            localStorage.setItem('bookswap_transactions', JSON.stringify(demoTransactions));
            console.log('Demo transactions initialized:', demoTransactions.length, 'transactions created');
            return demoTransactions;
        }
        
        return JSON.parse(existingTransactions);
    }

    /**
     * Add a few more demo transactions
     */
    addMoreDemoTransactions(count = 3) {
        const existingTransactions = JSON.parse(localStorage.getItem('bookswap_transactions') || '[]');
        const newTransactions = this.generateSampleTransactions(count);
        
        const allTransactions = [...newTransactions, ...existingTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        localStorage.setItem('bookswap_transactions', JSON.stringify(allTransactions));
        
        // Trigger transaction manager to refresh if it exists
        if (window.transactionManager) {
            window.transactionManager.transactions = allTransactions;
            window.transactionManager.renderTransactionsTable();
        }
        
        console.log('Added', count, 'new demo transactions');
        return newTransactions;
    }

    /**
     * Clear all demo transactions
     */
    clearDemoTransactions() {
        localStorage.removeItem('bookswap_transactions');
        
        // Trigger transaction manager to refresh if it exists
        if (window.transactionManager) {
            window.transactionManager.transactions = [];
            window.transactionManager.renderTransactionsTable();
        }
        
        console.log('Demo transactions cleared');
    }
}

// Initialize demo transaction generator
window.demoTransactionGenerator = new DemoTransactionGenerator();

// Auto-initialize demo transactions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        window.demoTransactionGenerator.initializeDemoTransactions();
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoTransactionGenerator;
}