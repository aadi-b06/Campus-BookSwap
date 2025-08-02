/**
 * Features Integration for Campus BookSwap
 * Initializes and integrates all new features into the application
 */

/**
 * Dynamically load a script
 * @param {string} url - Script URL to load
 * @param {Function} callback - Function to call when script is loaded
 */
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication system
    if (typeof initializeAuthSystem === 'function') {
        initializeAuthSystem();
    } else {
        loadScript('js/auth.js', function() {
            initializeAuthSystem();
        });
    }
    
    // Initialize all features
    initializeFeatures();
    
    // Load Tailwind CSS for mobile compatibility
    loadTailwindCSS();
});

/**
 * Initialize all new features
 */
function initializeFeatures() {
    // Initialize notification system (on all pages)
    initializeNotifications();
    
    // Initialize page-specific features
    const currentPage = getCurrentPage();
    
    switch(currentPage) {
        case 'index':
            // Homepage features
            break;
            
        case 'browse':
            // Browse page features
            initializeRatings();
            break;
            
        case 'sell':
            // Sell page features
            initializeCampusMap('exchange-map-container');
            break;
            
        case 'dashboard':
            // Dashboard page features
            initializeRatings();
            initializePaymentHistory();
            initializeAnalyticsDashboard();
            initializeSustainabilityDashboard();
            initializeForumSystem();
            break;
            
        case 'book-details':
            // Book details page features
            initializeRatings();
            initializePaymentGateway();
            break;
            
        case 'campus-map':
            // Campus map page features
            initializeCampusMap('campus-map-container');
            break;
            
        case 'notifications':
            // Notifications page features
            initializeNotificationsPage();
            break;
            
        case 'forum':
            // Forum page features
            initializeForumSystem();
            break;
            
        case 'sustainability':
            // Sustainability page features
            initializeSustainabilityDashboard();
            break;
            
        case 'analytics':
            // Analytics page features
            initializeAnalyticsDashboard();
            break;
    }
}

/**
 * Get the current page name based on URL
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (!filename || filename === '' || filename === 'index.html') {
        return 'index';
    }
    
    return filename.replace('.html', '');
}

/**
 * Initialize the notification system
 */
function initializeNotifications() {
    try {
        // Check if NotificationSystem class is available
        if (typeof NotificationSystem === 'undefined') {
            loadScript('js/notifications.js', () => {
                window.notificationSystem = new NotificationSystem();
            });
        } else {
            window.notificationSystem = new NotificationSystem();
        }
    } catch (error) {
        console.error('Failed to initialize notification system:', error);
    }
}

/**
 * Initialize the notifications page
 */
function initializeNotificationsPage() {
    try {
        // Check if NotificationSystem class is available
        if (typeof NotificationSystem === 'undefined') {
            loadScript('js/notifications.js', () => {
                const notificationSystem = new NotificationSystem();
                notificationSystem.generateNotificationsPage('notifications-container');
            });
        } else {
            const notificationSystem = new NotificationSystem();
            notificationSystem.generateNotificationsPage('notifications-container');
        }
    } catch (error) {
        console.error('Failed to initialize notifications page:', error);
    }
}

/**
 * Initialize the rating system
 */
function initializeRatings() {
    try {
        // Check if RatingSystem class is available
        if (typeof RatingSystem === 'undefined') {
            loadScript('js/ratings.js', () => {
                window.ratingSystem = new RatingSystem();
                setupRatingElements();
            });
        } else {
            window.ratingSystem = new RatingSystem();
            setupRatingElements();
        }
    } catch (error) {
        console.error('Failed to initialize rating system:', error);
    }
}

/**
 * Setup rating elements on the page
 */
function setupRatingElements() {
    // Find all rating containers that need to be initialized
    const bookRatingContainers = document.querySelectorAll('[data-rating-type="book"]');
    const sellerRatingContainers = document.querySelectorAll('[data-rating-type="seller"]');
    
    // Initialize book rating containers
    bookRatingContainers.forEach(container => {
        const bookId = container.dataset.id;
        const includeReview = container.dataset.review === 'true';
        
        // Generate rating input
        container.innerHTML = window.ratingSystem.generateRatingInput('book', bookId, includeReview);
    });
    
    // Initialize seller rating containers
    sellerRatingContainers.forEach(container => {
        const sellerId = container.dataset.id;
        const includeReview = container.dataset.review === 'true';
        
        // Generate rating input
        container.innerHTML = window.ratingSystem.generateRatingInput('seller', sellerId, includeReview);
    });
    
    // Find all average rating display containers
    const averageRatingContainers = document.querySelectorAll('[data-average-rating]');
    
    // Initialize average rating displays
    averageRatingContainers.forEach(container => {
        const type = container.dataset.type; // 'book' or 'seller'
        const id = container.dataset.id;
        
        // Generate average rating display
        container.innerHTML = window.ratingSystem.generateAverageRatingDisplay(type, id);
    });
    
    // Find all review containers
    const reviewContainers = document.querySelectorAll('[data-reviews]');
    
    // Initialize review displays
    reviewContainers.forEach(container => {
        const type = container.dataset.type; // 'book' or 'seller'
        const id = container.dataset.id;
        
        // Display reviews
        window.ratingSystem.displayReviews(type, id, container);
    });
}

/**
 * Initialize the campus map
 */
function initializeCampusMap(containerId) {
    try {
        // Check if CampusMap class is available
        if (typeof CampusMap === 'undefined') {
            loadScript('js/campus-map.js', () => {
                setupCampusMap(containerId);
            });
        } else {
            setupCampusMap(containerId);
        }
    } catch (error) {
        console.error('Failed to initialize campus map:', error);
    }
}

/**
 * Setup campus map
 */
function setupCampusMap(containerId) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;
    
    // Create map container structure
    mapContainer.innerHTML = `
        <div class="map-header">
            <h2 class="map-title">Campus Book Exchange Map</h2>
            <div class="map-actions">
                <button id="my-location-btn" class="btn-secondary">
                    <i class="fas fa-location-arrow"></i> My Location
                </button>
            </div>
        </div>
        <div class="map-content">
            <div class="map-sidebar">
                <div id="map-filters-container"></div>
                <div id="directions-panel" class="directions-panel"></div>
            </div>
            <div id="map-canvas"></div>
        </div>
    `;
    
    // Initialize the map
    window.campusMap = new CampusMap('map-canvas', {
        zoom: 16,
        mapTypeId: 'roadmap'
    });
    
    // Generate map filters
    window.campusMap.generateMapFilters('map-filters-container');
    
    // Add event listener to my location button
    const myLocationBtn = document.getElementById('my-location-btn');
    if (myLocationBtn) {
        myLocationBtn.addEventListener('click', () => {
            window.campusMap.getUserLocation();
        });
    }
}

/**
 * Initialize the payment gateway
 */
function initializePaymentGateway() {
    try {
        // Check if PaymentGateway class is available
        if (typeof PaymentGateway === 'undefined') {
            loadScript('js/payment.js', () => {
                setupPaymentGateway();
            });
        } else {
            setupPaymentGateway();
        }
    } catch (error) {
        console.error('Failed to initialize payment gateway:', error);
    }
}

/**
 * Setup payment gateway
 */
function setupPaymentGateway() {
    const paymentContainer = document.getElementById('payment-container');
    if (!paymentContainer) return;
    
    // Get book details from the page
    const bookDetails = getBookDetailsFromPage();
    
    // Initialize payment gateway
    window.paymentGateway = new PaymentGateway();
    
    // Generate payment form
    window.paymentGateway.generatePaymentForm(
        'payment-container',
        bookDetails.price,
        'USD', // or get from page
        bookDetails
    );
}

/**
 * Get book details from the current page
 */
function getBookDetailsFromPage() {
    // This function would extract book details from the current page
    // For demo purposes, we'll return dummy data
    return {
        id: getParameterByName('id') || 'book123',
        title: document.querySelector('.book-title')?.textContent || 'Introduction to Computer Science',
        author: document.querySelector('.book-author')?.textContent || 'John Smith',
        price: parseFloat(document.querySelector('.book-price')?.textContent || '45.99'),
        condition: document.querySelector('.book-condition')?.textContent || 'Good',
        seller: document.querySelector('.seller-name')?.textContent || 'Alice Johnson'
    };
}

/**
 * Initialize payment history on dashboard
 */
function initializePaymentHistory() {
    const paymentHistoryContainer = document.getElementById('payment-history-container');
    if (!paymentHistoryContainer) return;
    
    // Get payment history from localStorage or use dummy data
    const paymentHistory = getPaymentHistoryFromStorage() || getDummyPaymentHistory();
    
    // Generate payment history HTML
    const html = generatePaymentHistoryHTML(paymentHistory);
    
    // Set the HTML content
    paymentHistoryContainer.innerHTML = html;
}

/**
 * Get payment history from localStorage
 */
function getPaymentHistoryFromStorage() {
    const historyJson = localStorage.getItem('bookswap_payment_history');
    return historyJson ? JSON.parse(historyJson) : null;
}

/**
 * Get dummy payment history for demo purposes
 */
function getDummyPaymentHistory() {
    return [
        {
            id: 'pay_123456',
            date: '2023-04-15T14:30:00Z',
            amount: 45.99,
            currency: 'USD',
            status: 'completed',
            type: 'purchase',
            method: 'credit_card',
            book: {
                id: 'book123',
                title: 'Introduction to Computer Science',
                author: 'John Smith'
            },
            seller: {
                id: 'user456',
                name: 'Alice Johnson'
            }
        },
        {
            id: 'pay_123457',
            date: '2023-03-22T10:15:00Z',
            amount: 32.50,
            currency: 'USD',
            status: 'completed',
            type: 'sale',
            method: 'paypal',
            book: {
                id: 'book456',
                title: 'Calculus: Early Transcendentals',
                author: 'James Stewart'
            },
            buyer: {
                id: 'user789',
                name: 'Bob Williams'
            }
        },
        {
            id: 'pay_123458',
            date: '2023-02-10T16:45:00Z',
            amount: 28.75,
            currency: 'USD',
            status: 'completed',
            type: 'purchase',
            method: 'credit_card',
            book: {
                id: 'book789',
                title: 'Organic Chemistry',
                author: 'Paula Bruice'
            },
            seller: {
                id: 'user101',
                name: 'Charlie Brown'
            }
        }
    ];
}

/**
 * Generate payment history HTML
 */
function generatePaymentHistoryHTML(paymentHistory) {
    if (!paymentHistory || paymentHistory.length === 0) {
        return '<div class="empty-history">No payment history yet</div>';
    }
    
    let html = `
        <div class="payment-history">
            <h3>Payment History</h3>
            <div class="payment-list">
    `;
    
    // Sort by date (newest first)
    const sortedHistory = [...paymentHistory].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Add each payment
    sortedHistory.forEach(payment => {
        const date = new Date(payment.date);
        const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        
        html += `
            <div class="payment-item">
                <div class="payment-header">
                    <div class="payment-info">
                        <span class="payment-type ${payment.type}">${payment.type === 'purchase' ? 'Purchase' : 'Sale'}</span>
                        <span class="payment-date">${formattedDate}</span>
                    </div>
                    <div class="payment-amount">
                        <span class="amount">${payment.currency} ${payment.amount.toFixed(2)}</span>
                        <span class="status ${payment.status}">${payment.status}</span>
                    </div>
                </div>
                <div class="payment-details">
                    <div class="book-info">
                        <span class="book-title">${payment.book.title}</span>
                        <span class="book-author">by ${payment.book.author}</span>
                    </div>
                    <div class="user-info">
                        ${payment.type === 'purchase' 
                            ? `<span class="seller-info">Seller: ${payment.seller.name}</span>` 
                            : `<span class="buyer-info">Buyer: ${payment.buyer.name}</span>`
                        }
                        <span class="payment-method">via ${formatPaymentMethod(payment.method)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Format payment method for display
 */
function formatPaymentMethod(method) {
    switch (method) {
        case 'credit_card':
            return 'Credit Card';
        case 'paypal':
            return 'PayPal';
        case 'razorpay':
            return 'Razorpay';
        default:
            return method;
    }
}

/**
 * Helper function to get URL parameter by name
 */
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Helper function to load a script dynamically
 */
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
}

/**
 * Initialize the forum system
 */
function initializeForumSystem() {
    try {
        // Check if ForumSystem class is available
        if (typeof ForumSystem === 'undefined') {
            loadScript('js/forum.js', () => {
                window.forumSystem = new ForumSystem();
                
                // If we're on the forum tab in dashboard, generate the forum HTML
                const forumContainer = document.getElementById('forum-container');
                if (forumContainer) {
                    window.forumSystem.generateForumHTML('forum-container');
                }
            });
        } else {
            window.forumSystem = new ForumSystem();
            
            // If we're on the forum tab in dashboard, generate the forum HTML
            const forumContainer = document.getElementById('forum-container');
            if (forumContainer) {
                window.forumSystem.generateForumHTML('forum-container');
            }
        }
    } catch (error) {
        console.error('Failed to initialize forum system:', error);
    }
}

/**
 * Initialize the sustainability dashboard
 */
function initializeSustainabilityDashboard() {
    try {
        // Check if SustainabilityDashboard class is available
        if (typeof SustainabilityDashboard === 'undefined') {
            loadScript('js/sustainability.js', () => {
                window.sustainabilityDashboard = new SustainabilityDashboard();
                
                // If we're on the sustainability tab in dashboard, generate the dashboard HTML
                const sustainabilityContainer = document.getElementById('sustainability-container');
                if (sustainabilityContainer) {
                    window.sustainabilityDashboard.generateDashboardHTML('sustainability-container');
                }
            });
        } else {
            window.sustainabilityDashboard = new SustainabilityDashboard();
            
            // If we're on the sustainability tab in dashboard, generate the dashboard HTML
            const sustainabilityContainer = document.getElementById('sustainability-container');
            if (sustainabilityContainer) {
                window.sustainabilityDashboard.generateDashboardHTML('sustainability-container');
            }
        }
    } catch (error) {
        console.error('Failed to initialize sustainability dashboard:', error);
    }
}

/**
 * Initialize campus map dashboard
 */
function initializeCampusMapDashboard() {
    try {
        // Check if CampusMapDashboard class is available
        if (typeof CampusMapDashboard === 'undefined') {
            loadScript('js/campus-map-dashboard.js', () => {
                if (window.campusMapDashboard) {
                    window.campusMapDashboard.generateDashboardHTML('campus-map-container');
                }
            });
        } else {
            if (window.campusMapDashboard) {
                window.campusMapDashboard.generateDashboardHTML('campus-map-container');
            }
        }
    } catch (error) {
        console.error('Failed to initialize campus map dashboard:', error);
    }
}

/**
 * Initialize the user analytics dashboard
 */
function initializeAnalyticsDashboard() {
    try {
        // Check if UserAnalyticsDashboard class is available
        if (typeof UserAnalyticsDashboard === 'undefined') {
            loadScript('js/analytics.js', () => {
                window.analyticsDashboard = new UserAnalyticsDashboard();
                
                // If we're on the analytics tab in dashboard, generate the dashboard HTML
                const analyticsContainer = document.getElementById('analytics-container');
                if (analyticsContainer) {
                    window.analyticsDashboard.generateDashboardHTML('analytics-container');
                }
            });
        } else {
            window.analyticsDashboard = new UserAnalyticsDashboard();
            
            // If we're on the analytics tab in dashboard, generate the dashboard HTML
            const analyticsContainer = document.getElementById('analytics-container');
            if (analyticsContainer) {
                window.analyticsDashboard.generateDashboardHTML('analytics-container');
            }
        }
    } catch (error) {
        console.error('Failed to initialize analytics dashboard:', error);
    }
}

/**
 * Load Tailwind CSS for mobile compatibility
 */
function loadTailwindCSS() {
    // Check if Tailwind is already loaded
    if (document.querySelector('link[href*="tailwind"]')) {
        return;
    }
    
    // Create link element for Tailwind CSS CDN
    const tailwindLink = document.createElement('link');
    tailwindLink.rel = 'stylesheet';
    tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(tailwindLink);
    
    // Load dashboard features CSS
    const dashboardFeaturesLink = document.createElement('link');
    dashboardFeaturesLink.rel = 'stylesheet';
    dashboardFeaturesLink.href = 'css/dashboard-features.css';
    document.head.appendChild(dashboardFeaturesLink);
    
    // Add responsive meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0';
        document.head.appendChild(viewportMeta);
    }
}