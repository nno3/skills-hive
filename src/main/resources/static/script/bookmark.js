// Toggle bookmark for a course
function toggleBookmark(button) {
    const courseId = button.getAttribute('data-course-id');
    const icon = button.querySelector('i');

    console.log('Attempting to toggle bookmark for course ID:', courseId);

    // Get CSRF token
    const token = document.querySelector("meta[name='_csrf']").content;
    const header = document.querySelector("meta[name='_csrf_header']").content;

    fetch('/toggle-bookmark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [header]: token
        },
        body: 'courseId=' + courseId
    })
        .then(response => {
            console.log('Response status:', response.status);
            return response.text().then(text => {
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${text}`);
                }
                return text;
            });
        })
        .then(result => {
            console.log('Server response:', result);

            if (result === 'added') {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#FFD700';
                console.log('Bookmark added successfully');
                updateBookmarkPreview();
            } else if (result === 'removed') {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '#666';
                console.log('Bookmark removed successfully');
                updateBookmarkPreview();
            } else {
                throw new Error('Unexpected response: ' + result);
            }
        })
        .catch(error => {
            console.error('Error toggling bookmark:', error);
            alert('Failed to update bookmark: ' + error.message);
        });
}

// ... rest of your bookmark.js code remains the same ...
// Function to update the bookmark preview
function updateBookmarkPreview() {
    const previewList = document.getElementById('bookmark-preview-list');
    if (!previewList) return;

    fetch('/get-bookmarks-preview')
        .then(response => response.json())
        .then(bookmarks => {
            console.log('Fetched bookmarks:', bookmarks);
            previewList.innerHTML = '';

            if (bookmarks && bookmarks.length > 0) {
                bookmarks.forEach(bookmark => {
                    const listItem = document.createElement('li');
                    listItem.className = 'preview-item';
                    listItem.onclick = () => window.location.href = bookmark.course.url;

                    const thumbnail = document.createElement('img');
                    thumbnail.src = bookmark.course.thumbnail;
                    thumbnail.alt = "Course Thumbnail";
                    thumbnail.className = 'preview-thumbnail';

                    const title = document.createElement('span');
                    title.className = 'preview-title';
                    title.textContent = bookmark.course.title;

                    listItem.appendChild(thumbnail);
                    listItem.appendChild(title);
                    previewList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.className = 'no-bookmarks';
                listItem.textContent = 'No bookmarks yet';
                previewList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error('Error updating preview:', error);
            previewList.innerHTML = '<li class="no-bookmarks">Error loading bookmarks</li>';
        });
}
// Show bookmark preview only on specific pages
function showBookmarkPreview() {
    // Get the current page path
    const currentPath = window.location.pathname;

    // Only show preview on course and dashboard pages
    if (currentPath === '/course' || currentPath === '/dashboard' || currentPath === '/edit-profile' || currentPath === '/leaderboard' || currentPath === '/learning-history' || currentPath === '/profile/learning-history' || currentPath === '/friends' || currentPath === '/profile' || currentPath === '/profile-home' || currentPath === '/hexahive') {
        const previewElement = document.getElementById("bookmark-preview");
        if (previewElement) {
            console.log('Showing bookmark preview');
            previewElement.style.display = 'block';
            updateBookmarkPreview();
        }
    }
}

// Hide bookmark preview
function hideBookmarkPreview() {
    // Get the current page path
    const currentPath = window.location.pathname;

    // Only handle preview on course and dashboard pages
    if (currentPath === '/course' || currentPath === '/dashboard' || currentPath === '/profile' || currentPath === '/profile/learning-history' || currentPath === '/friends' || currentPath === '/leaderboard' || currentPath === '/hexahive') {
        const previewElement = document.getElementById("bookmark-preview");
        if (previewElement) {
            console.log('Hiding bookmark preview');
            previewElement.style.display = 'none';
        }
    }
}
// Function to redirect to bookmarks page
function redirectToBookmarks() {
    window.location.href = '/bookmarks.html';
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bookmark page loaded, initializing components');

    // Initialize bookmark buttons
    initializeBookmarkButtons();
    
    // Initialize preview if we're on a page with the preview element
    if (document.getElementById('bookmark-preview')) {
        updateBookmarkPreview();
    }
    
    // Attach event listeners to "Start Learning" buttons
    if (document.querySelector('.start-learning-btn') || document.querySelector('.start-learning-button')) {
        attachCourseCompletionTracking();
    }
    
    // Add review buttons to all course cards if we're on the bookmarks page
    if (isBookmarksPage()) {
        addReviewButtonsToCourseCards();
        
        // On bookmarks page, ensure bookmark buttons show bookmarked state
        const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
        bookmarkButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#FFD700';
            }
        });
    }
    
    // Check for course completion popup
    checkForCourseCompletion();
});

// Update when navigating back to the page (browser back button)
window.addEventListener('pageshow', function(event) {
    // Only execute if navigating through history (back button)
    if (event.persisted) {
        console.log('Page was loaded from cache, updating review buttons');
        addReviewButtonsToCourseCards();
    }
});

// Check if we're on the bookmarks page
function isBookmarksPage() {
    return window.location.pathname.includes('/bookmarks') || 
           document.title.includes('Bookmarked Courses');
}

// Initialize bookmark buttons with correct state from server
function initializeBookmarkButtons() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    console.log('Found bookmark buttons:', bookmarkButtons.length); // Debug log

    if (bookmarkButtons.length === 0) {
        console.log('No bookmark buttons found on this page');
        return;
    }

    bookmarkButtons.forEach(button => {
        const courseId = button.getAttribute('data-course-id');
        if (!courseId) {
            console.error('Bookmark button missing data-course-id attribute');
            return;
        }

        const icon = button.querySelector('i');
        if (!icon) {
            console.error('Bookmark button missing icon element');
            return;
        }

        // Check with the server if this course is already bookmarked
        fetch('/check-bookmark?courseId=' + courseId)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server returned status: ${response.status}`);
                }
                return response.text();
            })
            .then(result => {
                console.log('Check bookmark result for course', courseId, ':', result); // Debug log
                if (result === 'true') {
                    // This course is bookmarked, use filled icon
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#FFD700';
                } else {
                    // This course is not bookmarked, use outline icon
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '#666';
                }
            })
            .catch(error => {
                console.error('Error checking bookmark status:', error);
            });
    });
}

// Attach event listeners to "Start Learning" buttons
function attachCourseCompletionTracking() {
    // Look for both button classes to ensure compatibility with all pages
    const startButtons = document.querySelectorAll(".start-learning-btn:not([data-handler-attached]), .start-learning-button:not([data-handler-attached])");
    console.log('Found start learning buttons:', startButtons.length); // Debug log
    
    startButtons.forEach(button => {
        button.addEventListener("click", handleStartLearning);
        button.setAttribute('data-handler-attached', 'true');
        console.log('Attached event listener to button:', button);
    });
}

// Handle start learning button click - stores course session data
function handleStartLearning(e) {
    e.preventDefault();

    const courseCard = this.closest(".course-card");
    const courseUrl = this.getAttribute("href");
    
    // Try different methods to get the courseId to ensure compatibility with all pages
    let courseId = courseCard.dataset.courseId;
    
    // If we couldn't get courseId from the card directly, try to get it from the bookmark button
    if (!courseId) {
        const bookmarkBtn = courseCard.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            courseId = bookmarkBtn.getAttribute('data-course-id');
        }
    }

    if (!courseId) {
        console.error("No course ID found for this course");
        return;
    }

    console.log(`Starting course with ID: ${courseId} from bookmark page`);
    const startTime = new Date().toISOString();
    const sessionData = { courseId, startTime, courseUrl };
    localStorage.setItem("currentCourseSession", JSON.stringify(sessionData));

    window.location.href = courseUrl;
}

// Check if there's an active course session and show completion popup
function checkForCourseCompletion() {
    const sessionDataStr = localStorage.getItem("currentCourseSession");
    if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        showConfirmationPopup(sessionData);
    }
}

// Show popup asking if the user completed the course
function showConfirmationPopup(sessionData) {
    if (document.getElementById("confirmation-modal-overlay")) return;

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "confirmation-modal-overlay";
    Object.assign(modalOverlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
    });

    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <span id="confirmation-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Course Completion</h2>
        <p style="margin-bottom: 20px;">Have you completed the course?</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <button id="confirmation-yes" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Yes</button>
            <button id="confirmation-no" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">No</button>
        </div>
    `;

    Object.assign(modalContent.style, {
        position: "relative",
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        textAlign: "center",
        width: "90%",
        maxWidth: "400px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    });

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", (event) => {
        if (event.target.id === "confirmation-close" || event.target.id === "confirmation-no") {
            localStorage.removeItem("currentCourseSession");
            document.body.removeChild(modalOverlay);

            if (event.target.id === "confirmation-no") {
                // Save the course as in progress
                fetch(`/api/course-in-progress/${sessionData.courseId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                throw new Error(text || "Failed to save course in progress");
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log("Course saved as in progress:", data);
                        // We don't reload here to avoid disrupting the bookmarks view
                    })
                    .catch(error => {
                        console.error("Error saving course in progress:", error);
                    });
            }
        } else if (event.target.id === "confirmation-yes") {
            document.body.removeChild(modalOverlay);
            showCompletionPopup(sessionData);
        }
    });
}

// Show completion popup with time selection
function showCompletionPopup(sessionData) {
    if (document.getElementById("completion-modal-overlay")) return;

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "completion-modal-overlay";
    Object.assign(modalOverlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
    });

    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <span id="completion-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Course Completion</h2>
        <p style="margin-bottom: 20px;">Please confirm that you have completed the course and select the time it took:</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <div style="flex: 1; text-align: center;">
                <label for="completion-hours" style="display: block; margin-bottom: 5px;">Hours</label>
                <select id="completion-hours" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></select>
            </div>
            <div style="flex: 1; text-align: center;">
                <label for="completion-minutes" style="display: block; margin-bottom: 5px;">Minutes</label>
                <select id="completion-minutes" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></select>
            </div>
        </div>
        <button id="completion-submit" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit</button>
    `;

    Object.assign(modalContent.style, {
        position: "relative",
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        textAlign: "center",
        width: "90%",
        maxWidth: "400px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    });

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Populate the hours dropdown (0 to 40 hours)
    const hoursSelect = document.getElementById("completion-hours");
    for (let i = 0; i <= 40; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        hoursSelect.appendChild(option);
    }

    // Populate the minutes dropdown (0 to 59 minutes)
    const minutesSelect = document.getElementById("completion-minutes");
    for (let i = 0; i < 60; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        minutesSelect.appendChild(option);
    }

    modalOverlay.addEventListener("click", function(event) {
        if (event.target.id === "completion-close") {
            localStorage.removeItem("currentCourseSession");
            document.body.removeChild(modalOverlay);
            return;
        }

        if (event.target.id === "completion-submit") {
            const hours = parseInt(document.getElementById("completion-hours").value, 10);
            const minutes = parseInt(document.getElementById("completion-minutes").value, 10);

            const completionData = {
                courseId: Number(sessionData.courseId),
                startTime: sessionData.startTime,
                completionTime: new Date().toISOString(),
                durationHours: hours,
                durationMinutes: minutes
            };

            fetch("/api/course-completion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(completionData)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(text || "Failed to save course completion data.");
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Course completion saved:", data);
                    localStorage.removeItem("currentCourseSession");
                    document.body.removeChild(modalOverlay);

                    // Show the ratings modal after completion
                    showRatingsModal(sessionData.courseId);
                })
                .catch(error => {
                    console.error("Error saving completion data:", error);
                    alert(`Error: ${error.message || "There was an error saving your course completion. Please try again."}`);
                });
        }
    });
}

// Show ratings modal after course completion
function showRatingsModal(courseId) {
    if (document.getElementById("ratings-modal-overlay")) return;

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "ratings-modal-overlay";
    Object.assign(modalOverlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
    });

    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <span id="ratings-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Rate the Course</h2>
        <p style="margin-bottom: 20px;">How would you rate this course?</p>
        <div style="margin-bottom: 20px;">
            <label for="rating">Rating (1-5):</label>
            <select id="rating" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
            </select>
        </div>
        <div style="margin-bottom: 20px;">
            <label for="comment">Comment:</label>
            <textarea id="comment" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" rows="4"></textarea>
        </div>
        <button id="ratings-submit" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit</button>
    `;

    Object.assign(modalContent.style, {
        position: "relative",
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        textAlign: "center",
        width: "90%",
        maxWidth: "400px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    });

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", async (event) => {
        if (event.target.id === "ratings-close") {
            document.body.removeChild(modalOverlay);
        } else if (event.target.id === "ratings-submit") {
            const rating = parseInt(document.getElementById("rating").value, 10);
            const comment = document.getElementById("comment").value;

            const ratingsData = {
                rating: rating,
                comment: comment
            };

            try {
                const response = await fetch(`/api/courses/${courseId}/reviews`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ratingsData)
                });

                if (!response.ok) {
                    throw new Error("Failed to save ratings data.");
                }

                const data = await response.json();
                console.log("Ratings saved:", data);
                document.body.removeChild(modalOverlay);
                showNotification("Thank you for your feedback!");

                // Force refresh all review buttons to show the updated reviews
                addReviewButtonsToCourseCards();

                // Show the updated reviews if desired
                setTimeout(() => {
                    showReviewsModal(courseId);
                }, 500);

            } catch (error) {
                console.error("Error saving ratings data:", error);
                alert("There was an error saving your feedback. Please try again.");
            }
        }
    });
}

// Add review buttons to course cards
async function addReviewButtonsToCourseCards() {
    console.log('Adding review buttons to course cards on bookmarks page');
    const courseCards = document.querySelectorAll('.course-card');
    
    // Create an array of promises for parallel processing
    const promises = Array.from(courseCards).map(async (card) => {
        // Get course ID from bookmark button
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        const courseId = bookmarkBtn?.getAttribute('data-course-id');
        
        if (!courseId) {
            console.warn('Could not find course ID for card:', card);
            return;
        }

        try {
            // Fetch reviews to calculate average rating
            const reviews = await fetchReviewsForCourse(courseId);
            const reviewCount = reviews.length;
            const averageRating = calculateAverageRating(reviews);
            
            console.log(`Course ${courseId} has ${reviewCount} reviews with avg rating ${averageRating}`);

            // Get or create the card actions container
            const cardActions = card.querySelector('.card-actions');
            if (!cardActions) {
                console.warn(`No .card-actions found for course ${courseId}`);
                return;
            }

            // Get or create review button
            let reviewButton = cardActions.querySelector('.review-button');
            if (!reviewButton) {
                // Create new review button
                reviewButton = document.createElement('button');
                reviewButton.className = 'review-button';
                reviewButton.setAttribute('data-course-id', courseId);

                // Add after Start Learning button
                cardActions.appendChild(reviewButton);
            }

            // Update button content
            reviewButton.innerHTML = `
                <div class="star-rating">
                    ${renderStars(averageRating)}
                </div>
                <span class="review-count">${reviewCount} ${reviewCount !== 1 ? 'Reviews' : 'Review'}</span>
            `;
            
            // Add click handler if not already attached
            if (!reviewButton.getAttribute('data-handler-attached')) {
                reviewButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    showReviewsModal(courseId);
                });
                reviewButton.setAttribute('data-handler-attached', 'true');
            }
        } catch (error) {
            console.error(`Error adding review button for course ${courseId}:`, error);
        }
    });
    
    // Wait for all buttons to be added
    await Promise.all(promises);
    console.log('All review buttons added to course cards');
}

// Fetch reviews for a course
async function fetchReviewsForCourse(courseId) {
    if (!courseId) {
        console.error("No courseId provided to fetchReviewsForCourse");
        return [];
    }

    console.log(`Fetching reviews for course ID: ${courseId}`);

    try {
        // Add cache-busting parameter to prevent browser caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/courses/${courseId}/reviews?_=${timestamp}`, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
        }

        const reviews = await response.json();
        console.log(`API returned ${reviews.length} reviews for course ${courseId}`);
        return reviews;
    } catch (error) {
        console.error(`Error fetching reviews for course ${courseId}:`, error);
        return [];
    }
}

// Calculate average rating from reviews
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    // Handle different property names for the rating
    const totalRating = reviews.reduce((sum, review) => {
        const rating = review.rating || review.stars || 0;
        return sum + rating;
    }, 0);
    
    return (totalRating / reviews.length).toFixed(1); // Round to 1 decimal place
}

// Function to render stars based on rating
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = "";

    // Add full stars first
    for (let i = 0; i < fullStars; i++) {
        stars += `<i class="fas fa-star star"></i>`; // Full star with solid icon
    }

    // Add half star if needed
    if (halfStar) {
        stars += `<i class="fas fa-star-half-alt star"></i>`; // Half star
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += `<i class="far fa-star empty-star"></i>`; // Empty star
    }

    return stars;
}

// Function to show reviews modal
async function showReviewsModal(courseIdOrButton) {
    console.log("showReviewsModal called with:", courseIdOrButton);
    
    // Determine courseId based on input type
    let courseId;
    if (typeof courseIdOrButton === 'object' && courseIdOrButton !== null) {
        // It's a button element
        console.log("Input is an element:", courseIdOrButton);
        courseId = courseIdOrButton.getAttribute('data-course-id');
        console.log("Extracted courseId from button:", courseId);
    } else {
        // It's a direct courseId
        courseId = courseIdOrButton;
        console.log("Input is a direct courseId:", courseId);
    }
    
    if (!courseId) {
        console.error("No courseId found for showReviewsModal");
        return;
    }
    
    // Parse the courseId to ensure it's a number
    courseId = parseInt(courseId, 10);
    if (isNaN(courseId)) {
        console.error(`Invalid courseId: ${courseId}`);
        return;
    }
    
    console.log(`Showing reviews modal for course ID: ${courseId}`);

    // Check if modal already exists, remove it if it does
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        console.log("Removing existing modal");
        existingModal.remove();
    }

    // Create new modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        modalOverlay.remove();
    };
    
    modalContent.appendChild(closeButton);
    
    // Add title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Course Reviews';
    modalContent.appendChild(modalTitle);
    
    // Show loading indicator
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'Loading reviews...';
    modalContent.appendChild(loadingIndicator);
    
    // Add modal to page
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    try {
        // Fetch reviews
        console.log(`Fetching reviews for course ID: ${courseId}`);
        const reviews = await fetchReviewsForCourse(courseId);
        console.log(`Received ${reviews.length} reviews for course ${courseId}:`, reviews);
        
        // Remove loading indicator
        loadingIndicator.remove();
        
        // If no reviews, show message
        if (!reviews || reviews.length === 0) {
            const noReviewsMsg = document.createElement('p');
            noReviewsMsg.textContent = 'No reviews yet for this course.';
            modalContent.appendChild(noReviewsMsg);
            return;
        }
        
        // Process reviews to remove duplicates
        const uniqueReviews = [];
        const reviewIds = new Set();
        
        for (const review of reviews) {
            // Skip reviews without an ID
            if (!review.id) continue;
            
            // Check if this review ID has been seen before
            if (!reviewIds.has(review.id)) {
                reviewIds.add(review.id);
                uniqueReviews.push(review);
            }
        }
        
        console.log(`After deduplication: ${uniqueReviews.length} unique reviews`);
        
        // Calculate average rating
        const totalStars = uniqueReviews.reduce((sum, review) => {
            const rating = review.rating || review.stars || 0;
            return sum + rating;
        }, 0);
        const avgRating = uniqueReviews.length > 0 ? (totalStars / uniqueReviews.length).toFixed(1) : 'N/A';
        
        // Display average rating
        const ratingInfo = document.createElement('div');
        ratingInfo.className = 'average-rating';
        ratingInfo.style.textAlign = 'center';
        ratingInfo.style.marginBottom = '15px';
        
        // Average rating number with "out of 5" text
        const ratingNumberDiv = document.createElement('div');
        ratingNumberDiv.style.fontSize = '24px';
        ratingNumberDiv.style.fontWeight = 'bold';
        ratingNumberDiv.style.marginBottom = '10px';
        ratingNumberDiv.innerHTML = `${avgRating} <span style="font-size: 16px; font-weight: normal;">out of 5</span>`;
        ratingInfo.appendChild(ratingNumberDiv);
        
        // Star rating display
        const starRatingDiv = document.createElement('div');
        starRatingDiv.style.fontSize = '24px';
        starRatingDiv.style.color = '#FFD700';
        starRatingDiv.style.marginBottom = '10px';
        starRatingDiv.innerHTML = renderStars(parseFloat(avgRating));
        ratingInfo.appendChild(starRatingDiv);
        
        // Review count display
        const reviewCountDiv = document.createElement('div');
        reviewCountDiv.style.fontSize = '14px';
        reviewCountDiv.style.color = '#666';
        reviewCountDiv.textContent = `${uniqueReviews.length} ${uniqueReviews.length === 1 ? 'Review' : 'Reviews'}`;
        ratingInfo.appendChild(reviewCountDiv);
        
        modalContent.appendChild(ratingInfo);
        
        // Create container for reviews
        const reviewsList = document.createElement('div');
        reviewsList.className = 'reviews-list';
        reviewsList.style.maxHeight = '60vh';
        reviewsList.style.overflowY = 'auto';
        
        // Sort reviews by date (newest first)
        uniqueReviews.sort((a, b) => {
            const dateA = a.date || a.createdAt || new Date(0);
            const dateB = b.date || b.createdAt || new Date(0);
            return new Date(dateB) - new Date(dateA);
        });
        
        console.log("Sorted reviews:", uniqueReviews);
        
        // Add each review to the list
        uniqueReviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            // Handle different date property names and format
            let reviewDate = 'Unknown date';
            if (review.date) {
                reviewDate = new Date(review.date).toLocaleDateString();
            } else if (review.createdAt) {
                reviewDate = new Date(review.createdAt).toLocaleDateString();
            }
            
            // Handle different rating property names
            const reviewRating = review.rating || review.stars || 0;
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.username || 'Anonymous'}</span>
                    <span class="review-date">${reviewDate}</span>
                </div>
                <div class="review-rating">${renderStars(reviewRating)}</div>
                <p class="review-text">${review.comment || review.content || 'No comment provided.'}</p>
            `;
            
            reviewsList.appendChild(reviewItem);
        });
        
        modalContent.appendChild(reviewsList);
        
    } catch (error) {
        console.error("Error displaying reviews:", error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Error loading reviews. Please try again later.';
        errorMsg.style.color = 'red';
        modalContent.appendChild(errorMsg);
    }
    
    // Close modal when clicking outside content
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Show notification to the user
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Apply styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        background: '#e3b655',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: '10000',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
