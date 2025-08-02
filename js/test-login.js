/**
 * Test script to simulate a logged-in user
 * This script can be run in the browser console to create a test user
 */

function createTestUser() {
    // Create a test user
    const testUser = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'testuser@example.com',
        profilePicture: 'https://via.placeholder.com/150?text=Test+User'
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    localStorage.setItem('authProvider', 'test');
    
    // Also save the user ID and email for persistence between logins
    localStorage.setItem('lastLoggedInUser', JSON.stringify({
        id: testUser.id,
        email: testUser.email
    }));
    
    console.log('Test user created and logged in:', testUser);
    console.log('Refresh the page to see the login status update.');
    console.log('User data will be retained for future logins.');
}

// Run the function
createTestUser();