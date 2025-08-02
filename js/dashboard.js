/**
 * Dashboard Module for Campus BookSwap
 * Handles dashboard initialization, user profile display, and book listings management
 */

class DashboardManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.authProvider = this.getAuthProvider();
        this.bookListingManager = new BookListingManager(this.currentUser);
        
        // Initialize dashboard
        this.initDashboard();
    }

    /**
     * Initialize dashboard components
     */
    initDashboard() {
        this.updateUserWelcome();
        this.updateProfileTab();
        this.setupLogoutButton();
        this.setupTabNavigation();
        this.bookListingManager.loadUserListings();
    }
    
    /**
     * Set up tab navigation
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (!tabButtons.length || !tabContents.length) return;
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding tab content
                const tabId = button.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data or null if not logged in
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Get authentication provider
     * @returns {string|null} Authentication provider or null if not logged in
     */
    getAuthProvider() {
        return localStorage.getItem('authProvider');
    }

    /**
     * Update user welcome section in dashboard header
     */
    updateUserWelcome() {
        if (!this.currentUser) return;

        // Update user avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            // If user has a picture (from Google auth), use it
            if (this.currentUser.picture) {
                userAvatar.innerHTML = `<img src="${this.currentUser.picture}" alt="${this.currentUser.name}">`;
                userAvatar.classList.add('has-image');
            } else {
                // Otherwise use initials
                const initials = this.getInitials(this.currentUser.name);
                userAvatar.textContent = initials;
            }
        }

        // Update user name and info
        const userNameElement = document.querySelector('.user-info h2');
        if (userNameElement) {
            userNameElement.textContent = `Welcome, ${this.currentUser.name}`;
        }

        const userInfoElement = document.querySelector('.user-info p');
        if (userInfoElement) {
            let infoText = '';
            
            if (this.currentUser.department) {
                infoText += `${this.currentUser.department} Department`;
            }
            
            if (this.currentUser.university) {
                infoText += infoText ? ` • ${this.currentUser.university}` : this.currentUser.university;
            }
            
            userInfoElement.textContent = infoText || 'University Student';
        }
    }

    /**
     * Update the profile tab with user information
     */
    updateProfileTab() {
        const profileContainer = document.querySelector('.profile-container');
        if (!profileContainer || !this.currentUser) return;

        // Update profile avatar
        const profileAvatar = profileContainer.querySelector('.profile-avatar img');
        if (profileAvatar) {
            if (this.currentUser.picture) {
                profileAvatar.src = this.currentUser.picture;
            } else {
                profileAvatar.src = 'images/avatar.png';
            }
        }

        // Update profile name
        const profileName = profileContainer.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = this.currentUser.name || 'User';
        }

        // Update profile email
        const profileEmail = profileContainer.querySelector('.profile-email');
        if (profileEmail) {
            profileEmail.textContent = this.currentUser.email || '';
        }

        // Update form fields
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const emailInput = document.getElementById('email');
        const universityInput = document.getElementById('university');
        const departmentSelect = document.getElementById('department');

        if (this.currentUser.name) {
            const nameParts = this.currentUser.name.split(' ');
            if (firstNameInput && nameParts.length > 0) {
                firstNameInput.value = nameParts[0];
            }
            if (lastNameInput && nameParts.length > 1) {
                lastNameInput.value = nameParts.slice(1).join(' ');
            }
        }

        if (emailInput && this.currentUser.email) {
            emailInput.value = this.currentUser.email;
        }

        if (universityInput && this.currentUser.university) {
            universityInput.value = this.currentUser.university;
        }

        if (departmentSelect && this.currentUser.department) {
            // Find and select the option that matches the user's department
            for (let i = 0; i < departmentSelect.options.length; i++) {
                if (departmentSelect.options[i].text === this.currentUser.department) {
                    departmentSelect.selectedIndex = i;
                    break;
                }
            }
        }

        // Add authentication provider information
        const authProvider = localStorage.getItem('authProvider');
        if (authProvider) {
            const profileInfoContainer = profileContainer.querySelector('.profile-info');
            if (profileInfoContainer) {
                // Check if auth provider element already exists
                const existingAuthProvider = profileInfoContainer.querySelector('.auth-provider');
                if (!existingAuthProvider) {
                    const authProviderElement = document.createElement('div');
                    authProviderElement.className = 'auth-provider';
                    authProviderElement.textContent = `Signed in with ${authProvider}`;
                    profileInfoContainer.appendChild(authProviderElement);
                }
            }
        }
        
        // Set up save changes button
        this.setupSaveChangesButton();
    }

    /**
     * Set up logout button functionality
     */
    setupLogoutButton() {
        const logoutBtn = document.querySelector('.login-btn');
        if (logoutBtn) {
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Store the user's ID before logging out to maintain association with their listings
                const currentUser = this.getCurrentUser();
                if (currentUser) {
                    // Save the user ID in a separate storage key for future reference
                    localStorage.setItem('lastLoggedInUser', JSON.stringify({
                        id: currentUser.id || currentUser.email,
                        email: currentUser.email
                    }));
                }
                
                // Clear user data from localStorage
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authProvider');
                
                // Redirect to home page
                window.location.href = 'index.html';
            });
        }
    }
    
    /**
     * Set up save changes button functionality
     */
    setupSaveChangesButton() {
        const saveChangesBtn = document.querySelector('.save-changes-btn');
        if (!saveChangesBtn) return;
        
        // Remove any existing event listeners by cloning and replacing the button
        const newSaveChangesBtn = saveChangesBtn.cloneNode(true);
        saveChangesBtn.parentNode.replaceChild(newSaveChangesBtn, saveChangesBtn);
        
        newSaveChangesBtn.addEventListener('click', () => {
            // Get form values
            const firstName = document.getElementById('first-name')?.value || '';
            const lastName = document.getElementById('last-name')?.value || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const email = document.getElementById('email')?.value || this.currentUser.email;
            const university = document.getElementById('university')?.value || '';
            const departmentSelect = document.getElementById('department');
            const department = departmentSelect ? departmentSelect.options[departmentSelect.selectedIndex].text : '';
            
            // Update user object
            const updatedUser = {
                ...this.currentUser,
                name: fullName,
                email: email,
                university: university,
                department: department
            };
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Update current user
            this.currentUser = updatedUser;
            
            // Update UI
            this.updateUserWelcome();
            this.updateProfileTab();
            
            // Show success message
            alert('Profile changes saved successfully!');
        });
    }

    /**
     * Get initials from a name
     * @param {string} name - Full name
     * @returns {string} Initials (up to 2 characters)
     */
    getInitials(name) {
        if (!name) return '?';
        
        const parts = name.split(' ').filter(part => part.length > 0);
        
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}

/**
 * Book Listing Manager
 * Handles saving, loading, and displaying book listings
 */
class BookListingManager {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.listings = [];
        this.setupListingForm();
    }
    
    /**
     * Set up event listeners for the listing form in sell.html
     */
    setupListingForm() {
        // This method will be called from sell.html
        const listingForm = document.getElementById('book-listing-form');
        if (!listingForm) return;
        
        // Override the form submission
        listingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!this.currentUser) {
                alert('Please log in to list a book');
                window.location.href = 'login.html';
                return;
            }
            
            // Collect form data
            const formData = new FormData(listingForm);
            const listingData = {};
            
            formData.forEach((value, key) => {
                // Skip file inputs for now
                if (key !== 'book-image') {
                    listingData[key] = value;
                }
            });
            
            // Handle image upload
            const imageInput = document.getElementById('book-image');
            if (imageInput && imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    // Store the image as a data URL
                    listingData.imageUrl = e.target.result;
                    
                    // Complete the listing process
                    this.completeListingProcess(listingData);
                };
                
                reader.readAsDataURL(file);
            } else {
                // No image uploaded, use placeholder
                listingData.imageUrl = 'https://via.placeholder.com/300x180?text=No+Image';
                this.completeListingProcess(listingData);
            }
        });
    }
    
    /**
     * Complete the listing process after handling image upload
     * @param {Object} listingData - Book listing data
     */
    completeListingProcess(listingData) {
        // Add additional metadata
        listingData.id = Date.now().toString();
        listingData.userId = this.currentUser.id || this.currentUser.email;
        listingData.userName = this.currentUser.name;
        listingData.dateAdded = new Date().toISOString();
        listingData.status = 'active';
        
        // Save the listing
        this.saveBookListing(listingData);
        
        // Show success message
        alert('Your book has been listed successfully!');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
    
    /**
     * Save a book listing to localStorage
     * @param {Object} listingData - Book listing data
     */
    saveBookListing(listingData) {
        // Get existing listings from localStorage
        const existingListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Add the new listing
        existingListings.push(listingData);
        
        // Save back to localStorage
        localStorage.setItem('bookListings', JSON.stringify(existingListings));
    }
    
    /**
     * Load user's book listings from localStorage
     */
    loadUserListings() {
        if (!this.currentUser) return;
        
        // Get all listings from localStorage
        const allListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Filter for current user's listings
        const userId = this.currentUser.id || this.currentUser.email;
        this.listings = allListings.filter(listing => listing.userId === userId);
        
        // Display the listings
        this.displayUserListings();
    }
    
    /**
     * Display user's book listings in the dashboard
     */
    displayUserListings() {
        const listingsGrid = document.querySelector('.listings-grid');
        if (!listingsGrid) return;
        
        // Clear existing listings
        listingsGrid.innerHTML = '';
        
        if (this.listings.length === 0) {
            // Show empty state
            listingsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>No Books Listed Yet</h3>
                    <p>You haven't listed any books for sale or swap yet.</p>
                    <a href="sell.html" class="action-button primary-button">
                        <i class="fas fa-plus"></i> List a Book
                    </a>
                </div>
            `;
            return;
        }
        
        // Create a card for each listing
        this.listings.forEach(listing => {
            const listingCard = this.createListingCard(listing);
            listingsGrid.appendChild(listingCard);
        });
    }
    
    /**
     * Create a listing card element
     * @param {Object} listing - Book listing data
     * @returns {HTMLElement} Listing card element
     */
    createListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.dataset.id = listing.id;
        
        // Format price
        const price = listing['listing-type'] === 'swap' ? 'For Swap' : `$${listing.price}`;
        
        // Status badge class
        const statusClass = {
            'active': 'status-active',
            'pending': 'status-pending',
            'sold': 'status-sold'
        }[listing.status] || 'status-active';
        
        // Status text
        const statusText = {
            'active': 'Active',
            'pending': 'Pending',
            'sold': 'Sold'
        }[listing.status] || 'Active';
        
        // Create card HTML
        card.innerHTML = `
            <div class="listing-status ${statusClass}">${statusText}</div>
            <div class="listing-image">
                <img src="${listing.imageUrl || 'https://via.placeholder.com/300x180?text=Book+Cover'}" alt="${listing.title}">
            </div>
            <div class="listing-details">
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-author">By ${listing.author}</p>
                <div class="listing-meta">
                    <span class="listing-price">${price}</span>
                    <span class="listing-type">${listing['listing-type'] || 'Sale'}</span>
                </div>
                <div class="listing-actions">
                    <button class="listing-action-btn edit-btn">Edit</button>
                    <button class="listing-action-btn delete-btn">Delete</button>
                    ${listing.status !== 'sold' ? `<button class="listing-action-btn mark-sold-btn">Mark as Sold</button>` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners for action buttons
        this.setupListingCardActions(card, listing);
        
        return card;
    }
    
    /**
     * Set up event listeners for listing card action buttons
     * @param {HTMLElement} card - Listing card element
     * @param {Object} listing - Book listing data
     */
    setupListingCardActions(card, listing) {
        // Edit button
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // In a real app, this would redirect to an edit page
                // For demo, we'll just show an alert
                alert('Edit functionality would be implemented in a real app');
            });
        }
        
        // Delete button
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this listing?')) {
                    this.deleteBookListing(listing.id);
                }
            });
        }
        
        // Mark as sold button
        const markSoldBtn = card.querySelector('.mark-sold-btn');
        if (markSoldBtn) {
            markSoldBtn.addEventListener('click', () => {
                if (confirm('Mark this book as sold?')) {
                    this.updateListingStatus(listing.id, 'sold');
                }
            });
        }
    }
    
    /**
     * Delete a book listing
     * @param {string} listingId - ID of the listing to delete
     */
    deleteBookListing(listingId) {
        // Get all listings from localStorage
        const allListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Filter out the listing to delete
        const updatedListings = allListings.filter(listing => listing.id !== listingId);
        
        // Save back to localStorage
        localStorage.setItem('bookListings', JSON.stringify(updatedListings));
        
        // Update local listings array
        this.listings = this.listings.filter(listing => listing.id !== listingId);
        
        // Refresh the display
        this.displayUserListings();
    }
    
    /**
     * Update a listing's status
     * @param {string} listingId - ID of the listing to update
     * @param {string} status - New status ('active', 'pending', or 'sold')
     */
    updateListingStatus(listingId, status) {
        // Get all listings from localStorage
        const allListings = JSON.parse(localStorage.getItem('bookListings')) || [];
        
        // Find the listing being updated
        const listingToUpdate = allListings.find(listing => listing.id === listingId);
        
        // Find and update the listing
        const updatedListings = allListings.map(listing => {
            if (listing.id === listingId) {
                return { ...listing, status };
            }
            return listing;
        });
        
        // Save back to localStorage
        localStorage.setItem('bookListings', JSON.stringify(updatedListings));
        
        // Update local listings array
        this.listings = this.listings.map(listing => {
            if (listing.id === listingId) {
                return { ...listing, status };
            }
            return listing;
        });
        
        // If book is marked as sold, trigger transaction creation
        if (status === 'sold' && listingToUpdate) {
            this.handleBookSold(listingToUpdate);
        }
        
        // Refresh the display
        this.displayUserListings();
    }

    /**
     * Handle when a book is marked as sold
     * @param {Object} listing - The book listing that was sold
     */
    handleBookSold(listing) {
        // Create sale data for transaction
        const saleData = {
            bookData: {
                id: listing.id,
                title: listing.title,
                author: listing.author,
                isbn: listing.isbn,
                condition: listing.condition,
                department: listing.department
            },
            type: listing['listing-type'] === 'swap' ? 'Swap' : 'Sale',
            price: parseFloat(listing.price) || 0,
            status: 'Completed',
            buyerId: 'pending', // In a real app, this would come from the actual buyer
            buyerName: 'Pending Buyer', // In a real app, this would be the actual buyer's name
            paymentMethod: 'Cash',
            meetingLocation: 'Campus',
            notes: `Book marked as sold from dashboard`
        };

        // Dispatch custom event for transaction creation
        const event = new CustomEvent('bookMarkedAsSold', {
            detail: saleData
        });
        document.dispatchEvent(event);

        // Show success message
        this.showSuccessMessage(`"${listing.title}" has been marked as sold and added to your transactions.`);
    }

    /**
     * Show a success message to the user
     * @param {string} message - Success message to display
     */
    showSuccessMessage(message) {
        // Create or get existing toast container
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
            `;
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});