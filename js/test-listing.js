/**
 * Test script to create a sample book listing
 * This script can be run in the browser console to create a test book listing
 */

function createTestBookListing() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        console.error('No user logged in. Please log in first.');
        return;
    }
    
    // Get the user ID, ensuring we use the consistent ID that's preserved between logins
    const userId = currentUser.id || currentUser.email;
    
    // Create a test book listing
    const testListing = {
        id: Date.now().toString(),
        userId: userId,
        userName: currentUser.name,
        title: 'Test Book: JavaScript Fundamentals',
        author: 'Jane Developer',
        'course-code': 'CS202',
        department: 'computer-science',
        condition: 'Like New',
        format: 'Hardcover',
        price: '29.99',
        description: 'A comprehensive guide to JavaScript programming. Perfect for beginners and intermediate developers.',
        'listing-type': 'sale',
        imageUrl: 'https://via.placeholder.com/300x180?text=JavaScript+Fundamentals',
        dateAdded: new Date().toISOString(),
        status: 'active'
    };
    
    // Get existing listings from localStorage
    const existingListings = JSON.parse(localStorage.getItem('bookListings')) || [];
    
    // Add the new listing
    existingListings.push(testListing);
    
    // Save back to localStorage
    localStorage.setItem('bookListings', JSON.stringify(existingListings));
    
    console.log('Test book listing created successfully:', testListing);
    console.log('Refresh the page to see the new listing.');
    console.log('This listing will be associated with your account ID:', userId);
}

// Run the function
createTestBookListing();