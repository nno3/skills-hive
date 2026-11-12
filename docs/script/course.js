// Function to embed CSS styles
function embedStyles() {
    const style = document.createElement("style");
    style.textContent = `
        /* Review Button Styles - Full Width with Stars Inside */
        .reviews-btn {
            display: flex;
            align-items: center;
            justify-content: space-between; /* Space between stars and review count */
            text-decoration: none;
            color: #333;
            font-size: 12px; /* Reduced font size */
            padding: 8px 12px; /* Reduced padding to decrease height */
            border-radius: 5px; /* Match border-radius of "Start Learning" button */
            background-color: rgba(255, 215, 0, 0.1);
            border: 1px solid #e0e0e0;
            transition: all 0.2s ease;
            width: 100%; /* Make it full width */
            box-sizing: border-box; /* Ensure padding is included in width */
            margin-top: 10px; /* Add margin to separate from other elements */
            height: auto; /* Ensure the button height adjusts to content */
        }

        .reviews-btn:hover {
            background-color: rgba(255, 215, 0, 0.2);
            border-color: #FFD700;
        }

        /* Star Rating Styles Inside Button */
        .star-rating {
            display: flex;
            align-items: center;
            color: #FFD700;
        }

        .star-rating i {
            color: #FFD700; /* Gold color for stars */
            margin-right: 2px;
            font-size: 12px;
        }

        .star-rating i.far {
            color: #FFD700; /* Gold but with opacity for empty stars */
            opacity: 0.3;
        }

        /* Review Count Styles Inside Button */
        .review-count {
            font-size: 12px;
            color: #888;
        }

        /* Add other styles from your embedStyles function here */
        .course-card {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        .course-card-left {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .average-rating {
            display: flex;
            gap: 2px;
        }

        .reviews-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .reviews-modal-content {
            position: relative;
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            width: 90%;
            max-width: 500px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .reviews-modal-content h2 {
            margin-bottom: 15px;
        }

        .reviews-modal-content .review {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
            text-align: left;
        }

        .reviews-modal-content .review p {
            margin: 5px 0;
        }

        .reviews-modal-content .close-button {
            position: absolute;
            top: 10px;
            right: 15px;
            cursor: pointer;
            font-size: 24px;
            color: #888;
        }
    `;
    document.head.appendChild(style);
}

// Function to fetch and display courses based on search and filter criteria
async function searchAndFilterCourses() {
    const query = document.getElementById("search-input").value;
    const category = document.getElementById("category-filter").value;
    const level = document.getElementById("level-filter").value;

    // Build the query parameters
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (category) params.append("category", category);
    if (level) params.append("level", level);

    try {
        // Fetch courses from the server
        const response = await fetch(`/api/courses/search-and-filter?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const courses = await response.json();
        displayCourses(courses); // Display the fetched courses
    } catch (error) {
        console.error("Error searching and filtering courses:", error);
        alert("Failed to load courses. Please try again.");
    }
}

// Function to display courses in the course list
async function displayCourses(courses) {
    const courseList = document.getElementById("course-list");
    if (!courseList) return; // Exit if not on courses page

    // Embed CSS styles
    embedStyles();

    courseList.innerHTML = courses.length === 0 ? "<p>No courses found.</p>" : "";

    // Loop through the courses and create course cards
    for (const course of courses) {
        const courseCard = document.createElement("div");
        courseCard.className = "course-card";
        courseCard.dataset.courseId = course.id;

        // Fetch reviews for this course
        const reviews = await fetchReviewsForCourse(course.id);

        // Fetch the review count for this course
        const reviewCount = await fetchReviewCount(course.id);
        console.log(`Review count for course ${course.id}: ${reviewCount}`); // Debug log

        // Calculate the average rating
        const averageRating = calculateAverageRating(reviews);

        // Check if this course is already bookmarked
        const isBookmarked = await checkIfBookmarked(course.id);
        const bookmarkIconClass = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
        const bookmarkIconColor = isBookmarked ? '#FFD700' : '#666';

        // Create the course card content with stars inside the button
        courseCard.innerHTML = `
            <img src="${course.thumbnail}" alt="Course Thumbnail">
            <h2>${course.title}</h2>
            <p>${course.description}</p>
            <div class="course-details">
                <span class="course-category">${course.category.name}</span>
                <span class="course-level ${course.level.name.toLowerCase()}">${course.level.name}</span>
            </div>
            <a href="#" class="reviews-btn" data-course-id="${course.id}">
                <div class="star-rating">
                    ${renderStars(averageRating)}
                </div>
                <span class="review-count" id="review-count-${course.id}">${reviewCount} Reviews</span>
            </a>
            <a href="${course.url}" class="start-learning-button">Start Learning</a>
            <button onclick="toggleBookmark(this)" 
        data-course-id="${course.id}" 
        class="bookmark-btn">
    <i class="${bookmarkIconClass}" style="color: ${bookmarkIconColor};"></i>
</button>
            
        `;

        courseList.appendChild(courseCard);
    }

    // Attach event listeners to "View Reviews" links
    attachViewReviewsLinkHandlers();

    // Attach completion tracking after creating course cards
    attachCourseCompletionTracking();
}

// Function to fetch reviews for a specific course
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

function attachViewReviewsLinkHandlers() {
    const viewReviewsLinks = document.querySelectorAll(".reviews-btn");
    viewReviewsLinks.forEach(link => {
        link.addEventListener("click", async (event) => {
            event.preventDefault();
            const courseId = link.dataset.courseId;

            // Fetch reviews for this course
            const reviews = await fetchReviewsForCourse(courseId);

            // Show the reviews in a modal
            showReviewsModal(courseId, reviews);
        });
    });
}

// Function to initialize course functionality
function initializeCourseHandlers() {
    if (window.handlersInitialized) return;
    window.handlersInitialized = true;

    // Search and filter setup
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", searchAndFilterCourses);
        document.getElementById("category-filter").addEventListener("change", searchAndFilterCourses);
        document.getElementById("level-filter").addEventListener("change", searchAndFilterCourses);
        searchAndFilterCourses();
    }

    // Check for completion and attach tracking
    checkForCourseCompletion();
}

// Attach event listeners to start learning buttons
function attachCourseCompletionTracking() {
    // Look for both button classes to ensure compatibility with all pages
    const startButtons = document.querySelectorAll(".start-learning-button:not([data-handler-attached]), .start-learning-btn:not([data-handler-attached])");
    console.log('Found start learning buttons:', startButtons.length); // Debug log

    startButtons.forEach(button => {
        button.addEventListener("click", handleStartLearning);
        button.setAttribute('data-handler-attached', 'true');
        console.log('Attached event listener to button:', button);
    });
}

// Handle start learning button click
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

    console.log(`Starting course with ID: ${courseId}`);
    const startTime = new Date().toISOString();
    const sessionData = { courseId, startTime, courseUrl };
    localStorage.setItem("currentCourseSession", JSON.stringify(sessionData));

    window.location.href = courseUrl;
}

// Check for course completion and show confirmation popup
function checkForCourseCompletion() {
    if (document.getElementById("confirmation-modal-overlay")) return;

    const sessionDataStr = localStorage.getItem("currentCourseSession");
    if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        showConfirmationPopup(sessionData);
    }
}

// Determine if the current page is the dashboard
function isDashboardPage() {
    // Check if we're on the dashboard - modify this condition based on your actual dashboard URL or elements
    return window.location.pathname === '/dashboard' ||
        window.location.pathname === '/' ||
        document.getElementById('dashboard-container') !== null;
}

// Show confirmation popup
function showConfirmationPopup(sessionData) {
    if (document.getElementById("confirmation-modal-overlay")) return;

    const modalOverlay = createModalOverlay("confirmation-modal-overlay");
    const modalContent = createModalContent(`
        <span id="confirmation-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Course Completion</h2>
        <p style="margin-bottom: 20px;">Have you completed the course?</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <button id="confirmation-yes" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Yes</button>
            <button id="confirmation-no" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">No</button>
        </div>
    `);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", (event) => {
        if (event.target.id === "confirmation-close") {
            localStorage.removeItem("currentCourseSession");
            document.body.removeChild(modalOverlay);
            return;
        }

        if (event.target.id === "confirmation-no") {
            // Save the course as in progress
            fetch(`/api/course-in-progress/${sessionData.courseId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
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
                localStorage.removeItem("currentCourseSession");
                document.body.removeChild(modalOverlay);
                // Redirect to dashboard to show the updated courses in progress
                window.location.href = '/skills-hive/dashboard/';
            })
            .catch(error => {
                console.error("Error saving course in progress:", error);
                alert(error.message || "Failed to save course in progress. Please try again.");
                document.body.removeChild(modalOverlay);
            });
        } else if (event.target.id === "confirmation-yes") {
            document.body.removeChild(modalOverlay);
            showCompletionPopup(sessionData);
        }
    });
}

// Show completion popup with time input
function showCompletionPopup(sessionData) {
    if (document.getElementById("completion-modal-overlay")) return;

    const modalOverlay = createModalOverlay("completion-modal-overlay");
    const modalContent = createModalContent(`
        <span id="completion-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Course Completion</h2>
        <p style="margin-bottom: 20px;">Please enter the time you spent completing the course:</p>
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
    `);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    populateDropdown("completion-hours", 0, 40);
    populateDropdown("completion-minutes", 0, 59);

    modalOverlay.addEventListener("click", (event) => {
        if (event.target.id === "completion-close") {
            localStorage.removeItem("currentCourseSession");
            document.body.removeChild(modalOverlay);
        } else if (event.target.id === "completion-submit") {
            const hours = parseInt(document.getElementById("completion-hours").value, 10);
            const minutes = parseInt(document.getElementById("completion-minutes").value, 10);
            const completionData = {
                courseId: Number(sessionData.courseId),
                startTime: sessionData.startTime,
                completionTime: new Date().toISOString(),
                durationHours: hours,
                durationMinutes: minutes
            };

            // Save completion data first
            saveCompletionData(completionData)
                .then(() => {
                    localStorage.removeItem("currentCourseSession");
                    document.body.removeChild(modalOverlay);
                    // Show the review and rating modal after saving completion data
                    showReviewAndRatingModal(sessionData.courseId);
                })
                .catch(error => {
                    console.error("Error saving completion data:", error);
                    alert("Failed to save completion data. Please try again.");
                });
        }
    });
}

// Show review and rating modal
function showReviewAndRatingModal(courseId) {
    if (document.getElementById("review-rating-modal-overlay")) return;

    const modalOverlay = createModalOverlay("review-rating-modal-overlay");
    const modalContent = createModalContent(`
        <span id="review-rating-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Leave a Review</h2>
        <p style="margin-bottom: 20px;">How would you rate this course?</p>
        <div style="margin-bottom: 20px;">
            <label for="review-rating">Rating:</label>
            <select id="review-rating" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
            </select>
        </div>
        <div style="margin-bottom: 20px;">
            <label for="review-comment">Comment:</label>
            <textarea id="review-comment" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" rows="4"></textarea>
        </div>
        <button id="review-rating-submit" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit Review</button>
    `);

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", async (event) => {
        if (event.target.id === "review-rating-close") {
            document.body.removeChild(modalOverlay);
        } else if (event.target.id === "review-rating-submit") {
            const reviewData = {
                courseId: courseId,
                userId: getCurrentUserId(), // Get the current user ID
                rating: parseInt(document.getElementById("review-rating").value, 10),
                comment: document.getElementById("review-comment").value
            };

            try {
            // Save the review and rating
                await saveReviewAndRating(reviewData);
                    document.body.removeChild(modalOverlay);

                // Show success message
                showNotification("Thank you for your review!");

                // Update all review counts immediately after submitting a review
                console.log("Updating all review counts after submitting review");
                await updateAllReviewCounts();

                // Show the updated reviews if they want to see their review
                setTimeout(() => {
                    showReviewsModal(courseId);
                }, 500);
            } catch (error) {
                    console.error("Error submitting review:", error);
                    alert("Failed to submit review. Please try again.");
            }
        }
    });
}

// Function to get the current user ID
function getCurrentUserId() {
    return parseInt(localStorage.getItem('userId')) || 1; // Replace with the actual user ID or fallback
}

// Function to save review and rating
async function saveReviewAndRating(reviewData) {
    console.log("Submitting review with payload:", reviewData);
    try {
        const response = await fetch(`/api/courses/${reviewData.courseId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reviewData)
        });

        // Check content type before trying to parse as JSON
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
                console.error("Backend error:", errorData);
            throw new Error(errorData.message || "Failed to submit review");
            } else {
                // Handle non-JSON error responses
                const errorText = await response.text();
                console.error("Server returned non-JSON error:", errorText);
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        }

        // Only try to parse JSON if we have JSON
        if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
            console.log("Review submitted successfully:", result);
        return result;
        } else {
            console.log("Review submitted successfully, no JSON response");
            return { success: true };
        }
    } catch (error) {
        console.error("Error submitting review:", error);
        throw error;
    }
}

// Helper function to create a modal overlay
function createModalOverlay(id) {
    const modalOverlay = document.createElement("div");
    modalOverlay.id = id;
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
    return modalOverlay;
}

// Helper function to create modal content
function createModalContent(html) {
    const modalContent = document.createElement("div");
    modalContent.style = `
        position: relative;
        background: #fff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        text-align: center;
        width: 90%;
        max-width: 400px;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    `;
    modalContent.innerHTML = html;
    return modalContent;
}

// Helper function to populate dropdowns
function populateDropdown(id, min, max) {
    const select = document.getElementById(id);
    for (let i = min; i <= max; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

// Helper function to save completion data
async function saveCompletionData(data) {
    const response = await fetch("/api/course-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to save completion data");
    return response.json();
}

// Initialize handlers on page load
document.addEventListener("DOMContentLoaded", function () {
    const sidebarToggle = document.querySelector("#sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function () {
            console.log("Sidebar toggled!");
        });
    } else {
        console.error("Sidebar toggle button not found!");
    }
});

// Check for course completion when navigating through the site
window.addEventListener("pageshow", function () {
    initializeCourseHandlers();

    // Always check for completion popup, regardless of page
        checkForCourseCompletion();
});

// Function to show reviews in a modal
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    Object.assign(modal.style, {
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
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
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
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    Object.assign(closeButton.style, {
        position: "absolute",
        top: "10px",
        right: "15px",
        cursor: "pointer",
        fontSize: "24px",
        color: "#888"
    });
    closeButton.onclick = function() {
        modal.remove();
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
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
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
            Object.assign(reviewItem.style, {
                marginBottom: '15px',
                padding: '10px 15px',
                backgroundColor: '#f8f8f8',
                borderRadius: '5px',
                textAlign: 'left',
                border: '1px solid #eee'
            });
            
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
                    <span class="review-author" style="font-weight: bold;">${review.username || 'Anonymous'}</span>
                    <span class="review-date" style="color: #888; font-size: 12px; margin-left: 10px;">${reviewDate}</span>
            </div>
                <div class="review-rating" style="margin: 5px 0; color: #FFD700;">${renderStars(reviewRating)}</div>
                <p class="review-text" style="margin: 5px 0;">${review.comment || review.content || 'No comment provided.'}</p>
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
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Function to calculate the average rating
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

async function fetchReviewsForCourse(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        return await response.json();
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

async function fetchReviewCount(courseId) {
    console.log(`Fetching review count for course ID: ${courseId}`); // Debug log
    try {
        const response = await fetch(`/api/courses/${courseId}/reviews/count`);
        console.log("API response status:", response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response from server: ${errorText}`);
            throw new Error(`Failed to fetch review count: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched review count data:`, data); // Debug log

        return data; // Return the review count directly
    } catch (error) {
        console.error(`Error fetching review count for course ${courseId}:`, error);
        return 0; // Fallback to 0 in case of error
    }
}

async function updateReviewCount(courseId) {
    const reviewCountElement = document.getElementById(`review-count-${courseId}`);
    if (!reviewCountElement) {
        console.error(`Review count element not found for course ID: ${courseId}`);
        return;
    }

    try {
        const reviewCount = await fetchReviewCount(courseId);
        reviewCountElement.textContent = `${reviewCount} Reviews`;
    } catch (error) {
        console.error("Error updating review count:", error);
        reviewCountElement.textContent = "0 Reviews"; // Fallback to 0
    }
}

// After successful login
localStorage.setItem('userId', user.id); // Store the user ID

// Function to check if a course is bookmarked
async function checkIfBookmarked(courseId) {
    try {
        const response = await fetch('/check-bookmark?courseId=' + courseId);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        const result = await response.text();
        return result === 'true';
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return false;
    }
}

// Function to initialize the review buttons on page load
function initializeReviewButtons() {
    console.log('Initializing review buttons on course page');
    const reviewButtons = document.querySelectorAll('.reviews-btn');

    reviewButtons.forEach(async (button) => {
        const courseId = button.getAttribute('data-course-id');
        if (!courseId) {
            console.warn('Review button missing course ID');
            return;
        }

        try {
            // Fetch reviews and update the button display
            const reviews = await fetchReviewsForCourse(courseId);
            const averageRating = calculateAverageRating(reviews);

            // Create or update star rating
            let starRating = button.querySelector('.star-rating');
            if (!starRating) {
                starRating = document.createElement('div');
                starRating.className = 'star-rating';
                button.insertBefore(starRating, button.firstChild);
            }
            starRating.innerHTML = renderStars(averageRating);

            // Update review count
            let reviewCount = button.querySelector('.review-count');
            if (!reviewCount) {
                reviewCount = document.createElement('span');
                reviewCount.className = 'review-count';
                button.appendChild(reviewCount);
            }
            reviewCount.textContent = `${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}`;

            // Make sure click handlers are attached
            if (!button.getAttribute('data-handler-attached')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    showReviewsModal(this);
                });
                button.setAttribute('data-handler-attached', 'true');
            }
        } catch (error) {
            console.error(`Error initializing review button for course ${courseId}:`, error);
        }
    });
}

// Function to update all review buttons on the course page
async function updateAllReviewCounts() {
    console.log('Updating all review counts on course page');

    // Get all review buttons
    const reviewButtons = document.querySelectorAll('.reviews-btn');

    if (reviewButtons.length === 0) {
        console.log('No review buttons found on this page');
        return;
    }

    // Create an array of promises for parallel processing
    const promises = Array.from(reviewButtons).map(async (button) => {
        const courseId = button.getAttribute('data-course-id');
        if (!courseId) {
            console.warn('Review button missing course ID');
            return;
        }

        try {
            // Fetch reviews for this course
            const reviews = await fetchReviewsForCourse(courseId);
            const reviewCount = reviews.length;
            const averageRating = calculateAverageRating(reviews);

            console.log(`Course ${courseId} has ${reviewCount} reviews with avg rating ${averageRating}`);

            // Update star rating display
            const starRating = button.querySelector('.star-rating');
            if (starRating) {
                starRating.innerHTML = renderStars(averageRating);
            }

            // Update review count
            const reviewCountElement = button.querySelector('.review-count');
            if (reviewCountElement) {
                reviewCountElement.textContent = `${reviewCount} ${reviewCount !== 1 ? 'Reviews' : 'Review'}`;
            }
        } catch (error) {
            console.error(`Error updating review button for course ${courseId}:`, error);
        }
    });

    // Wait for all updates to complete
    await Promise.all(promises);
    console.log('All review counts updated');
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Course page loaded, initializing components');

    // Initialize review buttons
    initializeReviewButtons();

    // Initialize bookmark buttons
    if (typeof initializeBookmarkButtons === 'function') {
        initializeBookmarkButtons();
    }

    // Check for course completion popup
    checkForCourseCompletion();

    // Update all review counts
    updateAllReviewCounts();
});

// Also update when navigating back to the page
window.addEventListener('pageshow', function() {
    console.log('Course page shown, updating components');

    // Update review buttons
    initializeReviewButtons();

    // Update all review counts
    updateAllReviewCounts();

    // Check for completion popup
    checkForCourseCompletion();
});
