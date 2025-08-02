/**
 * Authentication Module for Campus BookSwap
 * Handles user authentication including Google OAuth
 */

class AuthSystem {
    constructor() {
        // Replace this with your actual Google Client ID when deploying to production
        this.googleClientId = '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
        this.initGoogleAuth();
        this.setupEventListeners();
        this.checkLastLoggedInUser();
    }

    /**
     * Initialize Google Authentication API
     */
    initGoogleAuth() {
        // Load the Google Sign-In API script
        this.loadGoogleAuthScript();
    }

    /**
     * Load the Google Sign-In API script dynamically
     */
    loadGoogleAuthScript() {
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.renderGoogleButton();
        document.head.appendChild(script);
    }

    /**
     * Render the Google Sign-In button
     */
    renderGoogleButton() {
        if (!this.googleClientId) {
            console.error('Google Client ID is not set. Please set it in the AuthSystem constructor.');
            return;
        }

        // Check if the Google Sign-In container exists
        const googleSignInContainer = document.getElementById('google-signin-container');
        if (!googleSignInContainer) return;

        // Initialize Google Sign-In button
        google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: this.handleGoogleSignIn.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Render the button
        google.accounts.id.renderButton(googleSignInContainer, {
            theme: 'outline',
            size: 'large',
            width: googleSignInContainer.offsetWidth,
            text: 'signin_with'
        });
    }

    /**
     * Handle Google sign-in response
     * @param {Object} response - Google sign-in response
     */
    handleGoogleSignIn(response) {
        console.log('Google Sign-In Response:', response);
        
        try {
            // Decode the JWT token
            const payload = this.decodeJwtResponse(response.credential);
            console.log('ID: ' + payload.sub);
            console.log('Full Name: ' + payload.name);
            console.log('Email: ' + payload.email);
            console.log('Picture: ' + payload.picture);
            
            // Extract university from email domain
            const university = this.extractUniversityFromEmail(payload.email);
            
            // Check if this user has logged in before
            let lastLoggedInUser = null;
            try {
                lastLoggedInUser = JSON.parse(localStorage.getItem('lastLoggedInUser'));
            } catch (e) {
                console.error('Error parsing lastLoggedInUser:', e);
            }
            
            // Create user object, preserving the ID if this user has logged in before with the same email
            const user = {
                // For Google sign-in, we'll use the Google ID as the primary identifier
                // but check if there's a previous login with the same email
                id: (lastLoggedInUser && lastLoggedInUser.email === payload.email) ? lastLoggedInUser.id : payload.sub,
                name: payload.name,
                email: payload.email,
                profilePicture: payload.picture,
                university: university,
                department: ''
            };
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authProvider', 'google');
            
            // Also update the lastLoggedInUser to ensure consistency
            localStorage.setItem('lastLoggedInUser', JSON.stringify({
                id: user.id,
                email: user.email
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error handling Google sign-in:', error);
            alert('Error signing in with Google. Please try again.');
        }
    }

    /**
     * Decode JWT token from Google Sign-In
     * @param {string} token - JWT token
     * @returns {Object} Decoded token payload
     */
    decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    /**
     * Extract university name from email domain
     * @param {string} email - User email
     * @returns {string} University name
     */
    extractUniversityFromEmail(email) {
        if (!email) return '';
        
        // Extract domain from email
        const domain = email.split('@')[1];
        if (!domain) return '';
        
        // Map of common university domains to university names
        const universityDomains = {
            'vit.ac.in': 'Vellore Institute of Technology',
            'mit.edu': 'Massachusetts Institute of Technology',
            'stanford.edu': 'Stanford University',
            'harvard.edu': 'Harvard University',
            'berkeley.edu': 'University of California, Berkeley',
            'yale.edu': 'Yale University',
            'princeton.edu': 'Princeton University',
            'columbia.edu': 'Columbia University',
            'cornell.edu': 'Cornell University',
            'nyu.edu': 'New York University',
            'umich.edu': 'University of Michigan',
            'utexas.edu': 'University of Texas',
            'ucla.edu': 'University of California, Los Angeles',
            'uchicago.edu': 'University of Chicago',
            'ox.ac.uk': 'University of Oxford',
            'cam.ac.uk': 'University of Cambridge',
            'iit.ac.in': 'Indian Institute of Technology',
            'iisc.ac.in': 'Indian Institute of Science'
        };
        
        // Check if domain is in our map
        if (universityDomains[domain]) {
            return universityDomains[domain];
        }
        
        // Check if it's an edu domain
        if (domain.endsWith('.edu')) {
            // Convert domain to university name format
            // e.g., 'harvard.edu' -> 'Harvard University'
            const universityPart = domain.split('.')[0];
            return universityPart.charAt(0).toUpperCase() + universityPart.slice(1) + ' University';
        }
        
        // Check if it's an ac.in domain (Indian academic institutions)
        if (domain.endsWith('.ac.in')) {
            const universityPart = domain.split('.')[0];
            return universityPart.toUpperCase();
        }
        
        return '';
    }

    /**
     * Set up event listeners for login/register forms
     */
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
            
            // Add event listener for remember-me checkbox
            const rememberMeCheckbox = document.getElementById('remember-me');
            if (rememberMeCheckbox) {
                // Check if we should pre-check the remember me box based on saved preference
                const rememberMePreference = localStorage.getItem('rememberMe');
                if (rememberMePreference === 'true') {
                    rememberMeCheckbox.checked = true;
                }
            }
        }

        // Registration form submission
        const registerForm = document.getElementById('register-form') || document.getElementById('registration-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegisterSubmit.bind(this));
        }

        // Logout button
        const logoutBtn = document.querySelector('.login-btn');
        if (logoutBtn && logoutBtn.textContent === 'Logout') {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    handleLoginSubmit(e) {
        e.preventDefault();
        
        // Get form elements
        const emailInput = document.getElementById('email') || document.getElementById('login-email');
        const passwordInput = document.getElementById('password') || document.getElementById('login-password');
        const rememberMeCheckbox = document.getElementById('remember-me');
        const errorElement = document.getElementById('login-error');
        const successElement = document.getElementById('login-success');
        const loginButton = e.target.querySelector('button[type="submit"]');
        
        // Reset error and success messages
        if (errorElement) errorElement.style.display = 'none';
        if (successElement) successElement.style.display = 'none';
        
        // Get values
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
        
        // Save remember me preference
        localStorage.setItem('rememberMe', rememberMe);
        
        // Validate email format
        if (!email.includes('@') || !email.includes('.')) {
            if (errorElement) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.style.display = 'block';
            } else {
                alert('Please enter a valid email address');
            }
            return;
        }
        
        // Validate university email
        if (!this.isUniversityEmail(email)) {
            if (errorElement) {
                errorElement.textContent = 'Please use a university email address';
                errorElement.style.display = 'block';
            } else {
                alert('Please use a university email address');
            }
            return;
        }
        
        // Disable login button and show loading state
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
        }
        
        // Simulate server delay
        setTimeout(() => {
            // In a real app, this would send a request to the server
            // For demo purposes, we'll simulate a successful login
            console.log('Login:', { email, password: '********' });
            
            // Extract university name from email domain
            const university = this.extractUniversityFromEmail(email);
            
            // Check if this user has logged in before
            let lastLoggedInUser = null;
            try {
                lastLoggedInUser = JSON.parse(localStorage.getItem('lastLoggedInUser'));
            } catch (e) {
                console.error('Error parsing lastLoggedInUser:', e);
            }
            
            // Create a user object, preserving the ID if this user has logged in before
            const user = {
                id: (lastLoggedInUser && lastLoggedInUser.email === email) ? lastLoggedInUser.id : 'user' + Date.now(),
                name: email.split('@')[0],
                email: email,
                university: university,
                department: ''
            };
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authProvider', 'email');
            
            // Update lastLoggedInUser if remember me is checked
            if (rememberMe) {
                localStorage.setItem('lastLoggedInUser', JSON.stringify({
                    id: user.id,
                    email: user.email
                }));
            }
            
            // Show success message
            if (successElement) {
                successElement.textContent = 'Login successful! Redirecting to dashboard...';
                successElement.style.display = 'block';
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }, 1000);
    }

    /**
     * Handle registration form submission
     * @param {Event} e - Form submit event
     */
    handleRegisterSubmit(e) {
        e.preventDefault();
        
        // Get form elements - check for both possible ID formats
        const nameInput = document.getElementById('full-name') || document.getElementById('register-name');
        const emailInput = document.getElementById('email') || document.getElementById('register-email');
        const universityInput = document.getElementById('university') || document.getElementById('register-university');
        const departmentInput = document.getElementById('department') || document.getElementById('register-department');
        const passwordInput = document.getElementById('password') || document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('confirm-password') || document.getElementById('register-confirm-password');
        const errorElement = document.getElementById('register-error');
        const successElement = document.getElementById('register-success');
        const registerButton = e.target.querySelector('button[type="submit"]');
        
        // Reset error and success messages
        if (errorElement) errorElement.style.display = 'none';
        if (successElement) successElement.style.display = 'none';
        
        // Get values
        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const university = universityInput ? universityInput.value : '';
        const department = departmentInput ? departmentInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        
        // Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            if (errorElement) {
                errorElement.textContent = 'Please fill in all required fields';
                errorElement.style.display = 'block';
            } else {
                alert('Please fill in all required fields');
            }
            return;
        }
        
        // Validate email format
        if (!email.includes('@') || !email.includes('.')) {
            if (errorElement) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.style.display = 'block';
            } else {
                alert('Please enter a valid email address');
            }
            return;
        }
        
        // Validate university email
        if (!this.isUniversityEmail(email)) {
            if (errorElement) {
                errorElement.textContent = 'Please use a university email address';
                errorElement.style.display = 'block';
            } else {
                alert('Please use a university email address');
            }
            return;
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            if (errorElement) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.style.display = 'block';
            } else {
                alert('Passwords do not match');
            }
            return;
        }
        
        // Disable register button and show loading state
        if (registerButton) {
            registerButton.disabled = true;
            registerButton.textContent = 'Creating Account...';
        }
        
        // Simulate server delay
        setTimeout(() => {
            // In a real app, this would send a request to the server
            // For demo purposes, we'll simulate a successful registration
            console.log('Registration:', { name, email, university, department });
            
            // Check if this user has logged in before
            let lastLoggedInUser = null;
            try {
                lastLoggedInUser = JSON.parse(localStorage.getItem('lastLoggedInUser'));
            } catch (e) {
                console.error('Error parsing lastLoggedInUser:', e);
            }
            
            // Create a user object, preserving the ID if this user has logged in before
            const user = {
                id: (lastLoggedInUser && lastLoggedInUser.email === email) ? lastLoggedInUser.id : 'user' + Date.now(),
                name: name,
                email: email,
                university: university,
                department: department
            };
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authProvider', 'email');
            
            // Also update the lastLoggedInUser to ensure consistency
            localStorage.setItem('lastLoggedInUser', JSON.stringify({
                id: user.id,
                email: user.email
            }));
            
            // Show success message
            if (successElement) {
                successElement.textContent = 'Account created successfully! Redirecting to dashboard...';
                successElement.style.display = 'block';
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }, 1000);
    }

    /**
     * Handle user logout
     * @param {Event} e - Click event
     */
    handleLogout(e) {
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
        
        // Clear current user data from localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authProvider');
        
        // Redirect to home page
        window.location.href = 'index.html';
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    /**
     * Get current user data
     * @returns {Object|null} User data or null if not logged in
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Get authentication provider (google, email, etc.)
     * @returns {string|null} Authentication provider or null if not logged in
     */
    getAuthProvider() {
        return localStorage.getItem('authProvider');
    }

    /**
     * Check if email is a university email
     * @param {string} email - Email to check
     * @returns {boolean} True if university email
     */
    isUniversityEmail(email) {
        if (!email || !email.includes('@')) return false;
        
        const domain = email.split('@')[1];
        if (!domain) return false;
        
        // Common personal email domains
        const personalDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
            'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
        ];
        
        // If it's a common personal domain, it's not a university email
        if (personalDomains.includes(domain)) return false;
        
        // Check for common university domain patterns
        if (domain.endsWith('.edu') || 
            domain.endsWith('.ac.in') || 
            domain.endsWith('.ac.uk') || 
            domain.endsWith('.edu.au') || 
            domain.includes('university') || 
            domain.includes('college')) {
            return true;
        }
        
        // For demo purposes, accept all other domains as university emails
        return true;
    }
}

// Initialize authentication system
function initializeAuthSystem() {
    window.authSystem = new AuthSystem();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAuthSystem);

/**
 * Check if there's a lastLoggedInUser and pre-fill the login form
 */
AuthSystem.prototype.checkLastLoggedInUser = function() {
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    // Check if remember me was enabled
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe !== 'true') return;
    
    // Get the last logged in user
    let lastLoggedInUser = null;
    try {
        lastLoggedInUser = JSON.parse(localStorage.getItem('lastLoggedInUser'));
    } catch (e) {
        console.error('Error parsing lastLoggedInUser:', e);
        return;
    }
    
    // If we have a lastLoggedInUser, pre-fill the email field
    if (lastLoggedInUser && lastLoggedInUser.email) {
        const emailInput = document.getElementById('email') || document.getElementById('login-email');
        if (emailInput) {
            emailInput.value = lastLoggedInUser.email;
            
            // Focus on the password field for better UX
            const passwordInput = document.getElementById('password') || document.getElementById('login-password');
            if (passwordInput) {
                passwordInput.focus();
            }
            
            // Show a message to the user
            const successElement = document.getElementById('login-success');
            if (successElement) {
                successElement.textContent = `Welcome back! We've filled in your email for convenience.`;
                successElement.style.display = 'block';
                
                // Hide the message after 5 seconds
                setTimeout(() => {
                    successElement.style.display = 'none';
                }, 5000);
            }
        }
    }
};