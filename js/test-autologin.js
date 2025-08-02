/**
 * Test script for the auto-login functionality
 * This script helps test the lastLoggedInUser and Remember Me features
 */

/**
 * Test the auto-login functionality by simulating a user that has previously logged in
 * with the Remember Me option enabled
 */
function testAutoLogin() {
    // Check if we're on the login page
    if (!document.getElementById('login-form')) {
        console.log('Not on login page. This test should be run on the login page.');
        return;
    }
    
    // Create a test user
    const testUser = {
        id: 'test-autologin-' + Date.now(),
        email: 'test-autologin@university.edu',
        name: 'Test AutoLogin User'
    };
    
    // Save the test user as the lastLoggedInUser
    localStorage.setItem('lastLoggedInUser', JSON.stringify({
        id: testUser.id,
        email: testUser.email
    }));
    
    // Enable Remember Me
    localStorage.setItem('rememberMe', 'true');
    
    console.log('Auto-login test data has been set up.');
    console.log('Test user email:', testUser.email);
    console.log('Remember Me enabled:', localStorage.getItem('rememberMe'));
    console.log('Please refresh the page to see the auto-login in action.');
    
    // Add a button to clear the test data
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Auto-Login Test Data';
    clearButton.style.position = 'fixed';
    clearButton.style.bottom = '20px';
    clearButton.style.right = '20px';
    clearButton.style.zIndex = '9999';
    clearButton.style.padding = '10px 15px';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    clearButton.addEventListener('click', function() {
        localStorage.removeItem('lastLoggedInUser');
        localStorage.removeItem('rememberMe');
        console.log('Auto-login test data has been cleared.');
        clearButton.textContent = 'Test Data Cleared';
        clearButton.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            clearButton.remove();
            location.reload();
        }, 1500);
    });
    
    document.body.appendChild(clearButton);
}

/**
 * Test the login persistence by logging in with Remember Me checked
 */
function testLoginWithRememberMe() {
    // Check if we're on the login page
    if (!document.getElementById('login-form')) {
        console.log('Not on login page. This test should be run on the login page.');
        return;
    }
    
    // Fill in the login form
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    
    if (emailInput && passwordInput && rememberMeCheckbox) {
        emailInput.value = 'test-remember-me@university.edu';
        passwordInput.value = 'password123';
        rememberMeCheckbox.checked = true;
        
        console.log('Login form has been filled with test data.');
        console.log('Email:', emailInput.value);
        console.log('Remember Me checked:', rememberMeCheckbox.checked);
        console.log('Please click the Login button to test the Remember Me functionality.');
    } else {
        console.error('Could not find all required form elements.');
    }
}

// Add a test button to the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    if (!document.getElementById('login-form')) return;
    
    // Create a container for the test buttons
    const testContainer = document.createElement('div');
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '20px';
    testContainer.style.left = '20px';
    testContainer.style.zIndex = '9999';
    testContainer.style.display = 'flex';
    testContainer.style.flexDirection = 'column';
    testContainer.style.gap = '10px';
    
    // Create the auto-login test button
    const autoLoginButton = document.createElement('button');
    autoLoginButton.textContent = 'Test Auto-Login';
    autoLoginButton.style.padding = '10px 15px';
    autoLoginButton.style.backgroundColor = '#2196F3';
    autoLoginButton.style.color = 'white';
    autoLoginButton.style.border = 'none';
    autoLoginButton.style.borderRadius = '4px';
    autoLoginButton.style.cursor = 'pointer';
    autoLoginButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    autoLoginButton.addEventListener('click', testAutoLogin);
    
    // Create the remember me test button
    const rememberMeButton = document.createElement('button');
    rememberMeButton.textContent = 'Test Remember Me';
    rememberMeButton.style.padding = '10px 15px';
    rememberMeButton.style.backgroundColor = '#4CAF50';
    rememberMeButton.style.color = 'white';
    rememberMeButton.style.border = 'none';
    rememberMeButton.style.borderRadius = '4px';
    rememberMeButton.style.cursor = 'pointer';
    rememberMeButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    rememberMeButton.addEventListener('click', testLoginWithRememberMe);
    
    // Add buttons to the container
    testContainer.appendChild(autoLoginButton);
    testContainer.appendChild(rememberMeButton);
    
    // Add the container to the page
    document.body.appendChild(testContainer);
    
    // Check if there's a test parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'autologin') {
        // Automatically run the auto-login test
        setTimeout(testAutoLogin, 1000);
    } else if (urlParams.get('test') === 'rememberme') {
        // Automatically run the remember me test
        setTimeout(testLoginWithRememberMe, 1000);
    }
});