/**
 * Payment Gateway Integration for Campus BookSwap
 * Supports Stripe, PayPal, and Razorpay payment methods
 */

class PaymentGateway {
    constructor() {
        this.apiKeys = {
            stripe: {
                publishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx', // Replace with actual key in production
                secretKey: '' // Never include secret keys in frontend code
            },
            paypal: {
                clientId: 'test_client_id', // Replace with actual client ID in production
            },
            razorpay: {
                keyId: 'rzp_test_key', // Replace with actual key in production
            }
        };
        
        this.selectedGateway = 'stripe'; // Default payment gateway
        this.initializeGateways();
    }
    
    /**
     * Initialize payment gateway SDKs
     */
    initializeGateways() {
        // Load Stripe.js dynamically
        this.loadScript('https://js.stripe.com/v3/', () => {
            this.stripe = Stripe(this.apiKeys.stripe.publishableKey);
            console.log('Stripe initialized');
        });
        
        // Load PayPal SDK dynamically
        this.loadScript('https://www.paypal.com/sdk/js?client-id=' + this.apiKeys.paypal.clientId, () => {
            console.log('PayPal initialized');
        });
        
        // Load Razorpay SDK dynamically
        this.loadScript('https://checkout.razorpay.com/v1/checkout.js', () => {
            console.log('Razorpay initialized');
        });
    }
    
    /**
     * Helper method to load external scripts
     */
    loadScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    }
    
    /**
     * Set the payment gateway to use
     */
    setGateway(gateway) {
        if (['stripe', 'paypal', 'razorpay'].includes(gateway)) {
            this.selectedGateway = gateway;
            return true;
        }
        return false;
    }
    
    /**
     * Process payment based on selected gateway
     */
    processPayment(amount, currency, bookDetails, callback) {
        switch(this.selectedGateway) {
            case 'stripe':
                this.processStripePayment(amount, currency, bookDetails, callback);
                break;
            case 'paypal':
                this.processPayPalPayment(amount, currency, bookDetails, callback);
                break;
            case 'razorpay':
                this.processRazorpayPayment(amount, currency, bookDetails, callback);
                break;
            default:
                callback({
                    success: false,
                    error: 'Invalid payment gateway selected'
                });
        }
    }
    
    /**
     * Process payment with Stripe
     */
    processStripePayment(amount, currency, bookDetails, callback) {
        // In a real implementation, you would create a payment intent on your server
        // and return the client secret to use here
        
        // For demo purposes, we'll simulate the payment flow
        console.log('Processing Stripe payment:', { amount, currency, bookDetails });
        
        // Create a payment method elements
        const elements = this.stripe.elements();
        const cardElement = elements.create('card');
        
        // Mount the card element to the DOM
        const cardContainer = document.getElementById('stripe-card-element');
        if (cardContainer) {
            cardElement.mount(cardContainer);
            
            // Add submit event listener to the form
            const form = document.getElementById('payment-form');
            if (form) {
                form.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    
                    // Disable the submit button to prevent multiple clicks
                    document.getElementById('submit-payment').disabled = true;
                    
                    try {
                        // Create a payment method
                        const result = await this.stripe.createPaymentMethod({
                            type: 'card',
                            card: cardElement,
                            billing_details: {
                                name: document.getElementById('cardholder-name').value,
                            },
                        });
                        
                        if (result.error) {
                            // Show error to customer
                            const errorElement = document.getElementById('card-errors');
                            if (errorElement) {
                                errorElement.textContent = result.error.message;
                            }
                            document.getElementById('submit-payment').disabled = false;
                            callback({
                                success: false,
                                error: result.error.message
                            });
                        } else {
                            // In a real implementation, you would send the payment method ID to your server
                            // to complete the payment
                            
                            // For demo purposes, we'll simulate a successful payment
                            setTimeout(() => {
                                callback({
                                    success: true,
                                    paymentId: 'pm_' + Math.random().toString(36).substr(2, 9),
                                    amount: amount,
                                    currency: currency,
                                    bookDetails: bookDetails
                                });
                            }, 1000);
                        }
                    } catch (error) {
                        console.error('Error processing payment:', error);
                        callback({
                            success: false,
                            error: 'An unexpected error occurred'
                        });
                        document.getElementById('submit-payment').disabled = false;
                    }
                });
            }
        } else {
            callback({
                success: false,
                error: 'Stripe card element container not found'
            });
        }
    }
    
    /**
     * Process payment with PayPal
     */
    processPayPalPayment(amount, currency, bookDetails, callback) {
        console.log('Processing PayPal payment:', { amount, currency, bookDetails });
        
        // Render the PayPal button
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer && window.paypal) {
            paypalContainer.innerHTML = '';
            
            window.paypal.Buttons({
                createOrder: function(data, actions) {
                    // Create a PayPal order
                    return actions.order.create({
                        purchase_units: [{
                            description: `${bookDetails.title} by ${bookDetails.author}`,
                            amount: {
                                currency_code: currency.toUpperCase(),
                                value: amount
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    // Capture the funds from the transaction
                    return actions.order.capture().then(function(details) {
                        // Call your server to save the transaction
                        callback({
                            success: true,
                            paymentId: details.id,
                            amount: amount,
                            currency: currency,
                            bookDetails: bookDetails
                        });
                    });
                },
                onError: function(err) {
                    console.error('PayPal error:', err);
                    callback({
                        success: false,
                        error: 'PayPal payment failed'
                    });
                }
            }).render(paypalContainer);
        } else {
            callback({
                success: false,
                error: 'PayPal container not found or PayPal not initialized'
            });
        }
    }
    
    /**
     * Process payment with Razorpay
     */
    processRazorpayPayment(amount, currency, bookDetails, callback) {
        console.log('Processing Razorpay payment:', { amount, currency, bookDetails });
        
        if (window.Razorpay) {
            // Convert amount to smallest currency unit (paise for INR)
            const amountInSmallestUnit = amount * 100;
            
            const options = {
                key: this.apiKeys.razorpay.keyId,
                amount: amountInSmallestUnit,
                currency: currency.toUpperCase(),
                name: 'Campus BookSwap',
                description: `Payment for ${bookDetails.title}`,
                image: 'https://your-logo-url.png', // Replace with your logo
                handler: function(response) {
                    callback({
                        success: true,
                        paymentId: response.razorpay_payment_id,
                        amount: amount,
                        currency: currency,
                        bookDetails: bookDetails
                    });
                },
                prefill: {
                    name: document.getElementById('buyer-name')?.value || '',
                    email: document.getElementById('buyer-email')?.value || '',
                    contact: document.getElementById('buyer-phone')?.value || ''
                },
                theme: {
                    color: '#3498db'
                },
                modal: {
                    ondismiss: function() {
                        callback({
                            success: false,
                            error: 'Payment cancelled by user'
                        });
                    }
                }
            };
            
            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        } else {
            callback({
                success: false,
                error: 'Razorpay not initialized'
            });
        }
    }
    
    /**
     * Generate a payment form for the selected gateway
     */
    generatePaymentForm(containerId, amount, currency, bookDetails) {
        const container = document.getElementById(containerId);
        if (!container) return false;
        
        let formHtml = '';
        
        // Payment method selection
        formHtml += `
            <div class="payment-method-selection">
                <h3>Select Payment Method</h3>
                <div class="payment-methods">
                    <div class="payment-method ${this.selectedGateway === 'stripe' ? 'active' : ''}" data-method="stripe">
                        <i class="fab fa-cc-stripe"></i>
                        <span>Credit/Debit Card</span>
                    </div>
                    <div class="payment-method ${this.selectedGateway === 'paypal' ? 'active' : ''}" data-method="paypal">
                        <i class="fab fa-paypal"></i>
                        <span>PayPal</span>
                    </div>
                    <div class="payment-method ${this.selectedGateway === 'razorpay' ? 'active' : ''}" data-method="razorpay">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Razorpay</span>
                    </div>
                </div>
            </div>
        `;
        
        // Payment summary
        formHtml += `
            <div class="payment-summary">
                <h3>Payment Summary</h3>
                <div class="summary-item">
                    <span>Book:</span>
                    <span>${bookDetails.title}</span>
                </div>
                <div class="summary-item">
                    <span>Author:</span>
                    <span>${bookDetails.author}</span>
                </div>
                <div class="summary-item">
                    <span>Seller:</span>
                    <span>${bookDetails.seller}</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>${currency.toUpperCase()} ${amount}</span>
                </div>
            </div>
        `;
        
        // Payment form based on selected gateway
        formHtml += '<div class="payment-form-container">';
        
        // Stripe form
        formHtml += `
            <form id="payment-form" class="payment-form ${this.selectedGateway === 'stripe' ? '' : 'hidden'}" data-method="stripe">
                <div class="form-group">
                    <label for="cardholder-name">Cardholder Name</label>
                    <input type="text" id="cardholder-name" placeholder="Name on card" required>
                </div>
                <div class="form-group">
                    <label for="stripe-card-element">Card Details</label>
                    <div id="stripe-card-element" class="card-element"></div>
                    <div id="card-errors" class="error-message" role="alert"></div>
                </div>
                <button id="submit-payment" type="submit" class="submit-btn">Pay ${currency.toUpperCase()} ${amount}</button>
            </form>
        `;
        
        // PayPal form
        formHtml += `
            <div class="payment-form ${this.selectedGateway === 'paypal' ? '' : 'hidden'}" data-method="paypal">
                <div id="paypal-button-container"></div>
            </div>
        `;
        
        // Razorpay form
        formHtml += `
            <div class="payment-form ${this.selectedGateway === 'razorpay' ? '' : 'hidden'}" data-method="razorpay">
                <div class="form-group">
                    <label for="buyer-name">Full Name</label>
                    <input type="text" id="buyer-name" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                    <label for="buyer-email">Email</label>
                    <input type="email" id="buyer-email" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="buyer-phone">Phone Number</label>
                    <input type="tel" id="buyer-phone" placeholder="Enter your phone number" required>
                </div>
                <button id="razorpay-button" class="submit-btn">Pay ${currency.toUpperCase()} ${amount}</button>
            </div>
        `;
        
        formHtml += '</div>';
        
        // Set the HTML content
        container.innerHTML = formHtml;
        
        // Add event listeners for payment method selection
        const paymentMethods = container.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                const selectedMethod = method.dataset.method;
                
                // Update active class
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                // Update selected gateway
                this.setGateway(selectedMethod);
                
                // Show/hide payment forms
                const paymentForms = container.querySelectorAll('.payment-form');
                paymentForms.forEach(form => {
                    if (form.dataset.method === selectedMethod) {
                        form.classList.remove('hidden');
                    } else {
                        form.classList.add('hidden');
                    }
                });
                
                // Initialize the selected payment method
                if (selectedMethod === 'stripe') {
                    this.processStripePayment(amount, currency, bookDetails, result => {
                        console.log('Stripe payment result:', result);
                    });
                } else if (selectedMethod === 'paypal') {
                    this.processPayPalPayment(amount, currency, bookDetails, result => {
                        console.log('PayPal payment result:', result);
                    });
                }
            });
        });
        
        // Add event listener for Razorpay button
        const razorpayButton = container.querySelector('#razorpay-button');
        if (razorpayButton) {
            razorpayButton.addEventListener('click', () => {
                this.processRazorpayPayment(amount, currency, bookDetails, result => {
                    console.log('Razorpay payment result:', result);
                });
            });
        }
        
        return true;
    }
}

// Export the PaymentGateway class
window.PaymentGateway = PaymentGateway;