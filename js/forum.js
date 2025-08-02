/**
 * Community Forum System for Campus BookSwap
 * Provides discussion boards for study resources, textbook reviews, subject help, and general advice
 */

class ForumSystem {
    constructor() {
        this.categories = [
            { id: 'study-resources', name: 'Study Resources', icon: 'fa-book-open' },
            { id: 'textbook-reviews', name: 'Textbook Reviews', icon: 'fa-star' },
            { id: 'subject-help', name: 'Subject Help', icon: 'fa-question-circle' },
            { id: 'general-advice', name: 'General Advice', icon: 'fa-lightbulb' }
        ];
        
        this.posts = this.loadPostsFromStorage() || this.getDummyPosts();
        this.currentUser = this.getCurrentUser();
        
        // Initialize the forum system
        this.initForumSystem();
    }
    
    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }
    
    /**
     * Load posts from localStorage
     */
    loadPostsFromStorage() {
        const postsJson = localStorage.getItem('bookswap_forum_posts');
        return postsJson ? JSON.parse(postsJson) : null;
    }
    
    /**
     * Save posts to localStorage
     */
    savePostsToStorage() {
        localStorage.setItem('bookswap_forum_posts', JSON.stringify(this.posts));
    }
    
    /**
     * Initialize the forum system
     */
    initForumSystem() {
        // Add event listeners for forum interactions
        this.addEventListeners();
    }
    
    /**
     * Add event listeners for forum interactions
     */
    addEventListeners() {
        // Listen for new post form submissions
        const newPostForm = document.getElementById('new-post-form');
        if (newPostForm) {
            newPostForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewPost(newPostForm);
            });
        }
        
        // Listen for category filter changes
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const categoryId = filter.dataset.category;
                this.filterPostsByCategory(categoryId);
            });
        });
    }
    
    /**
     * Create a new forum post
     */
    createNewPost(form) {
        if (!this.currentUser) {
            alert('Please log in to create a post');
            return;
        }
        
        const title = form.querySelector('#post-title').value.trim();
        const content = form.querySelector('#post-content').value.trim();
        const category = form.querySelector('#post-category').value;
        
        if (!title || !content || !category) {
            alert('Please fill in all fields');
            return;
        }
        
        const newPost = {
            id: 'post_' + Date.now(),
            title: title,
            content: content,
            category: category,
            author: {
                id: this.currentUser.id,
                name: this.currentUser.name,
                avatar: this.currentUser.avatar || null
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        // Add the new post to the posts array
        this.posts.unshift(newPost);
        
        // Save to localStorage
        this.savePostsToStorage();
        
        // Reset the form
        form.reset();
        
        // Refresh the posts display
        this.displayPosts();
        
        // Show success message
        alert('Your post has been created successfully!');
    }
    
    /**
     * Add a comment to a post
     */
    addComment(postId, commentText) {
        if (!this.currentUser) {
            alert('Please log in to comment');
            return;
        }
        
        if (!commentText.trim()) {
            alert('Please enter a comment');
            return;
        }
        
        // Find the post
        const postIndex = this.posts.findIndex(post => post.id === postId);
        if (postIndex === -1) return;
        
        const newComment = {
            id: 'comment_' + Date.now(),
            content: commentText.trim(),
            author: {
                id: this.currentUser.id,
                name: this.currentUser.name,
                avatar: this.currentUser.avatar || null
            },
            createdAt: new Date().toISOString(),
            likes: 0
        };
        
        // Add the comment to the post
        this.posts[postIndex].comments.push(newComment);
        
        // Update the post's updatedAt timestamp
        this.posts[postIndex].updatedAt = new Date().toISOString();
        
        // Save to localStorage
        this.savePostsToStorage();
        
        // Refresh the post display
        this.displayPostDetails(postId);
    }
    
    /**
     * Like a post
     */
    likePost(postId) {
        if (!this.currentUser) {
            alert('Please log in to like posts');
            return;
        }
        
        // Find the post
        const postIndex = this.posts.findIndex(post => post.id === postId);
        if (postIndex === -1) return;
        
        // Increment the likes count
        this.posts[postIndex].likes += 1;
        
        // Save to localStorage
        this.savePostsToStorage();
        
        // Update the likes display
        const likesElement = document.querySelector(`#post-${postId} .post-likes-count`);
        if (likesElement) {
            likesElement.textContent = this.posts[postIndex].likes;
        }
    }
    
    /**
     * Filter posts by category
     */
    filterPostsByCategory(categoryId) {
        const postsContainer = document.getElementById('forum-posts');
        if (!postsContainer) return;
        
        // Update active category filter
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            if (filter.dataset.category === categoryId) {
                filter.classList.add('active');
            } else {
                filter.classList.remove('active');
            }
        });
        
        // Filter and display posts
        if (categoryId === 'all') {
            this.displayPosts();
        } else {
            const filteredPosts = this.posts.filter(post => post.category === categoryId);
            this.displayPosts(filteredPosts);
        }
    }
    
    /**
     * Display all forum posts or filtered posts
     */
    displayPosts(postsToDisplay = this.posts) {
        const postsContainer = document.getElementById('forum-posts');
        if (!postsContainer) return;
        
        if (postsToDisplay.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-posts">
                    <i class="fas fa-comments"></i>
                    <p>No posts yet. Be the first to start a discussion!</p>
                </div>
            `;
            return;
        }
        
        // Sort posts by date (newest first)
        const sortedPosts = [...postsToDisplay].sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        
        let html = '';
        
        sortedPosts.forEach(post => {
            const category = this.categories.find(cat => cat.id === post.category);
            const categoryName = category ? category.name : 'Uncategorized';
            const categoryIcon = category ? category.icon : 'fa-folder';
            
            const date = new Date(post.createdAt);
            const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            
            html += `
                <div class="forum-post" id="post-${post.id}">
                    <div class="post-header">
                        <div class="post-category">
                            <i class="fas ${categoryIcon}"></i>
                            <span>${categoryName}</span>
                        </div>
                        <h3 class="post-title">${post.title}</h3>
                    </div>
                    <div class="post-meta">
                        <div class="post-author">
                            <div class="author-avatar">
                                ${post.author.avatar ? 
                                    `<img src="${post.author.avatar}" alt="${post.author.name}">` : 
                                    `<div class="avatar-placeholder">${post.author.name.charAt(0)}</div>`
                                }
                            </div>
                            <span>${post.author.name}</span>
                        </div>
                        <div class="post-date">${formattedDate}</div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="post-like-btn" onclick="forumSystem.likePost('${post.id}')">
                            <i class="far fa-heart"></i>
                            <span class="post-likes-count">${post.likes}</span>
                        </button>
                        <button class="post-comment-btn" onclick="forumSystem.displayPostDetails('${post.id}')">
                            <i class="far fa-comment"></i>
                            <span>${post.comments.length}</span>
                        </button>
                    </div>
                </div>
            `;
        });
        
        postsContainer.innerHTML = html;
    }
    
    /**
     * Display post details with comments
     */
    displayPostDetails(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const postDetailsContainer = document.getElementById('post-details-container');
        if (!postDetailsContainer) return;
        
        const category = this.categories.find(cat => cat.id === post.category);
        const categoryName = category ? category.name : 'Uncategorized';
        const categoryIcon = category ? category.icon : 'fa-folder';
        
        const date = new Date(post.createdAt);
        const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        
        let html = `
            <div class="post-details">
                <div class="post-details-header">
                    <button class="back-to-posts-btn" onclick="forumSystem.backToPostsList()">
                        <i class="fas fa-arrow-left"></i> Back to Posts
                    </button>
                    <div class="post-category">
                        <i class="fas ${categoryIcon}"></i>
                        <span>${categoryName}</span>
                    </div>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">
                            ${post.author.avatar ? 
                                `<img src="${post.author.avatar}" alt="${post.author.name}">` : 
                                `<div class="avatar-placeholder">${post.author.name.charAt(0)}</div>`
                            }
                        </div>
                        <span>${post.author.name}</span>
                    </div>
                    <div class="post-date">${formattedDate}</div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="post-like-btn" onclick="forumSystem.likePost('${post.id}')">
                        <i class="far fa-heart"></i>
                        <span class="post-likes-count">${post.likes}</span>
                    </button>
                    <span class="comments-count">
                        <i class="far fa-comment"></i>
                        <span>${post.comments.length} Comments</span>
                    </span>
                </div>
                
                <div class="comments-section">
                    <h3>Comments</h3>
                    <div class="comments-list">
        `;
        
        if (post.comments.length === 0) {
            html += `
                <div class="empty-comments">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
        } else {
            // Sort comments by date (newest first)
            const sortedComments = [...post.comments].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            sortedComments.forEach(comment => {
                const commentDate = new Date(comment.createdAt);
                const formattedCommentDate = `${commentDate.toLocaleDateString()} at ${commentDate.toLocaleTimeString()}`;
                
                html += `
                    <div class="comment" id="comment-${comment.id}">
                        <div class="comment-meta">
                            <div class="comment-author">
                                <div class="author-avatar">
                                    ${comment.author.avatar ? 
                                        `<img src="${comment.author.avatar}" alt="${comment.author.name}">` : 
                                        `<div class="avatar-placeholder">${comment.author.name.charAt(0)}</div>`
                                    }
                                </div>
                                <span>${comment.author.name}</span>
                            </div>
                            <div class="comment-date">${formattedCommentDate}</div>
                        </div>
                        <div class="comment-content">${comment.content}</div>
                        <div class="comment-actions">
                            <button class="comment-like-btn" onclick="forumSystem.likeComment('${post.id}', '${comment.id}')">
                                <i class="far fa-heart"></i>
                                <span>${comment.likes}</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                    </div>
                    
                    <div class="add-comment-form">
                        <h4>Add a Comment</h4>
                        <form id="comment-form-${post.id}">
                            <textarea id="comment-text-${post.id}" placeholder="Write your comment here..." required></textarea>
                            <button type="submit" class="submit-comment-btn">Post Comment</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Hide posts list and show post details
        const postsListContainer = document.getElementById('forum-posts-container');
        if (postsListContainer) {
            postsListContainer.style.display = 'none';
        }
        
        postDetailsContainer.innerHTML = html;
        postDetailsContainer.style.display = 'block';
        
        // Add event listener for comment form
        const commentForm = document.getElementById(`comment-form-${post.id}`);
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const commentText = document.getElementById(`comment-text-${post.id}`).value;
                this.addComment(post.id, commentText);
            });
        }
    }
    
    /**
     * Go back to posts list from post details
     */
    backToPostsList() {
        const postsListContainer = document.getElementById('forum-posts-container');
        const postDetailsContainer = document.getElementById('post-details-container');
        
        if (postsListContainer && postDetailsContainer) {
            postDetailsContainer.style.display = 'none';
            postsListContainer.style.display = 'block';
        }
    }
    
    /**
     * Like a comment
     */
    likeComment(postId, commentId) {
        if (!this.currentUser) {
            alert('Please log in to like comments');
            return;
        }
        
        // Find the post and comment
        const postIndex = this.posts.findIndex(post => post.id === postId);
        if (postIndex === -1) return;
        
        const commentIndex = this.posts[postIndex].comments.findIndex(comment => comment.id === commentId);
        if (commentIndex === -1) return;
        
        // Increment the likes count
        this.posts[postIndex].comments[commentIndex].likes += 1;
        
        // Save to localStorage
        this.savePostsToStorage();
        
        // Update the likes display
        const likesElement = document.querySelector(`#comment-${commentId} .comment-like-btn span`);
        if (likesElement) {
            likesElement.textContent = this.posts[postIndex].comments[commentIndex].likes;
        }
    }
    
    /**
     * Generate forum categories HTML
     */
    generateCategoriesHTML() {
        let html = `
            <div class="forum-categories">
                <div class="category-filter active" data-category="all">
                    <i class="fas fa-th-list"></i>
                    <span>All Categories</span>
                </div>
        `;
        
        this.categories.forEach(category => {
            html += `
                <div class="category-filter" data-category="${category.id}">
                    <i class="fas ${category.icon}"></i>
                    <span>${category.name}</span>
                </div>
            `;
        });
        
        html += `</div>`;
        
        return html;
    }
    
    /**
     * Generate new post form HTML
     */
    generateNewPostFormHTML() {
        let html = `
            <div class="new-post-container">
                <h3>Create a New Post</h3>
                <form id="new-post-form">
                    <div class="form-group">
                        <label for="post-title">Title</label>
                        <input type="text" id="post-title" placeholder="Enter a title for your post" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="post-category">Category</label>
                        <select id="post-category" required>
        `;
        
        this.categories.forEach(category => {
            html += `<option value="${category.id}">${category.name}</option>`;
        });
        
        html += `
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="post-content">Content</label>
                        <textarea id="post-content" placeholder="Write your post here..." rows="6" required></textarea>
                    </div>
                    
                    <button type="submit" class="submit-post-btn">Create Post</button>
                </form>
            </div>
        `;
        
        return html;
    }
    
    /**
     * Generate the complete forum page HTML
     */
    generateForumPageHTML(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = `
            <div class="forum-container">
                <div class="forum-header">
                    <h2>Community Forum</h2>
                    <p>Connect with fellow students, share resources, and get help with your studies</p>
                </div>
                
                <div class="forum-main">
                    <div class="forum-sidebar">
                        ${this.generateCategoriesHTML()}
                        ${this.generateNewPostFormHTML()}
                    </div>
                    
                    <div class="forum-content">
                        <div id="forum-posts-container">
                            <div class="posts-header">
                                <h3>Recent Discussions</h3>
                                <div class="posts-filter">
                                    <label for="posts-sort">Sort by:</label>
                                    <select id="posts-sort">
                                        <option value="newest">Newest</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="comments">Most Comments</option>
                                    </select>
                                </div>
                            </div>
                            <div id="forum-posts"></div>
                        </div>
                        
                        <div id="post-details-container" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Display posts
        this.displayPosts();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Get dummy posts for demo purposes
     */
    getDummyPosts() {
        return [
            {
                id: 'post_1',
                title: 'Best resources for Calculus I?',
                content: 'I\'m struggling with Calculus I this semester. Can anyone recommend some good online resources or textbooks that helped you understand the concepts better?',
                category: 'study-resources',
                author: {
                    id: 'user_1',
                    name: 'Alex Johnson',
                    avatar: null
                },
                createdAt: '2023-04-10T14:30:00Z',
                updatedAt: '2023-04-10T14:30:00Z',
                likes: 12,
                comments: [
                    {
                        id: 'comment_1',
                        content: 'I found Khan Academy really helpful for Calculus. They have great video explanations and practice problems.',
                        author: {
                            id: 'user_2',
                            name: 'Sarah Williams',
                            avatar: null
                        },
                        createdAt: '2023-04-10T15:45:00Z',
                        likes: 5
                    },
                    {
                        id: 'comment_2',
                        content: 'The "Calculus: Early Transcendentals" by James Stewart is a great textbook with lots of examples.',
                        author: {
                            id: 'user_3',
                            name: 'Michael Brown',
                            avatar: null
                        },
                        createdAt: '2023-04-10T16:20:00Z',
                        likes: 3
                    }
                ]
            },
            {
                id: 'post_2',
                title: 'Review: Introduction to Computer Science textbook',
                content: 'I just finished the semester using "Introduction to Computer Science" by John Smith. Here\'s my honest review: The book covers all the basics well, but some of the examples are outdated. The practice problems at the end of each chapter are really helpful though. Overall, I\'d give it 4/5 stars.',
                category: 'textbook-reviews',
                author: {
                    id: 'user_4',
                    name: 'Emily Davis',
                    avatar: null
                },
                createdAt: '2023-04-08T10:15:00Z',
                updatedAt: '2023-04-09T08:30:00Z',
                likes: 8,
                comments: [
                    {
                        id: 'comment_3',
                        content: 'I agree about the outdated examples. I wish they would update it with more modern programming languages.',
                        author: {
                            id: 'user_5',
                            name: 'David Wilson',
                            avatar: null
                        },
                        createdAt: '2023-04-08T11:30:00Z',
                        likes: 2
                    }
                ]
            },
            {
                id: 'post_3',
                title: 'Help with Organic Chemistry synthesis problems',
                content: 'I\'m really struggling with the synthesis problems in my Organic Chemistry class. Does anyone have tips on how to approach these types of problems? Or maybe know of a good tutor on campus?',
                category: 'subject-help',
                author: {
                    id: 'user_6',
                    name: 'Jessica Martinez',
                    avatar: null
                },
                createdAt: '2023-04-05T09:45:00Z',
                updatedAt: '2023-04-07T13:20:00Z',
                likes: 15,
                comments: [
                    {
                        id: 'comment_4',
                        content: 'The key is to work backwards from the target molecule. I found this approach really helpful. There\'s a great tutor named Dr. Roberts in the Chemistry department who holds weekly study sessions.',
                        author: {
                            id: 'user_7',
                            name: 'Ryan Thompson',
                            avatar: null
                        },
                        createdAt: '2023-04-05T10:30:00Z',
                        likes: 7
                    },
                    {
                        id: 'comment_5',
                        content: 'I have some good notes and practice problems I can share with you. DM me and I\'ll send them over.',
                        author: {
                            id: 'user_8',
                            name: 'Sophia Lee',
                            avatar: null
                        },
                        createdAt: '2023-04-06T14:15:00Z',
                        likes: 4
                    },
                    {
                        id: 'comment_6',
                        content: 'Check out "Organic Chemistry as a Second Language" by David Klein. It really helped me understand synthesis problems.',
                        author: {
                            id: 'user_9',
                            name: 'Daniel Garcia',
                            avatar: null
                        },
                        createdAt: '2023-04-07T13:20:00Z',
                        likes: 6
                    }
                ]
            },
            {
                id: 'post_4',
                title: 'Tips for balancing work and study?',
                content: 'I\'m working part-time while taking a full course load this semester. Any advice on how to balance work and study effectively? I\'m finding it hard to keep up with assignments.',
                category: 'general-advice',
                author: {
                    id: 'user_10',
                    name: 'James Wilson',
                    avatar: null
                },
                createdAt: '2023-04-03T16:00:00Z',
                updatedAt: '2023-04-04T11:45:00Z',
                likes: 20,
                comments: [
                    {
                        id: 'comment_7',
                        content: 'Time blocking has been a lifesaver for me. I schedule specific hours for work, study, and relaxation, and try to stick to it as much as possible.',
                        author: {
                            id: 'user_11',
                            name: 'Olivia Taylor',
                            avatar: null
                        },
                        createdAt: '2023-04-03T17:30:00Z',
                        likes: 9
                    },
                    {
                        id: 'comment_8',
                        content: 'Talk to your professors about your situation. Many are understanding and might give you some flexibility with deadlines if needed.',
                        author: {
                            id: 'user_12',
                            name: 'Ethan Anderson',
                            avatar: null
                        },
                        createdAt: '2023-04-04T09:15:00Z',
                        likes: 7
                    },
                    {
                        id: 'comment_9',
                        content: 'Try to find a job on campus if possible. They\'re usually more flexible with student schedules and you save commute time.',
                        author: {
                            id: 'user_13',
                            name: 'Ava Robinson',
                            avatar: null
                        },
                        createdAt: '2023-04-04T11:45:00Z',
                        likes: 5
                    }
                ]
            }
        ];
    }
}

// Initialize forum system when the script is loaded
window.forumSystem = null;

// Function to initialize forum system
function initializeForumSystem() {
    window.forumSystem = new ForumSystem();
}

// Initialize forum system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when forum tab is clicked
    const forumTabButton = document.querySelector('.tab-button[data-tab="forum"]');
    if (forumTabButton) {
        forumTabButton.addEventListener('click', () => {
            // Initialize forum system if not already initialized
            if (!window.forumSystem) {
                initializeForumSystem();
            }
        });
    }
});