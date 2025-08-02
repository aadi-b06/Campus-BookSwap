/**
 * Messaging System for Campus BookSwap
 * Handles messaging between users and WhatsApp integration
 */

// Check if MessagingSystem is already defined to prevent redeclaration
if (typeof MessagingSystem === 'undefined') {
class MessagingSystem {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.conversations = this.loadConversationsFromStorage() || [];
        this.activeConversationId = null;
        
        // Initialize the messaging system
        this.initMessagingSystem();
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
     * Load conversations from localStorage
     * @returns {Array|null} Conversations or null if none exist
     */
    loadConversationsFromStorage() {
        const conversationsJson = localStorage.getItem('bookswap_conversations');
        return conversationsJson ? JSON.parse(conversationsJson) : null;
    }
    
    /**
     * Save conversations to localStorage
     */
    saveConversationsToStorage() {
        localStorage.setItem('bookswap_conversations', JSON.stringify(this.conversations));
    }
    
    /**
     * Initialize the messaging system
     */
    initMessagingSystem() {
        if (!this.currentUser) {
            console.warn('User not logged in. Messaging system not initialized.');
            return;
        }
        
        // Setup event listeners for the messaging interface
        this.setupEventListeners();
        
        // Load and display conversations
        this.displayConversations();
        
        // If we're on the messages tab, set up the chat area
        if (document.querySelector('#messages.tab-content.active')) {
            this.setupChatArea();
        }
    }
    
    /**
     * Set up event listeners for the messaging interface
     */
    setupEventListeners() {
        // Tab button click event to initialize chat when messages tab is activated
        const messagesTabButton = document.querySelector('.tab-button[data-tab="messages"]');
        if (messagesTabButton) {
            messagesTabButton.addEventListener('click', () => {
                this.setupChatArea();
            });
        }
        
        // Send button click event
        const sendButton = document.querySelector('.send-btn');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Enter key press in chat input
        const chatInput = document.querySelector('.chat-input input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }
    
    /**
     * Set up the chat area with WhatsApp integration
     */
    setupChatArea() {
        // Set up conversation selection
        this.setupConversationSelection();
        
        // Add WhatsApp integration button to chat header
        this.addWhatsAppIntegration();
    }
    
    /**
     * Set up conversation selection functionality
     */
    setupConversationSelection() {
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        conversationItems.forEach(item => {
            // Remove existing event listeners by cloning and replacing
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', () => {
                // Remove active class from all conversation items
                conversationItems.forEach(conv => conv.classList.remove('active'));
                
                // Add active class to clicked conversation item
                newItem.classList.add('active');
                
                // Get conversation ID and load messages
                const conversationId = newItem.dataset.conversationId;
                if (conversationId) {
                    this.activeConversationId = conversationId;
                    this.loadConversationMessages(conversationId);
                }
            });
        });
    }
    
    /**
     * Add WhatsApp integration to the chat header
     */
    addWhatsAppIntegration() {
        const chatHeader = document.querySelector('.chat-header');
        if (!chatHeader) return;
        
        // Check if WhatsApp button already exists
        if (chatHeader.querySelector('.whatsapp-btn')) return;
        
        // Create WhatsApp button
        const whatsappBtn = document.createElement('button');
        whatsappBtn.className = 'whatsapp-btn';
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Continue in WhatsApp';
        whatsappBtn.title = 'Continue this conversation in WhatsApp';
        
        // Add button to chat header
        chatHeader.appendChild(whatsappBtn);
        
        // Add click event listener
        whatsappBtn.addEventListener('click', () => {
            this.openWhatsAppChat();
        });
        
        // Add styles for the WhatsApp button
        const style = document.createElement('style');
        style.textContent = `
            .whatsapp-btn {
                margin-left: auto;
                background-color: #25D366;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .whatsapp-btn:hover {
                background-color: #128C7E;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Display conversations in the sidebar
     */
    displayConversations() {
        const conversationsList = document.querySelector('.conversations-list');
        if (!conversationsList) return;
        
        // If no conversations, show empty state
        if (!this.conversations || this.conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No Messages Yet</h3>
                    <p>When you message other users about books, your conversations will appear here.</p>
                </div>
            `;
            return;
        }
        
        // Clear existing conversations
        conversationsList.innerHTML = '';
        
        // Add each conversation
        this.conversations.forEach(conversation => {
            const conversationItem = this.createConversationItem(conversation);
            conversationsList.appendChild(conversationItem);
        });
    }
    
    /**
     * Create a conversation item element
     * @param {Object} conversation - Conversation data
     * @returns {HTMLElement} Conversation item element
     */
    createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        item.dataset.conversationId = conversation.id;
        
        // Get the other user's info
        const otherUser = conversation.participants.find(p => p.id !== this.currentUser.id);
        
        // Get the last message
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        
        // Format time
        const messageTime = this.formatMessageTime(new Date(lastMessage.timestamp));
        
        // Check if there are unread messages
        const hasUnread = conversation.messages.some(m => !m.read && m.senderId !== this.currentUser.id);
        
        item.innerHTML = `
            <div class="conversation-avatar">${this.getInitials(otherUser.name)}</div>
            <div class="conversation-info">
                <div class="conversation-name">
                    <span>${otherUser.name}</span>
                    <span class="conversation-time">${messageTime}</span>
                </div>
                <p class="conversation-preview">${lastMessage.text}</p>
                ${hasUnread ? '<span class="unread-indicator"></span>' : ''}
            </div>
        `;
        
        return item;
    }
    
    /**
     * Load and display messages for a specific conversation
     * @param {string} conversationId - ID of the conversation to load
     */
    loadConversationMessages(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        // Get the other user's info
        const otherUser = conversation.participants.find(p => p.id !== this.currentUser.id);
        
        // Update chat header
        this.updateChatHeader(otherUser, conversation.bookTitle);
        
        // Display messages
        this.displayMessages(conversation.messages);
        
        // Mark messages as read
        this.markMessagesAsRead(conversationId);
    }
    
    /**
     * Update the chat header with user and book information
     * @param {Object} user - User data for the conversation partner
     * @param {string} bookTitle - Title of the book being discussed
     */
    updateChatHeader(user, bookTitle) {
        const chatHeader = document.querySelector('.chat-header');
        if (!chatHeader) return;
        
        const avatar = chatHeader.querySelector('.conversation-avatar');
        if (avatar) {
            avatar.textContent = this.getInitials(user.name);
        }
        
        const nameElement = chatHeader.querySelector('h3');
        if (nameElement) {
            nameElement.textContent = user.name;
        }
        
        const bookElement = chatHeader.querySelector('p');
        if (bookElement) {
            bookElement.textContent = `Regarding: ${bookTitle}`;
        }
    }
    
    /**
     * Display messages in the chat area
     * @param {Array} messages - Array of message objects
     */
    displayMessages(messages) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Add each message
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
        messageElement.className = `message ${isSent ? 'message-sent' : 'message-received'}`;
        
        // Create message text
        const messageTextElement = document.createElement('p');
        messageTextElement.textContent = message.text;
        messageElement.appendChild(messageTextElement);
        
        // Create message time
        const messageTimeElement = document.createElement('div');
        messageTimeElement.className = 'message-time';
        messageTimeElement.textContent = this.formatMessageTime(new Date(message.timestamp));
        messageElement.appendChild(messageTimeElement);
        
        return messageElement;
    }
    
    /**
     * Send a message in the active conversation
     */
    sendMessage() {
        const chatInput = document.querySelector('.chat-input input');
        if (!chatInput) return;
        
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        
        // If no active conversation, show error
        if (!this.activeConversationId) {
            alert('Please select a conversation first.');
            return;
        }
        
        // Find the conversation
        const conversation = this.conversations.find(c => c.id === this.activeConversationId);
        if (!conversation) return;
        
        // Create new message
        const newMessage = {
            id: Date.now().toString(),
            senderId: this.currentUser.id,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Add message to conversation
        conversation.messages.push(newMessage);
        
        // Save to storage
        this.saveConversationsToStorage();
        
        // Update UI
        this.displayMessages(conversation.messages);
        this.displayConversations(); // Update conversation list with new last message
        
        // Clear input
        chatInput.value = '';
    }
    
    /**
     * Mark all messages in a conversation as read
     * @param {string} conversationId - ID of the conversation
     */
    markMessagesAsRead(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        // Mark all messages as read
        conversation.messages.forEach(message => {
            if (message.senderId !== this.currentUser.id) {
                message.read = true;
            }
        });
        
        // Save to storage
        this.saveConversationsToStorage();
        
        // Update UI
        this.displayConversations();
    }
    
    /**
     * Open WhatsApp chat with the conversation partner
     */
    openWhatsAppChat() {
        if (!this.activeConversationId) {
            alert('Please select a conversation first.');
            return;
        }
        
        // Find the conversation
        const conversation = this.conversations.find(c => c.id === this.activeConversationId);
        if (!conversation) return;
        
        // Get the other user's info
        const otherUser = conversation.participants.find(p => p.id !== this.currentUser.id);
        
        // Check if the other user has a WhatsApp number
        if (!otherUser.whatsappNumber) {
            // Ask for WhatsApp number
            const whatsappNumber = prompt('Enter WhatsApp number for ' + otherUser.name + ' (with country code):', '');
            if (!whatsappNumber) return;
            
            // Save the WhatsApp number
            otherUser.whatsappNumber = whatsappNumber;
            this.saveConversationsToStorage();
        }
        
        // Format the WhatsApp number (remove spaces, dashes, etc.)
        const formattedNumber = otherUser.whatsappNumber.replace(/[\s-\(\)]/g, '');
        
        // Create message text about the book
        const messageText = `Hi, I'm interested in your book: ${conversation.bookTitle}`;
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageText)}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
    }
    
    /**
     * Create a new conversation with another user about a book
     * @param {Object} otherUser - User to start conversation with
     * @param {Object} book - Book data
     * @param {string} initialMessage - First message text
     * @returns {string} ID of the new conversation
     */
    createNewConversation(otherUser, book, initialMessage) {
        // Generate a unique ID for the conversation
        const conversationId = Date.now().toString();
        
        // Create the conversation object
        const newConversation = {
            id: conversationId,
            participants: [
                {
                    id: this.currentUser.id,
                    name: this.currentUser.name
                },
                {
                    id: otherUser.id,
                    name: otherUser.name,
                    whatsappNumber: otherUser.whatsappNumber || ''
                }
            ],
            bookId: book.id,
            bookTitle: book.title,
            messages: [
                {
                    id: Date.now().toString(),
                    senderId: this.currentUser.id,
                    text: initialMessage,
                    timestamp: new Date().toISOString(),
                    read: false
                }
            ]
        };
        
        // Add to conversations array
        if (!this.conversations) {
            this.conversations = [];
        }
        this.conversations.push(newConversation);
        
        // Save to storage
        this.saveConversationsToStorage();
        
        // Return the conversation ID
        return conversationId;
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
            return 'Yesterday';
        } else {
            // Other date
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
     * Create test conversations for demonstration purposes
     */
    createTestConversations() {
        // Only create test data if no conversations exist
        if (this.conversations && this.conversations.length > 0) return;
        
        const testUsers = [
            { id: 'user1', name: 'Alice Smith', whatsappNumber: '+1234567890' },
            { id: 'user2', name: 'Bob Johnson', whatsappNumber: '+0987654321' },
            { id: 'user3', name: 'Carol Davis', whatsappNumber: '' }
        ];
        
        const testBooks = [
            { id: 'book1', title: 'Introduction to Computer Science' },
            { id: 'book2', title: 'Calculus: Early Transcendentals' },
            { id: 'book3', title: 'Data Structures and Algorithms' }
        ];
        
        // Create conversations with each test user
        this.conversations = [];
        
        testUsers.forEach((user, index) => {
            const book = testBooks[index];
            const conversationId = Date.now().toString() + index;
            
            // Create messages with timestamps spread over the last few days
            const messages = [];
            const now = new Date();
            
            // First message from current user
            messages.push({
                id: 'msg1' + index,
                senderId: this.currentUser.id,
                text: `Hi! I'm interested in your book: ${book.title}. Is it still available?`,
                timestamp: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000) - (index * 60 * 60 * 1000)).toISOString(),
                read: true
            });
            
            // Reply from other user
            messages.push({
                id: 'msg2' + index,
                senderId: user.id,
                text: 'Yes, it is still available! It\'s in excellent condition with no highlights or notes.',
                timestamp: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000) - (index * 30 * 60 * 1000)).toISOString(),
                read: true
            });
            
            // Second message from current user
            messages.push({
                id: 'msg3' + index,
                senderId: this.currentUser.id,
                text: 'Great! Would you be willing to meet on campus to exchange? I\'m available tomorrow afternoon.',
                timestamp: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000) - (index * 15 * 60 * 1000)).toISOString(),
                read: true
            });
            
            // Second reply from other user
            messages.push({
                id: 'msg4' + index,
                senderId: user.id,
                text: 'Sure, I can meet tomorrow. How about 3 PM at the library?',
                timestamp: new Date(now.getTime() - (12 * 60 * 60 * 1000) - (index * 5 * 60 * 1000)).toISOString(),
                read: index !== 0 // First conversation has unread message
            });
            
            // Create the conversation
            const conversation = {
                id: conversationId,
                participants: [
                    {
                        id: this.currentUser.id,
                        name: this.currentUser.name
                    },
                    {
                        id: user.id,
                        name: user.name,
                        whatsappNumber: user.whatsappNumber
                    }
                ],
                bookId: book.id,
                bookTitle: book.title,
                messages: messages
            };
            
            this.conversations.push(conversation);
        });
        
        // Save to storage
        this.saveConversationsToStorage();
    }
}

// Initialize messaging system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.messagingSystem = new MessagingSystem();
    
    // Create test conversations if on dashboard page
    if (document.querySelector('.dashboard-container')) {
        setTimeout(() => {
            window.messagingSystem.createTestConversations();
            window.messagingSystem.displayConversations();
        }, 1000);
    }
});

} // Close the if (typeof MessagingSystem === 'undefined') block