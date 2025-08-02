/**
 * Rating and Review System for Campus BookSwap
 * Allows users to rate books and sellers, and leave detailed reviews
 */

class RatingSystem {
    constructor() {
        this.ratings = this.loadRatingsFromStorage() || {
            books: {},  // Organized by book ID
            sellers: {} // Organized by seller ID
        };
        
        this.currentUser = this.getCurrentUser();
        this.initEventListeners();
    }
    
    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    /**
     * Load ratings from localStorage
     */
    loadRatingsFromStorage() {
        const ratingsJson = localStorage.getItem('bookswap_ratings');
        return ratingsJson ? JSON.parse(ratingsJson) : null;
    }
    
    /**
     * Save ratings to localStorage
     */
    saveRatingsToStorage() {
        localStorage.setItem('bookswap_ratings', JSON.stringify(this.ratings));
    }
    
    /**
     * Initialize event listeners for rating elements
     */
    initEventListeners() {
        // Listen for rating stars click events
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('rating-star')) {
                this.handleStarClick(event);
            }
            
            // Submit review form
            if (event.target.id === 'submit-review-btn') {
                this.handleReviewSubmit(event);
            }
        });
    }
    
    /**
     * Handle star rating click events
     */
    handleStarClick(event) {
        const star = event.target;
        const ratingContainer = star.closest('.rating-container');
        if (!ratingContainer) return;
        
        const stars = ratingContainer.querySelectorAll('.rating-star');
        const ratingValue = parseInt(star.dataset.value);
        const ratingType = ratingContainer.dataset.type; // 'book' or 'seller'
        const itemId = ratingContainer.dataset.id;
        
        // Update visual state of stars
        stars.forEach(s => {
            if (parseInt(s.dataset.value) <= ratingValue) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        
        // Store the selected rating value in the container
        ratingContainer.dataset.rating = ratingValue;
        
        // Update rating display if exists
        const ratingDisplay = ratingContainer.querySelector('.rating-value');
        if (ratingDisplay) {
            ratingDisplay.textContent = ratingValue;
        }
        
        // If this is a quick rating (without review), save it immediately
        if (ratingContainer.classList.contains('quick-rating')) {
            this.saveRating(ratingType, itemId, ratingValue);
        }
    }
    
    /**
     * Handle review form submission
     */
    handleReviewSubmit(event) {
        event.preventDefault();
        
        const reviewForm = event.target.closest('form');
        if (!reviewForm) return;
        
        const ratingContainer = reviewForm.querySelector('.rating-container');
        if (!ratingContainer) return;
        
        const ratingType = ratingContainer.dataset.type; // 'book' or 'seller'
        const itemId = ratingContainer.dataset.id;
        const ratingValue = parseInt(ratingContainer.dataset.rating || '0');
        const reviewText = reviewForm.querySelector('textarea').value.trim();
        
        // Validate input
        if (ratingValue === 0) {
            this.showError(reviewForm, 'Please select a rating');
            return;
        }
        
        if (reviewText.length < 10) {
            this.showError(reviewForm, 'Please write a more detailed review (at least 10 characters)');
            return;
        }
        
        // Save the rating and review
        this.saveReview(ratingType, itemId, ratingValue, reviewText);
        
        // Reset the form
        reviewForm.reset();
        const stars = ratingContainer.querySelectorAll('.rating-star');
        stars.forEach(s => s.classList.remove('active'));
        ratingContainer.dataset.rating = '0';
        
        // Show success message
        this.showSuccess(reviewForm, 'Your review has been submitted successfully!');
        
        // Update the reviews display if it exists on the page
        this.displayReviews(ratingType, itemId);
    }
    
    /**
     * Save a rating without a review
     */
    saveRating(type, id, rating) {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return false;
        }
        
        const userId = this.currentUser.email;
        const timestamp = new Date().toISOString();
        
        // Initialize if needed
        if (!this.ratings[type + 's'][id]) {
            this.ratings[type + 's'][id] = {
                ratings: {},
                reviews: {}
            };
        }
        
        // Save the rating
        this.ratings[type + 's'][id].ratings[userId] = {
            rating: rating,
            timestamp: timestamp
        };
        
        // Save to storage
        this.saveRatingsToStorage();
        
        // Update average rating display if it exists
        this.updateAverageRatingDisplay(type, id);
        
        return true;
    }
    
    /**
     * Save a rating with a review
     */
    saveReview(type, id, rating, reviewText) {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return false;
        }
        
        // First save the rating
        this.saveRating(type, id, rating);
        
        const userId = this.currentUser.email;
        const timestamp = new Date().toISOString();
        const userName = this.currentUser.name || 'Anonymous';
        
        // Save the review
        this.ratings[type + 's'][id].reviews[userId] = {
            rating: rating,
            review: reviewText,
            userName: userName,
            timestamp: timestamp
        };
        
        // Save to storage
        this.saveRatingsToStorage();
        
        return true;
    }
    
    /**
     * Calculate the average rating for an item
     */
    calculateAverageRating(type, id) {
        const item = this.ratings[type + 's'][id];
        if (!item || !item.ratings || Object.keys(item.ratings).length === 0) {
            return 0;
        }
        
        const ratings = Object.values(item.ratings).map(r => r.rating);
        const sum = ratings.reduce((total, rating) => total + rating, 0);
        return sum / ratings.length;
    }
    
    /**
     * Update the average rating display for an item
     */
    updateAverageRatingDisplay(type, id) {
        const averageRating = this.calculateAverageRating(type, id);
        const ratingCount = this.getRatingCount(type, id);
        
        // Find all average rating displays for this item
        const displays = document.querySelectorAll(`.average-rating[data-type="${type}"][data-id="${id}"]`);
        
        displays.forEach(display => {
            const starsContainer = display.querySelector('.stars-container');
            const ratingValue = display.querySelector('.rating-value');
            const ratingCountElement = display.querySelector('.rating-count');
            
            if (starsContainer) {
                this.renderStars(starsContainer, averageRating);
            }
            
            if (ratingValue) {
                ratingValue.textContent = averageRating.toFixed(1);
            }
            
            if (ratingCountElement) {
                ratingCountElement.textContent = `(${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})`;
            }
        });
    }
    
    /**
     * Get the number of ratings for an item
     */
    getRatingCount(type, id) {
        const item = this.ratings[type + 's'][id];
        if (!item || !item.ratings) return 0;
        
        return Object.keys(item.ratings).length;
    }
    
    /**
     * Get the number of reviews for an item
     */
    getReviewCount(type, id) {
        const item = this.ratings[type + 's'][id];
        if (!item || !item.reviews) return 0;
        
        return Object.keys(item.reviews).length;
    }
    
    /**
     * Render star icons based on a rating value
     */
    renderStars(container, rating) {
        container.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.classList.add('fas', 'fa-star');
            
            if (i <= Math.floor(rating)) {
                star.classList.add('full');
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                star.classList.add('half');
            } else {
                star.classList.add('empty');
            }
            
            container.appendChild(star);
        }
    }
    
    /**
     * Display reviews for an item
     */
    displayReviews(type, id, container = null) {
        // If no container is provided, try to find it on the page
        if (!container) {
            container = document.querySelector(`.reviews-container[data-type="${type}"][data-id="${id}"]`);
            if (!container) return;
        }
        
        const item = this.ratings[type + 's'][id];
        if (!item || !item.reviews || Object.keys(item.reviews).length === 0) {
            container.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to leave a review!</p>';
            return;
        }
        
        // Sort reviews by timestamp (newest first)
        const reviews = Object.values(item.reviews).sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Clear the container
        container.innerHTML = '';
        
        // Add each review
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review-item');
            
            const date = new Date(review.timestamp);
            const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${review.userName}</span>
                        <span class="review-date">${formattedDate}</span>
                    </div>
                    <div class="review-rating">
                        ${this.getStarIcons(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.review}</p>
                </div>
            `;
            
            container.appendChild(reviewElement);
        });
    }
    
    /**
     * Get HTML for star icons based on a rating value
     */
    getStarIcons(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star full"></i>';
            } else {
                stars += '<i class="fas fa-star empty"></i>';
            }
        }
        return stars;
    }
    
    /**
     * Generate HTML for a rating input
     */
    generateRatingInput(type, id, includeReview = false) {
        const html = `
            <div class="rating-system">
                <div class="rating-container ${includeReview ? '' : 'quick-rating'}" data-type="${type}" data-id="${id}" data-rating="0">
                    <div class="rating-stars">
                        <i class="rating-star fas fa-star" data-value="1"></i>
                        <i class="rating-star fas fa-star" data-value="2"></i>
                        <i class="rating-star fas fa-star" data-value="3"></i>
                        <i class="rating-star fas fa-star" data-value="4"></i>
                        <i class="rating-star fas fa-star" data-value="5"></i>
                    </div>
                    <span class="rating-label">Rate this ${type}</span>
                </div>
                ${includeReview ? this.generateReviewForm() : ''}
            </div>
        `;
        
        return html;
    }
    
    /**
     * Generate HTML for a review form
     */
    generateReviewForm() {
        return `
            <form class="review-form">
                <div class="form-group">
                    <label for="review-text">Write your review:</label>
                    <textarea id="review-text" rows="4" placeholder="Share your experience with this item..."></textarea>
                </div>
                <div class="form-group">
                    <button type="button" id="submit-review-btn" class="btn-primary">Submit Review</button>
                </div>
                <div class="form-message"></div>
            </form>
        `;
    }
    
    /**
     * Generate HTML for displaying the average rating
     */
    generateAverageRatingDisplay(type, id) {
        const averageRating = this.calculateAverageRating(type, id);
        const ratingCount = this.getRatingCount(type, id);
        
        const html = `
            <div class="average-rating" data-type="${type}" data-id="${id}">
                <div class="stars-container">
                    ${this.getStarIcons(averageRating)}
                </div>
                <div class="rating-info">
                    <span class="rating-value">${averageRating.toFixed(1)}</span>
                    <span class="rating-count">(${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})</span>
                </div>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Show an error message in a form
     */
    showError(form, message) {
        const messageElement = form.querySelector('.form-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.add('error');
            messageElement.classList.remove('success');
            
            // Clear the message after 3 seconds
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.classList.remove('error');
            }, 3000);
        }
    }
    
    /**
     * Show a success message in a form
     */
    showSuccess(form, message) {
        const messageElement = form.querySelector('.form-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.add('success');
            messageElement.classList.remove('error');
            
            // Clear the message after 3 seconds
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.classList.remove('success');
            }, 3000);
        }
    }
    
    /**
     * Show a login prompt for unauthenticated users
     */
    showLoginPrompt() {
        const modal = document.createElement('div');
        modal.classList.add('login-prompt-modal');
        
        modal.innerHTML = `
            <div class="login-prompt-content">
                <h3>Login Required</h3>
                <p>You need to be logged in to rate or review items.</p>
                <div class="login-prompt-buttons">
                    <a href="login.html" class="btn-primary">Login</a>
                    <button class="btn-secondary close-modal">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener to close the modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        return false;
    }
}

// Export the RatingSystem class
window.RatingSystem = RatingSystem;