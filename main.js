document.addEventListener('DOMContentLoaded', () => {
    console.log('Campus BookSwap Platform Loaded');
    
    // Initialize components
    initializeSearchBar();
    initializeBookFilters();
    initializeFormValidation();
    loadFeaturedBooks();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Load external scripts
    loadExternalScripts();
});

// Authentication Status Check
function checkAuthStatus() {
    // This would normally check with a backend service
    // For demo purposes, we'll check localStorage
    const user = localStorage.getItem('currentUser');
    
    if (user) {
        // User is logged in
        const userData = JSON.parse(user);
        updateUIForLoggedInUser(userData);
    } else {
        // User is not logged in
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(userData) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'My Account';
        loginBtn.href = 'dashboard.html';
    }
    
    // Update auth buttons section
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        const loginLink = authButtons.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.textContent = userData.name || 'My Account';
            loginLink.href = 'dashboard.html';
        }
    }
    
    // Show user-specific elements
    const userElements = document.querySelectorAll('.user-only');
    userElements.forEach(el => el.style.display = 'block');
    
    // Hide guest-only elements
    const guestElements = document.querySelectorAll('.guest-only');
    guestElements.forEach(el => el.style.display = 'none');
}

function updateUIForLoggedOutUser() {
    // Show guest-only elements
    const guestElements = document.querySelectorAll('.guest-only');
    guestElements.forEach(el => el.style.display = 'block');
    
    // Hide user-specific elements
    const userElements = document.querySelectorAll('.user-only');
    userElements.forEach(el => el.style.display = 'none');
}

// Search Functionality
function initializeSearchBar() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = searchForm.querySelector('input').value.trim();
        
        if (searchInput) {
            // In a real app, this would query the backend
            // For demo, we'll redirect to search results page with query parameter
            window.location.href = `browse.html?search=${encodeURIComponent(searchInput)}`;
        }
    });
}

// Book Filtering System
function initializeBookFilters() {
    const filterForm = document.querySelector('.filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect filter values
        const filters = {
            department: filterForm.querySelector('#department').value,
            condition: filterForm.querySelector('#condition').value,
            priceMin: filterForm.querySelector('#price-min').value,
            priceMax: filterForm.querySelector('#price-max').value,
            format: filterForm.querySelector('#format').value
        };
        
        // Apply filters (in a real app, this would query the backend)
        applyFilters(filters);
    });
    
    // Reset filters button
    const resetBtn = filterForm.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filterForm.reset();
            // Reset to show all books
            applyFilters({});
        });
    }
}

function applyFilters(filters) {
    // In a real app, this would query the backend and update the UI
    console.log('Applying filters:', filters);
    
    // For demo purposes, we'll simulate filtering by hiding/showing book cards
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        // In a real implementation, we would check each filter against the book's data
        // For demo, we'll just show all cards
        card.style.display = 'block';
    });
    
    // Update URL with filter parameters for bookmarking/sharing
    const url = new URL(window.location.href);
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.replaceState({}, '', url);
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        if (form.classList.contains('needs-validation')) {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                form.classList.add('was-validated');
            });
        }
    });
    
    // Special handling for book listing form
    const listingForm = document.querySelector('#book-listing-form');
    if (listingForm) {
        initializeListingForm(listingForm);
    }
    
    // Special handling for registration form
    const registrationForm = document.querySelector('#registration-form');
    if (registrationForm) {
        initializeRegistrationForm(registrationForm);
    }
}

function initializeListingForm(form) {
    // Handle image preview
    const imageInput = form.querySelector('#book-image');
    const imagePreview = form.querySelector('.image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Book Cover Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // ISBN lookup functionality
    const isbnInput = form.querySelector('#isbn');
    const lookupBtn = form.querySelector('.isbn-lookup');
    
    if (isbnInput && lookupBtn) {
        lookupBtn.addEventListener('click', () => {
            const isbn = isbnInput.value.trim();
            if (isbn) {
                // In a real app, this would query a book API
                console.log('Looking up ISBN:', isbn);
                // Simulate a successful lookup
                setTimeout(() => {
                    form.querySelector('#title').value = 'Sample Book Title';
                    form.querySelector('#author').value = 'Sample Author';
                    alert('Book information retrieved successfully!');
                }, 1000);
            }
        });
    }
}

function initializeRegistrationForm(form) {
    // Email domain validation for university emails
    const emailInput = form.querySelector('#email');
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !email.endsWith('.edu')) {
                emailInput.setCustomValidity('Please use a university email (.edu)');
            } else {
                emailInput.setCustomValidity('');
            }
        });
    }
    
    // Password strength validation
    const passwordInput = form.querySelector('#password');
    const passwordStrength = form.querySelector('.password-strength');
    
    if (passwordInput && passwordStrength) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 0;
            
            if (password.length >= 8) strength += 1;
            if (password.match(/[A-Z]/)) strength += 1;
            if (password.match(/[0-9]/)) strength += 1;
            if (password.match(/[^A-Za-z0-9]/)) strength += 1;
            
            const strengthText = ['Weak', 'Fair', 'Good', 'Strong'];
            const strengthClass = ['text-danger', 'text-warning', 'text-info', 'text-success'];
            
            passwordStrength.textContent = strengthText[strength - 1] || '';
            passwordStrength.className = 'password-strength ' + (strengthClass[strength - 1] || '');
        });
    }
}

// Load Featured Books
function loadFeaturedBooks() {
    const featuredBooksContainer = document.querySelector('.book-cards');
    if (!featuredBooksContainer) return;
    
    // In a real app, this would fetch from a backend API
    // For demo purposes, we'll use the books already in the HTML
    console.log('Featured books loaded');
    
    // If we wanted to load books dynamically, we would do something like this:
    /*
    fetch('/api/books/featured')
        .then(response => response.json())
        .then(books => {
            featuredBooksContainer.innerHTML = '';
            
            books.forEach(book => {
                const bookCard = createBookCard(book);
                featuredBooksContainer.appendChild(bookCard);
            });
        })
        .catch(error => {
            console.error('Error loading featured books:', error);
        });
    */
}

function createBookCard(book) {
    // Create a book card element from book data
    const card = document.createElement('div');
    card.className = 'book-card';
    
    card.innerHTML = `
        <div class="book-image">
            <img src="${book.imageUrl || 'images/book-placeholder.jpg'}" alt="${book.title}">
        </div>
        <div class="book-info">
            <h3>${book.title}</h3>
            <p class="author">By ${book.author}</p>
            <p class="course">${book.course || ''}</p>
            <div class="book-meta">
                <span class="price">$${book.price}</span>
                <span class="condition">${book.condition}</span>
            </div>
            <a href="book-details.html?id=${book.id}" class="btn view-btn">View Details</a>
        </div>
    `;
    
    return card;
}

// Messaging System (for a real implementation, this would use WebSockets)
class MessagingSystem {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('messages')) || {};
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    sendMessage(recipientId, messageText) {
        if (!this.currentUser) return false;
        
        const messageId = Date.now();
        const message = {
            id: messageId,
            senderId: this.currentUser.id,
            recipientId: recipientId,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Add to conversation
        const conversationId = this.getConversationId(this.currentUser.id, recipientId);
        if (!this.messages[conversationId]) {
            this.messages[conversationId] = [];
        }
        
        this.messages[conversationId].push(message);
        this.saveMessages();
        
        return true;
    }
    
    getConversations() {
        if (!this.currentUser) return [];
        
        const conversations = [];
        
        for (const conversationId in this.messages) {
            if (conversationId.includes(this.currentUser.id)) {
                const otherUserId = conversationId.replace(this.currentUser.id, '').replace('-', '');
                const lastMessage = this.messages[conversationId][this.messages[conversationId].length - 1];
                
                conversations.push({
                    id: conversationId,
                    otherUserId: otherUserId,
                    lastMessage: lastMessage
                });
            }
        }
        
        return conversations;
    }
    
    getMessages(otherUserId) {
        if (!this.currentUser) return [];
        
        const conversationId = this.getConversationId(this.currentUser.id, otherUserId);
        return this.messages[conversationId] || [];
    }
    
    markAsRead(conversationId) {
        if (this.messages[conversationId]) {
            this.messages[conversationId].forEach(message => {
                if (message.recipientId === this.currentUser.id) {
                    message.read = true;
                }
            });
            
            this.saveMessages();
        }
    }
    
    getConversationId(userId1, userId2) {
        // Create a consistent conversation ID regardless of who initiated
        return [userId1, userId2].sort().join('-');
    }
    
    saveMessages() {
        localStorage.setItem('messages', JSON.stringify(this.messages));
    }
}

// Initialize messaging if on message page
const messagePage = document.querySelector('.messaging-page');
if (messagePage) {
    const messaging = new MessagingSystem();
    
    // Load conversations
    const conversationsList = document.querySelector('.conversations-list');
    if (conversationsList) {
        const conversations = messaging.getConversations();
        
        conversations.forEach(conversation => {
            // In a real app, we would fetch user details from the backend
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item';
            conversationItem.dataset.conversationId = conversation.id;
            
            conversationItem.innerHTML = `
                <div class="user-avatar"></div>
                <div class="conversation-preview">
                    <h4>User ${conversation.otherUserId}</h4>
                    <p>${conversation.lastMessage.text.substring(0, 30)}${conversation.lastMessage.text.length > 30 ? '...' : ''}</p>
                </div>
            `;
            
            conversationsList.appendChild(conversationItem);
        });
    }
}

/**
 * Load external feature scripts
 */
function loadExternalScripts() {
    // Check if features.js is already loaded
    if (document.querySelector('script[src="js/features.js"]')) {
        return;
    }
    
    // Add features.css
    if (!document.querySelector('link[href="css/features.css"]')) {
        const featuresCss = document.createElement('link');
        featuresCss.rel = 'stylesheet';
        featuresCss.href = 'css/features.css';
        document.head.appendChild(featuresCss);
    }
    
    // Add features.js
    const featuresScript = document.createElement('script');
    featuresScript.src = 'js/features.js';
    featuresScript.async = true;
    document.body.appendChild(featuresScript);
}