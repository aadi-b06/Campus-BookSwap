/**
 * Book Messaging Integration
 * Allows users to initiate conversations about books from book detail pages
 */

class BookMessaging {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.setupMessageButtons();
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
     * Set up message buttons on book cards and detail pages
     */
    setupMessageButtons() {
        // Find all message buttons
        const messageButtons = document.querySelectorAll('.message-seller-btn, .contact-seller-btn');
        
        messageButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                
                // Check if user is logged in
                if (!this.currentUser) {
                    alert('Please log in to message the seller.');
                    window.location.href = 'login.html';
                    return;
                }
                
                // Get book data from the button's data attributes or parent element
                const bookCard = button.closest('.book-card, .book-details');
                if (!bookCard) return;
                
                const bookId = bookCard.dataset.bookId || 'unknown';
                const bookTitle = bookCard.querySelector('.book-title')?.textContent || 
                                 bookCard.querySelector('h1')?.textContent || 
                                 'Unknown Book';
                
                const sellerName = bookCard.dataset.sellerName || 'Unknown Seller';
                const sellerId = bookCard.dataset.sellerId || 'unknown';
                
                // Don't allow messaging yourself
                if (sellerId === this.currentUser.id) {
                    alert('You cannot message yourself.');
                    return;
                }
                
                // Create a modal for the message
                this.showMessageModal(bookId, bookTitle, sellerId, sellerName);
            });
        });
    }
    
    /**
     * Show a modal to compose a message to the seller
     * @param {string} bookId - ID of the book
     * @param {string} bookTitle - Title of the book
     * @param {string} sellerId - ID of the seller
     * @param {string} sellerName - Name of the seller
     */
    showMessageModal(bookId, bookTitle, sellerId, sellerName) {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3>Message to ${sellerName}</h3>
            <span class="close-modal">&times;</span>
        `;
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = `
            <p>You are messaging about: <strong>${bookTitle}</strong></p>
            <textarea id="message-text" placeholder="Type your message here...">Hi! I'm interested in your book: ${bookTitle}. Is it still available?</textarea>
            <div class="whatsapp-option">
                <label>
                    <input type="checkbox" id="use-whatsapp"> Continue conversation in WhatsApp
                </label>
                <div id="whatsapp-number-container" style="display: none; margin-top: 10px;">
                    <input type="text" id="whatsapp-number" placeholder="WhatsApp number (with country code)">
                    <p class="hint">Example: +1234567890</p>
                </div>
            </div>
        `;
        
        // Create modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalFooter.innerHTML = `
            <button id="send-message-btn" class="primary-button">Send Message</button>
            <button id="cancel-message-btn" class="secondary-button">Cancel</button>
        `;
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalContainer.appendChild(modalContent);
        
        // Add modal to body
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        const closeModal = () => {
            document.body.removeChild(modalContainer);
        };
        
        // Close button
        modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        
        // Cancel button
        modalContainer.querySelector('#cancel-message-btn').addEventListener('click', closeModal);
        
        // WhatsApp checkbox
        const whatsappCheckbox = modalContainer.querySelector('#use-whatsapp');
        const whatsappNumberContainer = modalContainer.querySelector('#whatsapp-number-container');
        
        whatsappCheckbox.addEventListener('change', () => {
            whatsappNumberContainer.style.display = whatsappCheckbox.checked ? 'block' : 'none';
        });
        
        // Send button
        modalContainer.querySelector('#send-message-btn').addEventListener('click', () => {
            const messageText = modalContainer.querySelector('#message-text').value.trim();
            
            if (!messageText) {
                alert('Please enter a message.');
                return;
            }
            
            // Check if WhatsApp option is selected
            if (whatsappCheckbox.checked) {
                const whatsappNumber = modalContainer.querySelector('#whatsapp-number').value.trim();
                
                if (!whatsappNumber) {
                    alert('Please enter a WhatsApp number.');
                    return;
                }
                
                // Format the WhatsApp number (remove spaces, dashes, etc.)
                const formattedNumber = whatsappNumber.replace(/[\s-\(\)]/g, '');
                
                // Create WhatsApp URL
                const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageText)}`;
                
                // Open WhatsApp in a new tab
                window.open(whatsappUrl, '_blank');
            } else {
                // Create a new conversation or add to existing one
                this.createOrUpdateConversation(bookId, bookTitle, sellerId, sellerName, messageText);
            }
            
            // Close the modal
            closeModal();
            
            // Show success message
            alert('Message sent successfully!');
        });
        
        // Add modal styles if not already present
        if (!document.getElementById('modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
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
                    max-width: 500px;
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
                
                .modal-body textarea {
                    width: 100%;
                    min-height: 120px;
                    padding: 10px;
                    border: 1px solid #ecf0f1;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    font-family: inherit;
                    resize: vertical;
                }
                
                .whatsapp-option {
                    margin-bottom: 15px;
                }
                
                .whatsapp-option input[type="text"] {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ecf0f1;
                    border-radius: 5px;
                }
                
                .hint {
                    font-size: 0.8rem;
                    color: #7f8c8d;
                    margin: 5px 0 0;
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
            `;
            document.head.appendChild(modalStyles);
        }
    }
    
    /**
     * Create a new conversation or update an existing one
     * @param {string} bookId - ID of the book
     * @param {string} bookTitle - Title of the book
     * @param {string} sellerId - ID of the seller
     * @param {string} sellerName - Name of the seller
     * @param {string} messageText - Message text
     */
    createOrUpdateConversation(bookId, bookTitle, sellerId, sellerName, messageText) {
        // Load existing conversations
        let conversations = JSON.parse(localStorage.getItem('bookswap_conversations')) || [];
        
        // Check if a conversation already exists for this book and seller
        let conversation = conversations.find(c => 
            c.bookId === bookId && 
            c.participants.some(p => p.id === sellerId) &&
            c.participants.some(p => p.id === this.currentUser.id)
        );
        
        if (conversation) {
            // Add message to existing conversation
            conversation.messages.push({
                id: Date.now().toString(),
                senderId: this.currentUser.id,
                text: messageText,
                timestamp: new Date().toISOString(),
                read: false
            });
        } else {
            // Create new conversation
            const newConversation = {
                id: Date.now().toString(),
                participants: [
                    {
                        id: this.currentUser.id,
                        name: this.currentUser.name
                    },
                    {
                        id: sellerId,
                        name: sellerName,
                        whatsappNumber: ''
                    }
                ],
                bookId: bookId,
                bookTitle: bookTitle,
                messages: [
                    {
                        id: Date.now().toString(),
                        senderId: this.currentUser.id,
                        text: messageText,
                        timestamp: new Date().toISOString(),
                        read: false
                    }
                ]
            };
            
            conversations.push(newConversation);
        }
        
        // Save conversations to localStorage
        localStorage.setItem('bookswap_conversations', JSON.stringify(conversations));
        
        // Redirect to dashboard messages tab
        window.location.href = 'dashboard.html#messages';
    }
}

// Initialize BookMessaging when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookMessaging = new BookMessaging();
});