/**
 * Home Page Module for Campus BookSwap
 * Handles loading and displaying recently listed books on the homepage
 */

class HomeManager {
    constructor() {
        this.recentListings = [];
        this.bookCardsContainer = document.querySelector('.book-cards');
        
        // Initialize home page
        this.initHomePage();
    }
    
    /**
     * Initialize the home page
     */
    initHomePage() {
        // Load recent book listings
        this.loadRecentListings();
        
        // Update login status in UI
        this.updateLoginStatus();
    }
    
    /**
     * Load recent book listings from localStorage
     */
    loadRecentListings() {
        // Get all listings from localStorage
        const allListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Filter out listings that are not active
        const activeListings = allListings.filter(listing => listing.status === 'active');
        
        // Sort by date added (newest first)
        activeListings.sort((a, b) => {
            const dateA = new Date(a.dateAdded || 0);
            const dateB = new Date(b.dateAdded || 0);
            return dateB - dateA;
        });
        
        // Get the 3 most recent listings
        this.recentListings = activeListings.slice(0, 3);
        
        // Display the listings
        this.displayRecentListings();
    }
    
    /**
     * Display recent book listings on the homepage
     */
    displayRecentListings() {
        if (!this.bookCardsContainer) {
            console.error('Book cards container not found');
            return;
        }
        
        // Clear existing listings
        this.bookCardsContainer.innerHTML = '';
        
        if (this.recentListings.length === 0) {
            // Show placeholder cards if no listings are available
            this.displayPlaceholderCards();
            return;
        }
        
        // Create a card for each listing
        this.recentListings.forEach(listing => {
            const bookCard = this.createBookCard(listing);
            this.bookCardsContainer.appendChild(bookCard);
        });
    }
    
    /**
     * Create a book card element
     * @param {Object} listing - Book listing data
     * @returns {HTMLElement} Book card element
     */
    createBookCard(listing) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.dataset.id = listing.id;
        
        // Format price
        const price = listing['listing-type'] === 'swap' ? 'For Swap' : `$${listing.price}`;
        
        // Create card HTML
        card.innerHTML = `
            <div class="book-image">
                <img src="${listing.imageUrl || 'https://via.placeholder.com/300x180?text=Book+Cover'}" alt="${listing.title}">
            </div>
            <div class="book-info">
                <h3>${listing.title}</h3>
                <p class="author">By ${listing.author}</p>
                <p class="course">${listing['course-code'] || 'N/A'}</p>
                <div class="book-meta">
                    <span class="price">${price}</span>
                    <span class="condition">${listing.condition}</span>
                </div>
                <a href="#" class="btn view-btn" data-id="${listing.id}">View Details</a>
            </div>
        `;
        
        // Add event listener for view details button
        const viewBtn = card.querySelector('.view-btn');
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showBookDetails(listing);
        });
        
        return card;
    }
    
    /**
     * Display placeholder cards when no listings are available
     */
    displayPlaceholderCards() {
        // Create placeholder cards
        const placeholders = [
            {
                title: 'Introduction to Computer Science',
                author: 'John Smith',
                course: 'CS101',
                price: '$45',
                condition: 'Like New'
            },
            {
                title: 'Principles of Economics',
                author: 'Sarah Johnson',
                course: 'ECON201',
                price: '$35',
                condition: 'Good'
            },
            {
                title: 'Organic Chemistry',
                author: 'Michael Brown',
                course: 'CHEM302',
                price: '$50',
                condition: 'Excellent'
            }
        ];
        
        placeholders.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            card.innerHTML = `
                <div class="book-image">
                    <img src="https://via.placeholder.com/300x180?text=Book+Cover" alt="${book.title}">
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">By ${book.author}</p>
                    <p class="course">${book.course}</p>
                    <div class="book-meta">
                        <span class="price">${book.price}</span>
                        <span class="condition">${book.condition}</span>
                    </div>
                    <a href="book-details.html" class="btn view-btn">View Details</a>
                </div>
            `;
            
            this.bookCardsContainer.appendChild(card);
        });
    }
    
    /**
     * Show book details in a modal
     * @param {Object} listing - Book listing data
     */
    showBookDetails(listing) {
        // For now, just show an alert with the book details
        alert(`Book Details:\n\nTitle: ${listing.title}\nAuthor: ${listing.author}\nPrice: ${listing['listing-type'] === 'swap' ? 'For Swap' : `$${listing.price}`}\nCondition: ${listing.condition}\nListed by: ${listing.userName}`);
        
        // In a real app, this would open a modal or navigate to a details page
    }
    
    /**
     * Update login status and UI
     */
    updateLoginStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtn = document.querySelector('.login-btn');
        
        if (currentUser && loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authProvider');
                window.location.href = 'index.html';
            });
        }
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homeManager = new HomeManager();
});