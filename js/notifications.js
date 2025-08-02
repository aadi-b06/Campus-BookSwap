/**
 * Notification System for Campus BookSwap
 * Alerts users about new book listings, messages, and transaction updates
 */

class NotificationSystem {
    constructor() {
        this.notifications = this.loadNotificationsFromStorage() || [];
        this.unreadCount = this.getUnreadCount();
        this.currentUser = this.getCurrentUser();
        this.notificationTypes = {
            NEW_LISTING: 'new_listing',
            MESSAGE: 'message',
            TRANSACTION: 'transaction',
            REVIEW: 'review',
            SYSTEM: 'system'
        };
        
        this.initNotificationSystem();
    }
    
    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    /**
     * Load notifications from localStorage
     */
    loadNotificationsFromStorage() {
        const notificationsJson = localStorage.getItem('bookswap_notifications');
        return notificationsJson ? JSON.parse(notificationsJson) : null;
    }
    
    /**
     * Save notifications to localStorage
     */
    saveNotificationsToStorage() {
        localStorage.setItem('bookswap_notifications', JSON.stringify(this.notifications));
    }
    
    /**
     * Initialize the notification system
     */
    initNotificationSystem() {
        // Create notification elements if they don't exist
        this.createNotificationElements();
        
        // Update notification badge
        this.updateNotificationBadge();
        
        // Add event listeners
        this.addEventListeners();
        
        // Check for new notifications periodically (simulating server polling)
        this.startNotificationPolling();
    }
    
    /**
     * Create notification elements in the DOM
     */
    createNotificationElements() {
        // Check if notification elements already exist
        if (document.querySelector('.notification-icon')) {
            return;
        }
        
        // Find the navbar
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) {
            console.error('Navbar not found');
            return;
        }
        
        // Create notification icon and dropdown
        const notificationLi = document.createElement('li');
        notificationLi.classList.add('nav-item', 'dropdown', 'notification-dropdown');
        
        notificationLi.innerHTML = `
            <a class="nav-link dropdown-toggle notification-icon" href="#" id="notificationDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">0</span>
            </a>
            <div class="dropdown-menu notification-menu" aria-labelledby="notificationDropdown">
                <div class="notification-header">
                    <h6>Notifications</h6>
                    <button class="mark-all-read">Mark all as read</button>
                </div>
                <div class="notification-list">
                    <div class="empty-notification">No notifications yet</div>
                </div>
                <div class="notification-footer">
                    <a href="notifications.html">View all notifications</a>
                </div>
            </div>
        `;
        
        // Insert before the last item (assuming the last item is the user profile or login)
        navbar.insertBefore(notificationLi, navbar.lastElementChild);
    }
    
    /**
     * Add event listeners for notification interactions
     */
    addEventListeners() {
        // Notification icon click
        const notificationIcon = document.querySelector('.notification-icon');
        if (notificationIcon) {
            // Check if we're on the dashboard page
            if (window.location.href.includes('dashboard.html')) {
                notificationIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'notifications.html';
                });
            } else {
                notificationIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleNotificationDropdown();
                });
            }
        }
        
        // Mark all as read button
        const markAllReadBtn = document.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.notification-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                this.closeNotificationDropdown();
            }
        });
    }
    
    /**
     * Toggle notification dropdown visibility
     */
    toggleNotificationDropdown() {
        const dropdown = document.querySelector('.notification-menu');
        if (dropdown) {
            dropdown.classList.toggle('show');
            
            // If opening the dropdown, mark notifications as seen
            if (dropdown.classList.contains('show')) {
                this.markNotificationsAsSeen();
            }
        }
    }
    
    /**
     * Close notification dropdown
     */
    closeNotificationDropdown() {
        const dropdown = document.querySelector('.notification-menu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
    
    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        if (this.notifications.length === 0) return;
        
        // Update all notifications to read
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        // Update storage
        this.saveNotificationsToStorage();
        
        // Update UI
        this.updateNotificationBadge();
        this.renderNotifications();
    }
    
    /**
     * Mark notifications as seen (but not necessarily read)
     */
    markNotificationsAsSeen() {
        if (this.notifications.length === 0) return;
        
        // Update all notifications to seen
        this.notifications.forEach(notification => {
            notification.seen = true;
        });
        
        // Update storage
        this.saveNotificationsToStorage();
        
        // Update UI
        this.updateNotificationBadge();
    }
    
    /**
     * Get count of unread notifications
     */
    getUnreadCount() {
        if (!this.notifications || this.notifications.length === 0) return 0;
        
        return this.notifications.filter(notification => !notification.read).length;
    }
    
    /**
     * Update notification badge with unread count
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;
        
        this.unreadCount = this.getUnreadCount();
        
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    /**
     * Render notifications in the dropdown
     */
    renderNotifications() {
        const notificationList = document.querySelector('.notification-list');
        if (!notificationList) return;
        
        if (!this.notifications || this.notifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-notification">No notifications yet</div>';
            return;
        }
        
        // Clear the list
        notificationList.innerHTML = '';
        
        // Sort notifications by date (newest first)
        const sortedNotifications = [...this.notifications].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Take only the most recent 5 for the dropdown
        const recentNotifications = sortedNotifications.slice(0, 5);
        
        // Add each notification
        recentNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.classList.add('notification-item');
            if (!notification.read) {
                notificationItem.classList.add('unread');
            }
            
            // Format the timestamp
            const timestamp = this.formatTimestamp(notification.timestamp);
            
            // Get icon based on notification type
            const icon = this.getNotificationIcon(notification.type);
            
            notificationItem.innerHTML = `
                <div class="notification-icon-small">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-text">${notification.message}</div>
                    <div class="notification-time">${timestamp}</div>
                </div>
                <div class="notification-actions">
                    <button class="mark-read" data-id="${notification.id}" title="Mark as read">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
            
            notificationList.appendChild(notificationItem);
            
            // Add event listener to mark as read button
            const markReadBtn = notificationItem.querySelector('.mark-read');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const notificationId = e.currentTarget.dataset.id;
                    this.markAsRead(notificationId);
                });
            }
            
            // Add event listener to notification item
            notificationItem.addEventListener('click', () => {
                this.handleNotificationClick(notification);
            });
        });
    }
    
    /**
     * Format timestamp to relative time (e.g., "2 hours ago")
     */
    formatTimestamp(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffMs = now - notificationTime;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else {
            return notificationTime.toLocaleDateString();
        }
    }
    
    /**
     * Get icon class based on notification type
     */
    getNotificationIcon(type) {
        switch (type) {
            case this.notificationTypes.NEW_LISTING:
                return 'fas fa-book';
            case this.notificationTypes.MESSAGE:
                return 'fas fa-envelope';
            case this.notificationTypes.TRANSACTION:
                return 'fas fa-money-bill-wave';
            case this.notificationTypes.REVIEW:
                return 'fas fa-star';
            case this.notificationTypes.SYSTEM:
                return 'fas fa-bell';
            default:
                return 'fas fa-bell';
        }
    }
    
    /**
     * Mark a specific notification as read
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            
            // Update storage
            this.saveNotificationsToStorage();
            
            // Update UI
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }
    
    /**
     * Handle click on a notification
     */
    handleNotificationClick(notification) {
        // Mark as read
        this.markAsRead(notification.id);
        
        // Navigate to the relevant page based on notification type and data
        if (notification.link) {
            window.location.href = notification.link;
        } else {
            // Default actions based on type
            switch (notification.type) {
                case this.notificationTypes.NEW_LISTING:
                    window.location.href = `browse.html?book=${notification.data.bookId}`;
                    break;
                case this.notificationTypes.MESSAGE:
                    window.location.href = `messages.html?conversation=${notification.data.conversationId}`;
                    break;
                case this.notificationTypes.TRANSACTION:
                    window.location.href = `dashboard.html?tab=transactions`;
                    break;
                case this.notificationTypes.REVIEW:
                    window.location.href = `dashboard.html?tab=reviews`;
                    break;
                default:
                    // Close the dropdown if no specific action
                    this.closeNotificationDropdown();
            }
        }
    }
    
    /**
     * Add a new notification
     */
    addNotification(notification) {
        if (!this.currentUser) return false;
        
        // Generate a unique ID
        const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Create notification object
        const newNotification = {
            id: id,
            type: notification.type,
            message: notification.message,
            timestamp: new Date().toISOString(),
            read: false,
            seen: false,
            data: notification.data || {},
            link: notification.link || null
        };
        
        // Add to notifications array
        this.notifications.unshift(newNotification);
        
        // Save to storage
        this.saveNotificationsToStorage();
        
        // Update UI
        this.updateNotificationBadge();
        this.renderNotifications();
        
        // Show toast notification
        this.showToastNotification(newNotification);
        
        return true;
    }
    
    /**
     * Show a toast notification
     */
    showToastNotification(notification) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.classList.add('toast-container');
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.classList.add('toast-notification');
        
        // Get icon based on notification type
        const icon = this.getNotificationIcon(notification.type);
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">New Notification</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Add event listener to close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            });
        }
        
        // Add event listener to toast
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                this.handleNotificationClick(notification);
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 5000);
        
        // Show the toast with animation
        setTimeout(() => {
            toast.classList.add('toast-visible');
        }, 10);
    }
    
    /**
     * Start polling for new notifications (simulating server updates)
     */
    startNotificationPolling() {
        // In a real application, this would use WebSockets or server-sent events
        // For this demo, we'll simulate new notifications periodically
        
        // Check for new notifications every 30 seconds
        setInterval(() => {
            // Only simulate notifications if user is logged in
            if (this.currentUser) {
                // 10% chance of getting a new notification
                if (Math.random() < 0.1) {
                    this.simulateNewNotification();
                }
            }
        }, 30000);
    }
    
    /**
     * Simulate a new notification for demo purposes
     */
    simulateNewNotification() {
        const notificationTypes = Object.values(this.notificationTypes);
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        let notification = {
            type: randomType,
            message: '',
            data: {},
            link: null
        };
        
        // Generate random notification based on type
        switch (randomType) {
            case this.notificationTypes.NEW_LISTING:
                const books = ['Calculus', 'Physics', 'Computer Science', 'Biology', 'Chemistry'];
                const randomBook = books[Math.floor(Math.random() * books.length)];
                notification.message = `New ${randomBook} textbook listed in your department`;
                notification.data = { bookId: 'book_' + Math.random().toString(36).substr(2, 9) };
                notification.link = 'browse.html';
                break;
                
            case this.notificationTypes.MESSAGE:
                const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
                const randomName = names[Math.floor(Math.random() * names.length)];
                notification.message = `New message from ${randomName} about your book listing`;
                notification.data = { conversationId: 'conv_' + Math.random().toString(36).substr(2, 9) };
                notification.link = 'messages.html';
                break;
                
            case this.notificationTypes.TRANSACTION:
                const transactionTypes = ['Payment received', 'Book sold', 'New purchase', 'Transaction completed'];
                const randomTransaction = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
                notification.message = `${randomTransaction} - check your transactions`;
                notification.data = { transactionId: 'trans_' + Math.random().toString(36).substr(2, 9) };
                notification.link = 'dashboard.html?tab=transactions';
                break;
                
            case this.notificationTypes.REVIEW:
                notification.message = 'Someone left a new review on your book listing';
                notification.data = { reviewId: 'review_' + Math.random().toString(36).substr(2, 9) };
                notification.link = 'dashboard.html?tab=reviews';
                break;
                
            case this.notificationTypes.SYSTEM:
                const systemMessages = [
                    'Welcome to Campus BookSwap!',
                    'Your account has been verified',
                    'New feature: Book price comparison is now available',
                    'Maintenance scheduled for tonight',
                    'Your listing is about to expire'
                ];
                const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
                notification.message = randomMessage;
                break;
        }
        
        // Add the notification
        this.addNotification(notification);
    }
    
    /**
     * Generate HTML for a full notifications page
     */
    generateNotificationsPage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Create page structure
        let html = `
            <div class="notifications-page">
                <div class="notifications-header">
                    <h2>Your Notifications</h2>
                    <div class="notifications-actions">
                        <button id="mark-all-read-btn" class="btn-secondary">
                            <i class="fas fa-check-double"></i> Mark all as read
                        </button>
                    </div>
                </div>
                <div class="notifications-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="unread">Unread</button>
                    <button class="filter-btn" data-filter="${this.notificationTypes.NEW_LISTING}">Listings</button>
                    <button class="filter-btn" data-filter="${this.notificationTypes.MESSAGE}">Messages</button>
                    <button class="filter-btn" data-filter="${this.notificationTypes.TRANSACTION}">Transactions</button>
                    <button class="filter-btn" data-filter="${this.notificationTypes.REVIEW}">Reviews</button>
                    <button class="filter-btn" data-filter="${this.notificationTypes.SYSTEM}">System</button>
                </div>
                <div class="notifications-list-full">
        `;
        
        if (!this.notifications || this.notifications.length === 0) {
            html += '<div class="empty-notifications">No notifications yet</div>';
        } else {
            // Sort notifications by date (newest first)
            const sortedNotifications = [...this.notifications].sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            // Add each notification
            sortedNotifications.forEach(notification => {
                const icon = this.getNotificationIcon(notification.type);
                const timestamp = this.formatTimestamp(notification.timestamp);
                
                html += `
                    <div class="notification-item-full ${!notification.read ? 'unread' : ''}" data-id="${notification.id}" data-type="${notification.type}">
                        <div class="notification-icon-full">
                            <i class="${icon}"></i>
                        </div>
                        <div class="notification-content-full">
                            <div class="notification-text-full">${notification.message}</div>
                            <div class="notification-time-full">${timestamp}</div>
                        </div>
                        <div class="notification-actions-full">
                            ${!notification.read ? `
                                <button class="mark-read-btn" data-id="${notification.id}">
                                    <i class="fas fa-check"></i> Mark as read
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
            </div>
        `;
        
        // Set the HTML content
        container.innerHTML = html;
        
        // Add event listeners
        this.addNotificationsPageEventListeners(container);
    }
    
    /**
     * Add event listeners for the notifications page
     */
    addNotificationsPageEventListeners(container) {
        // Mark all as read button
        const markAllReadBtn = container.querySelector('#mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
        
        // Filter buttons
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply filter
                const filter = btn.dataset.filter;
                this.filterNotifications(filter, container);
            });
        });
        
        // Mark as read buttons
        const markReadBtns = container.querySelectorAll('.mark-read-btn');
        markReadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = btn.dataset.id;
                this.markAsRead(notificationId);
            });
        });
        
        // Notification items
        const notificationItems = container.querySelectorAll('.notification-item-full');
        notificationItems.forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.dataset.id;
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    this.handleNotificationClick(notification);
                }
            });
        });
    }
    
    /**
     * Filter notifications on the notifications page
     */
    filterNotifications(filter, container) {
        const notificationItems = container.querySelectorAll('.notification-item-full');
        
        notificationItems.forEach(item => {
            const type = item.dataset.type;
            const isUnread = item.classList.contains('unread');
            
            if (filter === 'all') {
                item.style.display = 'flex';
            } else if (filter === 'unread') {
                item.style.display = isUnread ? 'flex' : 'none';
            } else {
                item.style.display = type === filter ? 'flex' : 'none';
            }
        });
    }
}

// Export the NotificationSystem class
window.NotificationSystem = NotificationSystem;