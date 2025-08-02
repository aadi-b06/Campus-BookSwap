/**
 * Browse Books Module for Campus BookSwap
 * Handles loading, displaying, filtering, and sorting book listings
 */

class BrowseManager {
    constructor() {
        this.allListings = [];
        this.filteredListings = [];
        this.currentSearchTerm = '';
        this.booksGrid = document.querySelector('.books-grid');
        
        // Initialize browse page
        this.initBrowsePage();
    }
    
    /**
     * Initialize the browse page
     */
    initBrowsePage() {
        // Load all book listings
        this.loadAllListings();
        
        // Set up search functionality
        this.setupSearch();
        
        // Set up filter functionality
        this.setupFilters();
        
        // Set up sort functionality
        this.setupSort();
        
        // Check login status and update UI
        this.updateLoginStatus();
    }
    
    /**
     * Load all book listings from localStorage
     */
    loadAllListings() {
        // Get all listings from localStorage
        this.allListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Filter out listings that are not active
        this.allListings = this.allListings.filter(listing => listing.status === 'active');
        
        // Set filtered listings to all listings initially
        this.filteredListings = [...this.allListings];
        
        // Display the listings
        this.displayListings();
    }
    
    /**
     * Display book listings in the grid
     */
    displayListings() {
        // Clear existing listings
        if (this.booksGrid) {
            this.booksGrid.innerHTML = '';
        } else {
            console.error('Books grid element not found');
            return;
        }
        
        if (this.filteredListings.length === 0) {
            // Show no results message
            this.showNoResultsMessage();
            return;
        }
        
        // Create a card for each listing
        this.filteredListings.forEach(listing => {
            const bookCard = this.createBookCard(listing);
            this.booksGrid.appendChild(bookCard);
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
        card.dataset.bookId = listing.id;
        card.dataset.sellerName = listing.userName || 'Unknown Seller';
        card.dataset.sellerId = listing.userId || 'unknown';
        
        // Format price
        const price = listing['listing-type'] === 'swap' ? 'For Swap' : `$${listing.price}`;
        
        // Create card HTML
        card.innerHTML = `
            <div class="book-image">
                <img src="${listing.imageUrl || 'https://via.placeholder.com/300x180?text=Book+Cover'}" alt="${listing.title}">
            </div>
            <div class="book-info">
                <h3 class="book-title">${listing.title}</h3>
                <p class="author">By ${listing.author}</p>
                <p class="course">${listing['course-code'] || 'N/A'}</p>
                <div class="book-meta">
                    <span class="price">${price}</span>
                    <span class="condition">${listing.condition}</span>
                </div>
                <div class="book-actions">
                    <a href="#" class="btn view-btn" data-id="${listing.id}">View Details</a>
                    <a href="#" class="btn message-seller-btn">Message</a>
                </div>
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
     * Show book details in a modal
     * @param {Object} listing - Book listing data
     */
    showBookDetails(listing) {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Format price
        const price = listing['listing-type'] === 'swap' ? 'For Swap' : `$${listing.price}`;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content book-details';
        modalContent.dataset.bookId = listing.id;
        modalContent.dataset.sellerName = listing.userName || 'Unknown Seller';
        modalContent.dataset.sellerId = listing.userId || 'unknown';
        
        // Create modal HTML
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3 class="book-title">${listing.title}</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="book-details-grid">
                    <div class="book-image-large">
                        <img src="${listing.imageUrl || 'https://via.placeholder.com/300x400?text=Book+Cover'}" alt="${listing.title}">
                    </div>
                    <div class="book-details-info">
                        <p><strong>Author:</strong> ${listing.author}</p>
                        <p><strong>Course:</strong> ${listing['course-code'] || 'N/A'}</p>
                        <p><strong>Department:</strong> ${listing.department || 'N/A'}</p>
                        <p><strong>Condition:</strong> ${listing.condition}</p>
                        <p><strong>Format:</strong> ${listing.format || 'N/A'}</p>
                        <p><strong>Price:</strong> ${price}</p>
                        <p><strong>Listed by:</strong> ${listing.userName || 'Unknown Seller'}</p>
                        <p><strong>Date Listed:</strong> ${new Date(listing.dateAdded || Date.now()).toLocaleDateString()}</p>
                        ${listing.description ? `<p><strong>Description:</strong> ${listing.description}</p>` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn message-seller-btn primary-button">Message Seller</button>
                <button class="btn close-details-btn secondary-button">Close</button>
            </div>
        `;
        
        // Add modal to body
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        const closeModal = () => {
            document.body.removeChild(modalContainer);
        };
        
        // Close button
        modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        
        // Close button in footer
        modalContainer.querySelector('.close-details-btn').addEventListener('click', closeModal);
        
        // Add modal styles if not already present
        if (!document.getElementById('book-details-modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'book-details-modal-styles';
            modalStyles.textContent = `
                .modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: white;
                    border-radius: 10px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .modal-header {
                    padding: 15px 20px;
                    border-bottom: 1px solid #ecf0f1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }
                
                .close-modal {
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #7f8c8d;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .book-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 20px;
                }
                
                .book-image-large img {
                    width: 100%;
                    max-width: 300px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                .book-details-info p {
                    margin: 10px 0;
                    line-height: 1.5;
                }
                
                .modal-footer {
                    padding: 15px 20px;
                    border-top: 1px solid #ecf0f1;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                .modal-footer button {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                
                .primary-button {
                    background-color: #3498db;
                    color: white;
                }
                
                .secondary-button {
                    background-color: #ecf0f1;
                    color: #2c3e50;
                }
                
                @media (max-width: 768px) {
                    .book-details-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .book-image-large {
                        text-align: center;
                    }
                }
            `;
            document.head.appendChild(modalStyles);
        }
    }
    
    /**
     * Show no results message
     */
    showNoResultsMessage() {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <h3>No books found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button class="btn primary-btn">Clear All</button>
        `;
        
        this.booksGrid.appendChild(noResults);
        
        // Add event listener to clear filters button
        noResults.querySelector('button').addEventListener('click', () => {
            // Reset search input
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.value = '';
                this.currentSearchTerm = '';
            }
            
            // Reset filter form
            const filterForm = document.querySelector('.filter-form');
            if (filterForm) {
                filterForm.reset();
            }
            
            // Reset filters and display all listings
            this.resetFilters();
        });
    }
    
    /**
     * Set up search functionality
     */
    setupSearch() {
        const searchInput = document.querySelector('.search-bar input');
        if (!searchInput) return;
        
        // Debounce function to limit how often the search is performed
        let debounceTimeout;
        
        // Search on input change with debounce
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.currentSearchTerm = searchInput.value.trim().toLowerCase();
                this.applySearchAndFilters();
            }, 300); // 300ms debounce delay
        });
        
        // Search on Enter key press (immediate)
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(debounceTimeout);
                this.currentSearchTerm = searchInput.value.trim().toLowerCase();
                this.applySearchAndFilters();
            }
        });
    }
    
    /**
     * Set up filter functionality
     */
    setupFilters() {
        const filterForm = document.querySelector('.filter-form');
        if (!filterForm) return;
        
        // Filter form submission
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applySearchAndFilters();
        });
        
        // Reset filters button
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterForm.reset();
                this.resetFilters();
            });
        }
    }
    
    /**
     * Apply search and filters to listings
     */
    applySearchAndFilters() {
        // Get all filter values
        const department = document.getElementById('department')?.value || '';
        const semester = document.getElementById('semester')?.value || '';
        const condition = document.getElementById('condition')?.value || '';
        const format = document.getElementById('format')?.value || '';
        const priceMin = document.getElementById('price-min')?.value ? parseFloat(document.getElementById('price-min').value) : 0;
        const priceMax = document.getElementById('price-max')?.value ? parseFloat(document.getElementById('price-max').value) : Infinity;
        const listingType = document.getElementById('listing-type')?.value || '';
        
        // Filter listings based on search term and filters
        this.filteredListings = this.allListings.filter(listing => {
            // Check search term match
            const matchesSearch = this.currentSearchTerm === '' || 
                listing.title.toLowerCase().includes(this.currentSearchTerm) || 
                listing.author.toLowerCase().includes(this.currentSearchTerm) || 
                (listing['course-code'] && listing['course-code'].toLowerCase().includes(this.currentSearchTerm));
            
            // Check department filter
            let matchesDepartment = true;
            if (department) {
                matchesDepartment = listing.department === department;
            }
            
            // Check semester filter (if implemented)
            let matchesSemester = true;
            if (semester && listing.semester) {
                matchesSemester = listing.semester === semester;
            }
            
            // Check condition filter
            let matchesCondition = true;
            if (condition) {
                matchesCondition = listing.condition && listing.condition.toLowerCase().includes(condition.replace('-', ' ').toLowerCase());
            }
            
            // Check format filter
            let matchesFormat = true;
            if (format) {
                matchesFormat = listing.format === format;
            }
            
            // Check price range filter
            let matchesPrice = true;
            if (listing.price) {
                const price = parseFloat(listing.price);
                matchesPrice = price >= priceMin && (priceMax === Infinity || price <= priceMax);
            }
            
            // Check listing type filter
            let matchesListingType = true;
            if (listingType) {
                matchesListingType = listing['listing-type'] === listingType;
            }
            
            // Return true if listing matches all criteria
            return matchesSearch && matchesDepartment && matchesSemester && 
                   matchesCondition && matchesFormat && matchesPrice && matchesListingType;
        });
        
        // Display filtered listings
        this.displayListings();
    }
    
    /**
     * Reset filters and display all listings
     */
    resetFilters() {
        // Clear the current search term
        this.currentSearchTerm = '';
        
        // Reset filtered listings to all listings
        this.filteredListings = [...this.allListings];
        
        // Display all listings
        this.displayListings();
    }
    
    /**
     * Set up sort functionality
     */
    setupSort() {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect) return;
        
        sortSelect.addEventListener('change', () => {
            const sortOption = sortSelect.value;
            this.sortListings(sortOption);
        });
    }
    
    /**
     * Sort listings based on selected option
     * @param {string} sortOption - Sort option
     */
    sortListings(sortOption) {
        // Sort filtered listings based on selected option
        this.filteredListings.sort((a, b) => {
            if (sortOption === 'price-low') {
                const priceA = a['listing-type'] === 'swap' ? 0 : parseFloat(a.price || 0);
                const priceB = b['listing-type'] === 'swap' ? 0 : parseFloat(b.price || 0);
                return priceA - priceB;
            } else if (sortOption === 'price-high') {
                const priceA = a['listing-type'] === 'swap' ? 0 : parseFloat(a.price || 0);
                const priceB = b['listing-type'] === 'swap' ? 0 : parseFloat(b.price || 0);
                return priceB - priceA;
            } else if (sortOption === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                // Default: newest first (based on dateAdded)
                const dateA = new Date(a.dateAdded || 0);
                const dateB = new Date(b.dateAdded || 0);
                return dateB - dateA;
            }
        });
        
        // Display sorted listings
        this.displayListings();
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

// Initialize browse page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.browseManager = new BrowseManager();
});