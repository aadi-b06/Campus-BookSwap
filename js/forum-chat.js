/**
 * Forum Chat System for Campus BookSwap
 * Enables real-time chat functionality in the community forum
 */

// Check if ForumChatSystem is already defined to prevent redeclaration
if (typeof ForumChatSystem === 'undefined') {
class ForumChatSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.chatMessages = this.loadChatMessagesFromStorage() || [];
        this.chatUsers = this.loadChatUsersFromStorage() || this.getDefaultUsers();
        
        // Initialize the chat system
        this.initChatSystem();
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
     * Load chat messages from localStorage
     * @returns {Array|null} Chat messages or null if none exist
     */
    loadChatMessagesFromStorage() {
        const chatMessagesJson = localStorage.getItem('bookswap_forum_chat');
        return chatMessagesJson ? JSON.parse(chatMessagesJson) : null;
    }
    
    /**
     * Save chat messages to localStorage
     */
    saveChatMessagesToStorage() {
        localStorage.setItem('bookswap_forum_chat', JSON.stringify(this.chatMessages));
    }
    
    /**
     * Load chat users from localStorage
     * @returns {Array|null} Chat users or null if none exist
     */
    loadChatUsersFromStorage() {
        const chatUsersJson = localStorage.getItem('bookswap_forum_chat_users');
        return chatUsersJson ? JSON.parse(chatUsersJson) : null;
    }
    
    /**
     * Save chat users to localStorage
     */
    saveChatUsersToStorage() {
        localStorage.setItem('bookswap_forum_chat_users', JSON.stringify(this.chatUsers));
    }
    
    /**
     * Get default users for the chat
     * @returns {Array} Default users
     */
    getDefaultUsers() {
        return [
            { id: 'user1', name: 'Alice Smith', avatar: null, status: 'online' },
            { id: 'user2', name: 'Bob Johnson', avatar: null, status: 'online' },
            { id: 'user3', name: 'Carol Davis', avatar: null, status: 'away' },
            { id: 'user4', name: 'David Wilson', avatar: null, status: 'offline' },
            { id: 'user5', name: 'Emily Brown', avatar: null, status: 'online' }
        ];
    }
    
    /**
     * Initialize the chat system
     */
    initChatSystem() {
        if (!this.currentUser) {
            console.warn('User not logged in. Chat system not fully initialized.');
            // Still initialize for demo purposes
            this.currentUser = {
                id: 'guest_' + Date.now(),
                name: 'Guest User'
            };
        }
        
        // Create demo messages if none exist
        if (!this.chatMessages || this.chatMessages.length === 0) {
            this.createDemoMessages();
        }
        
        // Setup event listeners for the chat interface
        this.setupEventListeners();
        
        // Generate and inject the chat HTML
        this.generateChatHTML();
        
        // Display chat messages
        this.displayChatMessages();
    }
    
    /**
     * Set up event listeners for the chat interface
     */
    setupEventListeners() {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Forum tab button click event to initialize chat when forum tab is activated
            const forumTabButton = document.querySelector('.tab-button[data-tab="forum"]');
            if (forumTabButton) {
                forumTabButton.addEventListener('click', () => {
                    // Small delay to ensure forum content is loaded
                    setTimeout(() => {
                        this.generateChatHTML();
                        this.displayChatMessages();
                    }, 500);
                });
            }
        });
        
        // Add event delegation for the send button and enter key in chat input
        document.addEventListener('click', (e) => {
            if (e.target.matches('.forum-chat-send-btn') || e.target.closest('.forum-chat-send-btn')) {
                this.sendChatMessage();
            }
        });
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && document.activeElement.matches('.forum-chat-input')) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
    }
    
    /**
     * Generate and inject the chat HTML
     */
    generateChatHTML() {
        const forumContainer = document.getElementById('forum-container');
        if (!forumContainer) return;
        
        // Check if chat container already exists
        if (document.querySelector('.forum-chat-container')) return;
        
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'forum-chat-container';
        
        chatContainer.innerHTML = `
            <div class="forum-chat-header">
                <h3>Community Chat</h3>
                <p>Chat with other students in real-time</p>
            </div>
            
            <div class="forum-chat-body">
                <div class="forum-chat-sidebar">
                    <div class="forum-chat-users-header">
                        <h4>Online Users</h4>
                    </div>
                    <div class="forum-chat-users-list">
                        ${this.generateChatUsersList()}
                    </div>
                </div>
                
                <div class="forum-chat-main">
                    <div class="forum-chat-messages" id="forum-chat-messages">
                        <!-- Messages will be displayed here -->
                    </div>
                    
                    <div class="forum-chat-input-container">
                        <input type="text" class="forum-chat-input" placeholder="Type your message here...">
                        <button class="forum-chat-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add chat container to the forum container
        forumContainer.appendChild(chatContainer);
        
        // Add CSS styles
        this.addChatStyles();
    }
    
    /**
     * Generate HTML for the chat users list
     * @returns {string} HTML for chat users list
     */
    generateChatUsersList() {
        let html = '';
        
        this.chatUsers.forEach(user => {
            html += `
                <div class="forum-chat-user" data-user-id="${user.id}">
                    <div class="forum-chat-user-avatar">${this.getInitials(user.name)}</div>
                    <div class="forum-chat-user-info">
                        <span class="forum-chat-user-name">${user.name}</span>
                        <span class="forum-chat-user-status ${user.status}">${user.status}</span>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Add CSS styles for the chat interface
     */
    addChatStyles() {
        // Check if styles already exist
        if (document.getElementById('forum-chat-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'forum-chat-styles';
        
        style.textContent = `
            .forum-chat-container {
                margin-top: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                background-color: #fff;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .forum-chat-header {
                padding: 15px 20px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .forum-chat-header h3 {
                margin: 0 0 5px 0;
                font-size: 18px;
                color: #333;
            }
            
            .forum-chat-header p {
                margin: 0;
                font-size: 14px;
                color: #666;
            }
            
            .forum-chat-body {
                display: flex;
                height: 500px;
            }
            
            .forum-chat-sidebar {
                width: 250px;
                border-right: 1px solid #e0e0e0;
                background-color: #f8f9fa;
                overflow-y: auto;
            }
            
            .forum-chat-users-header {
                padding: 15px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .forum-chat-users-header h4 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }
            
            .forum-chat-users-list {
                padding: 10px 0;
            }
            
            .forum-chat-user {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .forum-chat-user:hover {
                background-color: #e9ecef;
            }
            
            .forum-chat-user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #4a6fdc;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 10px;
            }
            
            .forum-chat-user-info {
                display: flex;
                flex-direction: column;
            }
            
            .forum-chat-user-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }
            
            .forum-chat-user-status {
                font-size: 12px;
                color: #666;
            }
            
            .forum-chat-user-status.online {
                color: #28a745;
            }
            
            .forum-chat-user-status.away {
                color: #ffc107;
            }
            
            .forum-chat-user-status.offline {
                color: #6c757d;
            }
            
            .forum-chat-main {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .forum-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background-color: #fff;
            }
            
            .forum-chat-message {
                margin-bottom: 15px;
                max-width: 80%;
            }
            
            .forum-chat-message.sent {
                margin-left: auto;
            }
            
            .forum-chat-message.received {
                margin-right: auto;
            }
            
            .forum-chat-message-content {
                padding: 10px 15px;
                border-radius: 18px;
                position: relative;
            }
            
            .forum-chat-message.sent .forum-chat-message-content {
                background-color: #4a6fdc;
                color: white;
                border-bottom-right-radius: 5px;
            }
            
            .forum-chat-message.received .forum-chat-message-content {
                background-color: #e9ecef;
                color: #333;
                border-bottom-left-radius: 5px;
            }
            
            .forum-chat-message-sender {
                font-size: 12px;
                margin-bottom: 5px;
                color: #666;
            }
            
            .forum-chat-message-time {
                font-size: 11px;
                color: #999;
                text-align: right;
                margin-top: 5px;
            }
            
            .forum-chat-input-container {
                display: flex;
                padding: 15px;
                border-top: 1px solid #e0e0e0;
                background-color: #f8f9fa;
            }
            
            .forum-chat-input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #ced4da;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }
            
            .forum-chat-input:focus {
                border-color: #4a6fdc;
            }
            
            .forum-chat-send-btn {
                margin-left: 10px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #4a6fdc;
                color: white;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .forum-chat-send-btn:hover {
                background-color: #3a5bbf;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .forum-chat-body {
                    flex-direction: column;
                    height: 600px;
                }
                
                .forum-chat-sidebar {
                    width: 100%;
                    height: 150px;
                    border-right: none;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .forum-chat-users-list {
                    display: flex;
                    overflow-x: auto;
                    padding: 10px;
                }
                
                .forum-chat-user {
                    flex-direction: column;
                    padding: 10px;
                    min-width: 80px;
                    text-align: center;
                }
                
                .forum-chat-user-avatar {
                    margin-right: 0;
                    margin-bottom: 5px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Display chat messages
     */
    displayChatMessages() {
        const chatMessagesContainer = document.getElementById('forum-chat-messages');
        if (!chatMessagesContainer) return;
        
        // Clear existing messages
        chatMessagesContainer.innerHTML = '';
        
        // Add each message
        this.chatMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
    
    /**
     * Create a message element
     * @param {Object} message - Message data
     * @returns {HTMLElement} Message element
     */
    createMessageElement(message) {
        const messageElement = document.createElement('div');
        
        // Determine if message was sent by current user
        const isSent = message.senderId === this.currentUser.id;
        messageElement.className = `forum-chat-message ${isSent ? 'sent' : 'received'}`;
        
        // Get sender info
        const sender = this.chatUsers.find(user => user.id === message.senderId) || { name: 'Unknown User' };
        
        // Create message HTML
        messageElement.innerHTML = `
            ${!isSent ? `<div class="forum-chat-message-sender">${sender.name}</div>` : ''}
            <div class="forum-chat-message-content">
                ${message.text}
            </div>
            <div class="forum-chat-message-time">
                ${this.formatMessageTime(new Date(message.timestamp))}
            </div>
        `;
        
        return messageElement;
    }
    
    /**
     * Send a chat message
     */
    sendChatMessage() {
        const chatInput = document.querySelector('.forum-chat-input');
        if (!chatInput) return;
        
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        
        // Create new message
        const newMessage = {
            id: Date.now().toString(),
            senderId: this.currentUser.id,
            text: messageText,
            timestamp: new Date().toISOString()
        };
        
        // Add message to chat
        this.chatMessages.push(newMessage);
        
        // Save to storage
        this.saveChatMessagesToStorage();
        
        // Update UI
        this.displayChatMessages();
        
        // Clear input
        chatInput.value = '';
    }
    
    /**
     * Format message timestamp into a readable string
     * @param {Date} date - Message timestamp
     * @returns {string} Formatted time string
     */
    formatMessageTime(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (messageDate.getTime() === today.getTime()) {
            // Today, show time
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (messageDate.getTime() === yesterday.getTime()) {
            // Yesterday
            return 'Yesterday ' + `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            // Other date
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
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
    
    /**
     * Create demo messages for the chat
     */
    createDemoMessages() {
        const now = new Date();
        
        this.chatMessages = [
            {
                id: 'msg1',
                senderId: 'user1',
                text: 'Hey everyone! Has anyone used the "Introduction to Computer Science" textbook by John Smith?',
                timestamp: new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg2',
                senderId: 'user2',
                text: 'Yes, I used it last semester. It\'s pretty good for beginners!',
                timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000) - (45 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg3',
                senderId: 'user3',
                text: 'I found some of the examples outdated though. There are better resources online.',
                timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000) - (30 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg4',
                senderId: 'user1',
                text: 'Thanks for the feedback! Any specific online resources you\'d recommend?',
                timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000) - (15 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg5',
                senderId: 'user5',
                text: 'I really liked the MIT OpenCourseWare for CS fundamentals. They have great video lectures and assignments.',
                timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000) - (45 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg6',
                senderId: 'user4',
                text: 'Has anyone taken Professor Johnson\'s CS101 class? I heard it\'s tough.',
                timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg7',
                senderId: 'user2',
                text: 'I took it last year. It is challenging but very rewarding. Make sure to start the assignments early!',
                timestamp: new Date(now.getTime() - (30 * 60 * 1000)).toISOString()
            },
            {
                id: 'msg8',
                senderId: 'user3',
                text: 'Also, form study groups! It helps a lot with the harder concepts.',
                timestamp: new Date(now.getTime() - (15 * 60 * 1000)).toISOString()
            }
        ];
        
        // Save to storage
        this.saveChatMessagesToStorage();
    }
}

// Initialize forum chat system when forum tab is clicked
window.forumChatSystem = null;

// Function to initialize forum chat system
function initializeForumChatSystem() {
    if (!window.forumChatSystem) {
        window.forumChatSystem = new ForumChatSystem();
    }
}

// Initialize forum chat system when forum tab is clicked
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when forum tab is clicked
    const forumTabButton = document.querySelector('.tab-button[data-tab="forum"]');
    if (forumTabButton) {
        forumTabButton.addEventListener('click', () => {
            // Initialize forum chat system if not already initialized
            initializeForumChatSystem();
        });
    }
});

} // Close the if (typeof ForumChatSystem === 'undefined') block