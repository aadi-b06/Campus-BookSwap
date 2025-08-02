# Campus Book Management System

## Overview
The Campus Book Management System is a web application that allows university students to buy, sell, and swap textbooks within their campus community. The system provides a platform for students to list their used textbooks, browse available books, and connect with other students for transactions.

## Features
- User authentication (login/registration with email or Google)
- Book listing management (create, view, edit, delete)
- Browse and search for books
- Filter books by department, condition, price, etc.
- User dashboard to manage listings
- Persistent user accounts and book listings
- Auto-login with "Remember Me" functionality


## Account Persistence and Auto-Login
The system includes persistence features that ensure user account information and associated book listings are retained when users log out and log back in. This means:

1. When a user creates book listings and then logs out, those listings remain associated with their account.
2. When the user logs back in (using the same email), they will see all their previously created listings.
3. This works across different authentication methods (email login, Google sign-in).
4. With the "Remember Me" option enabled, the system will remember the user's email and pre-fill it on the login page.
5. Users who previously logged in with "Remember Me" checked will see a welcome back message when they return to the login page.

## Testing Features

### Using the Test Page
The system includes a dedicated test page for verifying various features:

1. Navigate to test.html
2. Click "Create Test User" to create a test user account
3. Click "Create Test Listing" to create a test book listing
4. Use "Clear LocalStorage" to reset test data when needed

1. Open the browser console (F12 or right-click > Inspect > Console)
2. Run `createTestUser()` to create a test user account
3. Run `createTestBookListing()` to create a test book listing

5. Log out and log back in with the same email to verify persistence

### Method 4: Testing Auto-Login Functionality
The system includes a special test script for the auto-login feature:

1. On the login page, click the "Test Auto-Login" button that appears in the bottom-left corner
2. This will set up a test user and enable the Remember Me option
3. Refresh the page to see the auto-login in action (email pre-filled and welcome message)
4. You can also click the "Test Remember Me" button to pre-fill the login form with test data
5. Use the "Clear Auto-Login Test Data" button (bottom-right) to reset the test

### Method 5: Manual Testing
1. Register or log in with an account, making sure to check the "Remember Me" checkbox
2. Create one or more book listings
3. Log out
4. Return to the login page to see your email pre-filled and a welcome back message
5. Log back in with the same account
6. Navigate to the Dashboard to verify your listings are still there

## Technical Implementation
The persistence and auto-login features work by:

1. Storing a consistent user ID in localStorage
2. Associating book listings with this ID
3. Preserving the ID between login sessions as `lastLoggedInUser`
4. Retrieving the correct listings based on the user ID when the user logs back in
5. Storing the "Remember Me" preference in localStorage
6. Pre-filling the login form with the email from `lastLoggedInUser` when "Remember Me" was enabled
7. Displaying a welcome back message to returning users
8. Ensuring the logout process properly preserves the user ID for listing association

## Data Storage
This demo version uses localStorage for data persistence. In a production environment, this would be replaced with a proper database system.