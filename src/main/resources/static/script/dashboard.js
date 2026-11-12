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
        const courses = await response.json();
        await displayCourses(courses); // Display the fetched courses
    } catch (error) {
        console.error("Error searching and filtering courses:", error);
    }
}

// Function to display courses in the course list
async function displayCourses(courses) {
    const courseList = document.getElementById("course-list");
    if (!courseList) return; // Exit if not on courses page

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

        // Calculate the average rating
        const averageRating = calculateAverageRating(reviews);

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
                <span class="review-count">${reviewCount} Reviews</span>
            </a>
            <a href="${course.url}" class="start-learning-button">Start Learning</a>
        `;

        courseList.appendChild(courseCard);
    }

    // Attach event listeners to "View Reviews" links
    attachViewReviewsLinkHandlers();

    // Attach completion tracking after creating course cards
    attachCourseCompletionTracking();
}

// Function to initialize course functionality
function initializeCourseHandlers() {
    // Prevent multiple initializations
    if (window.handlersInitialized) {
        return;
    }

    // Only run search and filter setup if we're on the courses page
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", searchAndFilterCourses);
        document.getElementById("category-filter").addEventListener("change", searchAndFilterCourses);
        document.getElementById("level-filter").addEventListener("change", searchAndFilterCourses);
        searchAndFilterCourses();
    }

    // Always check for completion and attach tracking
    checkForCourseCompletion();
    attachCourseCompletionTracking();

    // Mark as initialized
    window.handlersInitialized = true;
}

// Update the DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", () => {
    // Clear any existing initialization flag
    window.handlersInitialized = false;
    initializeCourseHandlers();
});

// Update the pageshow listener
window.addEventListener("pageshow", () => {
    // Clear any existing initialization flag
    window.handlersInitialized = false;
    initializeCourseHandlers();
});

// Update attachCourseCompletionTracking to handle both dashboard and course pages
function attachCourseCompletionTracking() {
    const startButtons = document.querySelectorAll(".start-learning-button:not([data-handler-attached])");
    startButtons.forEach(button => {
        button.addEventListener("click", handleStartLearning);
        button.setAttribute('data-handler-attached', 'true');
    });
}

// Function to create and display the completion popup modal
function showCompletionPopup(sessionData) {
    // Check if modal already exists (just in case)
    if (document.getElementById("completion-modal-overlay")) return;

    // Create a modal overlay with updated styles
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

    // Create modal content container with updated styles
    const modalContent = document.createElement("div");
    modalContent.id = "completion-modal-content";
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

    // Insert the modal inner HTML with a close (X) button and side-by-side dropdowns for hours and minutes
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

    // Use event delegation on the modal overlay to handle clicks
    modalOverlay.addEventListener("click", function(event) {
        // If the user clicks the close (X) button
        if (event.target && event.target.id === "completion-close") {
            localStorage.removeItem("currentCourseSession");
            document.body.removeChild(modalOverlay);
        return;
    }
        // If the user clicks the submit button
        if (event.target && event.target.id === "completion-submit") {
            const hours = parseInt(document.getElementById("completion-hours").value, 10);
            const minutes = parseInt(document.getElementById("completion-minutes").value, 10);

            // Prepare completion data to send to the backend
            const completionData = {
                courseId: Number(sessionData.courseId),
                startTime: sessionData.startTime,
                completionTime: new Date().toISOString(),
                durationHours: hours,
                durationMinutes: minutes
            };

            console.log("Sending completion data:", completionData); // Debugging: Log the payload

            // Make a POST request to save the completion data
            fetch("/api/course-completion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(completionData)
            })
                .then(response => {
                    if (!response.ok) {
                        // Log the response status and text for debugging
                        console.error("Response status:", response.status, response.statusText);
                        return response.text().then(text => {
                            throw new Error(text || "Failed to save course completion data.");
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Course completion saved:", data);
                    // Clear the stored session data and remove the modal
                    localStorage.removeItem("currentCourseSession");
                    document.body.removeChild(modalOverlay);

                    // Show the ratings modal after completion
                    showRatingsModal(sessionData.courseId);
                })
                .catch(error => {
                    console.error("Error saving completion data:", error);
                    // Display the backend error message to the user
                    alert(`Error: ${error.message || "There was an error saving your course completion. Please try again."}`);
                });
        }
    });
}

// Function to show ratings modal
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

                // Show success notification
                showNotification("Thank you for your feedback!");
                
                // Update all review counts immediately after submitting a review
                console.log("Updating all review counts after submitting review");
                await updateAllReviewCounts();
                
                // Show the updated reviews modal with the user's new review
                showReviewsModal(courseId);
                
                // Reload the page after a reasonable delay (5 seconds) to update all views
                // This gives users time to see their review in the reviews modal
                setTimeout(() => {
                    window.location.reload();
                }, 5000);

            } catch (error) {
                console.error("Error saving ratings data:", error);
                alert("There was an error saving your feedback. Please try again.");
            }
        }
    });
}

// Function to show the confirmation popup
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
                        // Reload the dashboard to show the updated courses in progress
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error("Error saving course in progress:", error);
                        alert(error.message || "Failed to save course in progress. Please try again.");
                    });
            }
        } else if (event.target.id === "confirmation-yes") {
            document.body.removeChild(modalOverlay);
            showCompletionPopup(sessionData);
        }
    });
}

// Function to handle the start learning button click
function handleStartLearning(e) {
    e.preventDefault();

    const courseCard = this.closest(".course-card");
    const courseUrl = this.getAttribute("href");
    const courseId = courseCard.dataset.courseId;

    if (!courseId) {
        console.error("No course ID found for this course");
        return;
    }

    const startTime = new Date().toISOString();
    const sessionData = { courseId, startTime, courseUrl };
    localStorage.setItem("currentCourseSession", JSON.stringify(sessionData));

    window.location.href = courseUrl;
}

// Function to check for course completion
function checkForCourseCompletion() {
    const sessionDataStr = localStorage.getItem("currentCourseSession");
    if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        showConfirmationPopup(sessionData);
    }
}

// Function to fetch reviews for a specific course
async function fetchReviewsForCourse(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/reviews`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch reviews");
        return await response.json();
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

// Function to fetch the review count for a course
async function fetchReviewCount(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/reviews/count`);
        if (!response.ok) throw new Error("Failed to fetch review count");
        return await response.json();
    } catch (error) {
        console.error("Error fetching review count:", error);
        return 0;
    }
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

// Function to calculate average rating from reviews
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    // Handle different property names for the rating
    const totalRating = reviews.reduce((sum, review) => {
        const rating = review.rating || review.stars || 0;
        return sum + rating;
    }, 0);
    
    return (totalRating / reviews.length).toFixed(1); // Round to 1 decimal place
}

// Function to attach event listeners to "View Reviews" links
function attachViewReviewsLinkHandlers() {
    // Only attach handlers to buttons that don't already have them
    const viewReviewsLinks = document.querySelectorAll(".reviews-btn:not([data-handler-attached]):not([onclick])");
    
    console.log(`Attaching handlers to ${viewReviewsLinks.length} review buttons (excluding those with inline handlers)`);

    viewReviewsLinks.forEach(link => {
        link.setAttribute('data-handler-attached', 'true');
        link.addEventListener("click", async (event) => {
            event.preventDefault();
            await showReviewsModal(link);
        });
    });
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
    closeButton.onclick = function () {
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

        // Fetch the authenticated user's ID (if available)
        const userId = localStorage.getItem('userId'); // Assuming you store the user ID in localStorage after login

        // Process reviews to remove duplicates
        const uniqueReviews = [];
        const reviewIds = new Set();

        for (const review of reviews) {
            // Skip reviews without an ID
            if (!review.id) continue;

            // Check if this review ID has been seen before
            if (!reviewIds.has(review.id)) {
                reviewIds.add(review.id);

                // Mask the username if the review does not belong to the authenticated user
                if (review.userId !== userId) {
                    review.username = 'Anonymous';
                }

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
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Function to save completed courses
async function saveCompletedCourse(courseId) {
    try {
        // First, fetch the course in progress to get the start time
        let startTime = new Date().toISOString(); // Default fallback
        
        try {
            const courseResponse = await fetch(`/api/course-in-progress/get/${courseId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                if (courseData && courseData.startTime) {
                    startTime = courseData.startTime;
                    console.log(`Course ${courseId} started at: ${startTime}`);
                } else {
                    console.warn(`No valid start time found for course ${courseId}, using current time instead.`);
                }
            } else {
                console.warn(`Failed to fetch course in progress information for course ${courseId}, using current time instead.`);
            }
            
            // Remove the course from in progress
            await fetch(`/api/course-in-progress/${courseId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
        } catch (err) {
            console.warn(`Error fetching start time or removing from progress: ${err.message}`);
        }
        
        const completionData = {
            courseId: Number(courseId),
            startTime: startTime, // Use the fetched start time
            completionTime: new Date().toISOString(),
            durationHours: 1,
            durationMinutes: 0
        };

        const response = await fetch("/api/course-completion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(completionData)
        });

        if (!response.ok) {
            throw new Error("Failed to save course completion");
        }

        const completions = await response.json();
        displayCompletedCourses(completions);
        return completions;
    } catch (error) {
        console.error("Error saving course completion:", error);
        alert("Failed to save your course completion. Please try again.");
    }
}

// Function to display completed courses in a dedicated section
function displayCompletedCourses(completions) {
    const completedCoursesSection = document.getElementById('completed-courses-section');
    if (!completedCoursesSection) return;

    if (!completedCoursesSection.querySelector('h2')) {
        const sectionHeader = document.createElement('h2');
        sectionHeader.textContent = 'Your Completed Courses';
        sectionHeader.className = 'section-title';
        completedCoursesSection.appendChild(sectionHeader);
    }

    let completedCoursesList = completedCoursesSection.querySelector('.completed-courses-list');
    if (!completedCoursesList) {
        completedCoursesList = document.createElement('div');
        completedCoursesList.className = 'completed-courses-list course-list';
        completedCoursesSection.appendChild(completedCoursesList);
    } else {
        completedCoursesList.innerHTML = '';
    }

    if (completions.length === 0) {
        const noCoursesMessage = document.createElement('p');
        noCoursesMessage.className = 'no-courses-message';
        noCoursesMessage.textContent = 'You have not completed any courses yet.';
        completedCoursesList.appendChild(noCoursesMessage);
        return;
    }

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'course-scroll-container';

    const courseScroll = document.createElement('div');
    courseScroll.className = 'course-scroll';
    scrollContainer.appendChild(courseScroll);

    completions.forEach(completion => {
        fetchCourseDetails(completion.courseId)
            .then(course => {
                if (!course) return;

                const completedCourseCard = document.createElement('div');
                completedCourseCard.className = 'course-card completed';
                completedCourseCard.dataset.courseId = course.id;

                // Format the date and time
                const completionDateTime = new Date(completion.completionTime);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const formattedDate = completionDateTime.toLocaleDateString(undefined, dateOptions);
                const formattedTime = completionDateTime.toLocaleTimeString(undefined, timeOptions);

                completedCourseCard.innerHTML = `
                    <img src="${course.thumbnail}" alt="Course Thumbnail">
                    <div class="course-details">
                        <div class="course-content">
                            <h3>${course.title}</h3>
                            <p>${course.description}</p>
                            <div class="course-meta">
                                <span class="course-category">${course.category.name}</span>
                                <span class="course-level ${course.level.name.toLowerCase()}">${course.level.name}</span>
                            </div>
                        </div>
                        <div class="completion-info">
                            <div class="completion-date">
                                <i class="far fa-calendar-check"></i>
                                <span>Completed on: ${formattedDate}</span>
                            </div>
                            <div class="completion-time">
                                <i class="far fa-clock"></i>
                                <span>Completed at ${formattedTime}</span>
                            </div>
                            <div class="completion-duration">
                                <i class="fas fa-hourglass-end"></i>
                                <span>Duration: ${completion.durationHours}h ${completion.durationMinutes}m</span>
                            </div>
                        </div>
                    </div>
                `;

                courseScroll.appendChild(completedCourseCard);
            })
            .catch(error => {
                console.error("Error fetching course details:", error);
            });
    });

    completedCoursesList.appendChild(scrollContainer);
}

// Function to fetch course details by ID
async function fetchCourseDetails(courseId) {
    try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch course details");
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for course ${courseId}:`, error);
        return null;
    }
}

// Add a flag to track if the courses have already been loaded
let coursesLoaded = false;

// Function to load and display completed courses
async function loadCompletedCourses() {
    if (!isDashboardPage() || coursesLoaded) return;

    try {
        coursesLoaded = true;

        const completionsResponse = await fetch('/api/course-completion/my');
        if (!completionsResponse.ok) {
            coursesLoaded = false;
            throw new Error("Failed to fetch completions");
        }

        const completions = await completionsResponse.json();
        console.log("Completions fetched:", completions);

        completions.sort((a, b) => {
            return new Date(b.completionTime) - new Date(a.completionTime);
        });

        updateCompletionStats(completions);

        const completedCoursesList = document.getElementById('completed-courses-list');
        if (!completedCoursesList) {
            coursesLoaded = false;
            return;
        }

        completedCoursesList.innerHTML = '';

        if (completions.length === 0) {
            const noCoursesMessage = document.createElement('div');
            noCoursesMessage.className = 'no-courses-message';
            noCoursesMessage.innerHTML = `
                <i class="fas fa-book"></i>
                <p>You haven't completed any courses yet.</p>
            `;
            completedCoursesList.appendChild(noCoursesMessage);
            return;
        }

        const fetchPromises = completions.map(async (completion) => {
            try {
                const courseResponse = await fetch(`/api/courses/${completion.courseId}`);
                if (!courseResponse.ok) throw new Error(`Failed to fetch course ${completion.courseId}`);
                const course = await courseResponse.json();

                const completionDateTime = new Date(completion.completionTime);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const formattedDate = completionDateTime.toLocaleDateString(undefined, dateOptions);
                const formattedTime = completionDateTime.toLocaleTimeString(undefined, timeOptions);

                const courseCard = document.createElement('div');
                courseCard.className = 'course-card completed';
                courseCard.dataset.courseId = completion.courseId;

                courseCard.innerHTML = `
                    <img src="${course.thumbnail}" alt="Course Thumbnail">
                    <div class="course-details">
                        <div class="course-content">
                            <h3>${course.title}</h3>
                            <p>${course.description}</p>
                            <div class="course-meta">
                                <span class="course-category">${course.category.name}</span>
                                <span class="course-level ${course.level.name.toLowerCase()}">${course.level.name}</span>
                            </div>
                        </div>
                        <div class="completion-info">
                            <div class="completion-date">
                                <i class="far fa-calendar-check"></i>
                                <span>Completed on: ${formattedDate}</span>
                            </div>
                            <div class="completion-time">
                                <i class="far fa-clock"></i>
                                <span>Completed at ${formattedTime}</span>
                            </div>
                            <div class="completion-duration">
                                <i class="fas fa-hourglass-end"></i>
                                <span>Duration: ${completion.durationHours}h ${completion.durationMinutes}m</span>
                            </div>
                        </div>
                    </div>
                `;

                return courseCard;
            } catch (error) {
                console.error(`Error processing completion for course ${completion.courseId}:`, error);
                return null;
            }
        });

        const courseCards = await Promise.all(fetchPromises);
        courseCards.forEach(card => {
            if (card) completedCoursesList.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading completed courses:", error);
        coursesLoaded = false;
    }
}

// Function to update completion statistics
// Modified updateCompletionStats function to ensure the stats are displayed
function updateCompletionStats(completions) {
    console.log("Updating completion stats with", completions.length, "completions");

    // Find or create the stats container
    let statsContainer = document.getElementById('completion-stats');

    if (!statsContainer) {
        console.log("Creating new stats container");
        statsContainer = document.createElement('div');
        statsContainer.id = 'completion-stats';
        statsContainer.className = 'completion-stats';

        // Find a suitable parent to append the stats to
        const header = document.querySelector('.dashboard-header');
        const completedCoursesList = document.getElementById('completed-courses-list');

        if (header && header.parentNode) {
            console.log("Inserting after dashboard header");
            header.parentNode.insertBefore(statsContainer, header.nextSibling);
        } else if (completedCoursesList && completedCoursesList.parentNode) {
            console.log("Inserting before completed courses list");
            completedCoursesList.parentNode.insertBefore(statsContainer, completedCoursesList);
        } else {
            // If we can't find a good place, just add it to the main content area
            console.log("Adding to main content");
            const mainContent = document.querySelector('main') || document.body;
            mainContent.appendChild(statsContainer);
        }
    }

    const totalHours = completions.reduce((total, completion) => {
        return total + completion.durationHours + (completion.durationMinutes / 60);
    }, 0).toFixed(1);

    console.log("Setting stats HTML with", completions.length, "courses and", totalHours, "hours");

    statsContainer.innerHTML = `
        <div class="stats-card">
            <div class="stat-item">
                <i class="fas fa-graduation-cap"></i>
                <div class="stat-content">
                    <span class="stat-value">${completions.length}</span>
                    <span class="stat-label">Courses Completed</span>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-clock"></i>
                <div class="stat-content">
                    <span class="stat-value">${totalHours}</span>
                    <span class="stat-label">Total Learning Hours</span>
                </div>
            </div>
        </div>
    `;
}

// Add this function to determine if the current page is the dashboard
function isDashboardPage() {
    // Check for elements that would only exist on the dashboard page
    return document.getElementById('completed-courses-list') !== null ||
        document.querySelector('.dashboard-header') !== null;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 Dashboard page DOMContentLoaded event fired');
    
    if (isDashboardPage()) {
        console.log('Dashboard page detected, initializing...');
        
        // Load the dashboard components
        loadDashboard();
        
        // Initialize review buttons in static HTML templates
        initializeRecommendedCoursesReviews();
        
        // Update all review counts
        updateAllReviewCounts();
        
        // Attach review button handlers to dynamic content
        attachViewReviewsLinkHandlers();
        
        // Check for course completion and track course starts
        checkForCourseCompletion();
        attachCourseCompletionTracking();
    } else {
        console.log('Not on dashboard page, skipping dashboard initialization');
    }
});

// Update when navigating back to the page
window.addEventListener('pageshow', function(event) {
    console.log('🟡 Dashboard pageshow event fired, persisted=', event.persisted);
    
    if (isDashboardPage()) {
        // If the page was loaded from cache (back button), update all data
        if (event.persisted) {
            console.log('Page was loaded from cache, updating all data');
            loadDashboard();
        }
        
        // Always update review data
        console.log('Updating review data on pageshow');
        initializeRecommendedCoursesReviews();
        updateAllReviewCounts();
        
        // Always check for completion and track courses
        checkForCourseCompletion();
        attachCourseCompletionTracking();
    }
});

// Add new function to display courses in progress
function displayCoursesInProgress(coursesInProgress) {
    const inProgressSection = document.getElementById('in-progress-courses-section');
    if (!inProgressSection) {
        console.error("Courses in progress section not found");
        return;
    }

    // Clear existing content
    const existingList = inProgressSection.querySelector('.course-list');
    if (existingList) {
        existingList.remove();
    }

    const coursesInProgressList = document.createElement('div');
    coursesInProgressList.className = 'course-list';

    if (coursesInProgress.length === 0) {
        const noCoursesMessage = document.createElement('div');
        noCoursesMessage.className = 'no-courses-message';
        noCoursesMessage.innerHTML = `
            <i class="fas fa-book"></i>
            <p>You don't have any courses in progress.</p>
        `;
        coursesInProgressList.appendChild(noCoursesMessage);
        inProgressSection.appendChild(coursesInProgressList);
        return;
    }

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'course-scroll-container';

    const courseScroll = document.createElement('div');
    courseScroll.className = 'course-scroll';

    coursesInProgressList.appendChild(scrollContainer);
    scrollContainer.appendChild(courseScroll);

    coursesInProgress.forEach(progress => {
        fetchCourseDetails(progress.courseId)
            .then(course => {
                if (!course) return;

                const inProgressCard = document.createElement('div');
                inProgressCard.className = 'course-card in-progress';
                inProgressCard.dataset.courseId = course.id;

                // Format the date and time
                const startDateTime = new Date(progress.startTime);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
                const formattedDate = startDateTime.toLocaleDateString(undefined, dateOptions);
                const formattedTime = startDateTime.toLocaleTimeString(undefined, timeOptions);

                inProgressCard.innerHTML = `
                    <img src="${course.thumbnail}" alt="Course Thumbnail">
                    <div class="course-details">
                        <div class="course-content">
                            <h3>${course.title}</h3>
                            <p>${course.description}</p>
                            <div class="course-meta">
                                <span class="course-category">${course.category.name}</span>
                                <span class="course-level ${course.level.name.toLowerCase()}">${course.level.name}</span>
                            </div>
                        </div>
                        <div class="progress-info">
                            <div class="start-date">
                                <i class="far fa-calendar"></i>
                                <span>Started on: ${formattedDate}</span>
                            </div>
                            <div class="start-time">
                                <i class="far fa-clock"></i>
                                <span>at ${formattedTime}</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <a href="${course.url}" class="continue-learning-btn">
                                <i class="fas fa-play-circle"></i> Continue Learning
                            </a>
                            <button class="complete-course-btn" onclick="markCourseAsCompleted(${course.id})">
                                <i class="fas fa-check-circle"></i> Mark as Completed
                            </button>
                            <button class="review-course-btn" onclick="showReviewsModal(${course.id})">
                                <i class="fas fa-star"></i> View Course Reviews
                            </button>
                        </div>
                    </div>
                `;

                courseScroll.appendChild(inProgressCard);
            })
            .catch(error => {
                console.error("Error fetching course details:", error);
            });
    });

    inProgressSection.appendChild(coursesInProgressList);
}

// Add function to mark a course as completed
function markCourseAsCompleted(courseId) {
    // Create and show the duration input popup
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "duration-modal-overlay";
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
        <span id="duration-close" style="position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; color: #888;">&times;</span>
        <h2 style="margin-bottom: 15px;">Course Completion</h2>
        <p style="margin-bottom: 20px;">How long did it take you to complete this course?</p>
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
        <button id="duration-submit" style="padding: 10px 25px; background: #FFD700; border: none; border-radius: 4px; color: #fff; font-size: 16px; cursor: pointer;">Submit</button>
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

    // Handle modal interactions
    modalOverlay.addEventListener("click", async (event) => {
        if (event.target.id === "duration-close") {
            document.body.removeChild(modalOverlay);
            return;
        }

        if (event.target.id === "duration-submit") {
            const hours = parseInt(document.getElementById("completion-hours").value, 10);
            const minutes = parseInt(document.getElementById("completion-minutes").value, 10);

            try {
                // First, fetch the course in progress to get the start time
                const courseResponse = await fetch(`/api/course-in-progress/get/${courseId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                
                let startTime = new Date().toISOString(); // Default fallback
                
                if (courseResponse.ok) {
                    const courseData = await courseResponse.json();
                    if (courseData && courseData.startTime) {
                        startTime = courseData.startTime;
                        console.log(`Course ${courseId} started at: ${startTime}`);
                    } else {
                        console.warn(`No valid start time found for course ${courseId}, using current time instead.`);
                    }
                } else {
                    console.warn(`Failed to fetch course in progress information for course ${courseId}, using current time instead.`);
                }
                
                // Remove the course from courses in progress
                const removeResponse = await fetch(`/api/course-in-progress/${courseId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (!removeResponse.ok) {
                    throw new Error("Failed to remove course from progress");
                }

                // Then save as completed with the entered duration and the original start time
                const completionData = {
                    courseId: courseId,
                    startTime: startTime, // Use the original start time
                    completionTime: new Date().toISOString(),
                    durationHours: hours,
                    durationMinutes: minutes
                };

                const completionResponse = await fetch("/api/course-completion", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(completionData)
                });

                if (!completionResponse.ok) {
                    throw new Error("Failed to save course completion");
                }

                // Remove the course card from the DOM
                const courseCard = document.querySelector(`.course-card[data-course-id="${courseId}"]`);
                if (courseCard) {
                    courseCard.remove();
                }

                // If no more courses in progress, show the empty message
                const courseScroll = document.querySelector('.course-scroll');
                if (courseScroll && courseScroll.children.length === 0) {
                    const noCoursesMessage = document.createElement('div');
                    noCoursesMessage.className = 'no-courses-message';
                    noCoursesMessage.innerHTML = `
                        <i class="fas fa-book"></i>
                        <p>You don't have any courses in progress.</p>
                    `;
                    courseScroll.parentElement.appendChild(noCoursesMessage);
                }

                // Remove the modal and reload the dashboard
                document.body.removeChild(modalOverlay);
                
                // Show the ratings modal for the completed course
                showRatingsModal(courseId);
                
                // No automatic page reload - we'll let the rating submission handle that
            } catch (error) {
                console.error("Error completing course:", error);
                alert(`Error: ${error.message || "Failed to complete the course. Please try again."}`);
                document.body.removeChild(modalOverlay);
            }
        }
    });
}

// Add function to load courses in progress
async function loadCoursesInProgress() {
    try {
        const response = await fetch("/api/course-in-progress/my");
        if (!response.ok) {
            throw new Error("Failed to fetch courses in progress");
        }
        const coursesInProgress = await response.json();

        // Sort courses by start time (newest first)
        coursesInProgress.sort((a, b) => {
            return new Date(b.startTime) - new Date(a.startTime);
        });

        displayCoursesInProgress(coursesInProgress);
    } catch (error) {
        console.error("Error loading courses in progress:", error);
    }
}

// Update the existing loadDashboard function to include courses in progress
async function loadDashboard() {
    if (!isDashboardPage()) return;

    await Promise.all([
        loadCompletedCourses(),
        loadCoursesInProgress(),
        // ... other existing load functions ...
    ]);
}

// Function to update all review counts on the dashboard
async function updateAllReviewCounts() {
    console.log('Updating all review counts on dashboard page');
    
    // Get all review buttons, including those with inline onclick handlers
    const allButtons = document.querySelectorAll('.reviews-btn');
    console.log(`Found ${allButtons.length} total review buttons on the page`);
    
    if (allButtons.length === 0) {
        console.log('No review buttons found on this page');
        return;
    }
    
    // Create an array of promises for parallel processing
    const promises = Array.from(allButtons).map(async (button) => {
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
            let starRating = button.querySelector('.star-rating');
            if (!starRating) {
                // Create new star rating element if it doesn't exist
                starRating = document.createElement('div');
                starRating.className = 'star-rating';
                
                // Add it to the beginning of the button
                if (button.firstChild) {
                    button.insertBefore(starRating, button.firstChild);
                } else {
                    button.appendChild(starRating);
                }
            }
            
            // Set the HTML content with stars
            starRating.innerHTML = renderStars(averageRating);
            
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

// Function to debug review buttons on the dashboard
function debugReviewButtons() {
    console.log('🔎 Debugging review buttons on dashboard');
    
    // Get all review buttons
    const allButtons = document.querySelectorAll('.reviews-btn');
    console.log(`Found ${allButtons.length} total review buttons`);
    
    // Log details for each button
    allButtons.forEach((button, index) => {
        const courseId = button.getAttribute('data-course-id') || button.dataset.courseId;
        const hasOnclick = button.hasAttribute('onclick');
        const onclickValue = hasOnclick ? button.getAttribute('onclick') : 'none';
        const hasHandler = button.getAttribute('data-handler-attached') === 'true';
        
        console.log(`Button ${index+1}:`, {
            courseId,
            hasStarRating: !!button.querySelector('.star-rating'),
            hasReviewCount: !!button.querySelector('.review-count'),
            hasOnclick,
            onclickValue,
            hasHandler,
            outerHTML: button.outerHTML.substring(0, 100) + (button.outerHTML.length > 100 ? '...' : '')
        });
    });
    
    // Check if the modal exists
    const modal = document.getElementById('reviews-modal-overlay');
    console.log('Modal exists:', !!modal);
    if (modal) {
        console.log('Modal display:', modal.style.display);
        console.log('Modal content exists:', !!document.getElementById('reviews-modal-content'));
        console.log('Review count element exists:', !!document.getElementById('review-count'));
        console.log('Reviews list exists:', !!document.getElementById('reviews-list'));
    }
}

// Call debug function after a short delay to ensure DOM is fully loaded
setTimeout(debugReviewButtons, 1000);

// Modify initializeRecommendedCoursesReviews to call the debug function
async function initializeRecommendedCoursesReviews() {
    console.log('Initializing review buttons for recommended courses on dashboard');
    
    // Select review buttons in recommended courses section
    const recommendedButtons = document.querySelectorAll('.recommended-courses .reviews-btn, .level-Courses .reviews-btn');
    console.log(`Found ${recommendedButtons.length} review buttons in recommended courses sections`);
    
    // Process each button
    for (const button of recommendedButtons) {
        // Get courseId from data attribute or dataset
        let courseId = button.getAttribute('data-course-id');
        if (!courseId && button.dataset.courseId) {
            courseId = button.dataset.courseId;
        }
        
        if (!courseId) {
            console.warn('Review button missing course ID, html:', button.outerHTML);
            continue;
        }
        
        console.log(`Initializing reviews for recommended course ID: ${courseId}`);
        
        try {
            // Fetch reviews and calculate ratings
            const reviews = await fetchReviewsForCourse(courseId);
            console.log(`Course ${courseId} fetched ${reviews.length} reviews:`, reviews);
            
            const reviewCount = reviews.length;
            const averageRating = calculateAverageRating(reviews);
            
            console.log(`Recommended course ${courseId} has ${reviewCount} reviews with avg rating ${averageRating}`);
            
            // Create star rating HTML
            let starRating = button.querySelector('.star-rating');
            if (!starRating) {
                starRating = document.createElement('div');
                starRating.className = 'star-rating';
                
                // Insert at beginning of button
                if (button.firstChild) {
                    button.insertBefore(starRating, button.firstChild);
                } else {
                    button.appendChild(starRating);
                }
            }
            
            // Update the star rating with stars
            starRating.innerHTML = renderStars(averageRating);
            
            // Update review count
            const reviewCountElement = button.querySelector('.review-count');
            if (reviewCountElement) {
                reviewCountElement.textContent = `${reviewCount} ${reviewCount !== 1 ? 'Reviews' : 'Review'}`;
            }
            
            // Only add click handler if the button doesn't have one already
            // The buttons in dashboard.html already have inline onclick="showReviewsModal(this)"
            if (!button.getAttribute('data-handler-attached') && !button.hasAttribute('onclick')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    showReviewsModal(this);
                });
                button.setAttribute('data-handler-attached', 'true');
            }
        } catch (error) {
            console.error(`Error initializing review button for course ${courseId}:`, error);
        }
    }
    
    // Call debug function to verify everything is set up correctly
    debugReviewButtons();
}

// Function to show a notification message to the user
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
// Initialize when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Check if the current page is the dashboard
    if (isDashboardPage()) {
        // Load completed courses
        loadCompletedCourses();

        // Check for course completion popup
        checkForCourseCompletion();
    }
});
// Chatbot functionality
document.addEventListener("DOMContentLoaded", function () {
    const chatbotPopup = document.getElementById("chatbot-popup");
    const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
    const chatbotCloseBtn = document.getElementById("chatbot-close-btn");
    const chatbotSendBtn = document.getElementById("chatbot-send-btn");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotMessages = document.getElementById("chatbot-messages");

    // Toggle chatbot popup
    chatbotToggleBtn.addEventListener("click", () => {
        chatbotPopup.classList.toggle("open");

        // Add suggested questions when opening the chatbot if no messages exist yet
        if (chatbotPopup.classList.contains("open") && chatbotMessages.children.length === 0) {
            // Add welcome message
            const welcomeMessage = document.createElement("div");
            welcomeMessage.classList.add("chat-message", "bot");
            welcomeMessage.innerHTML = "👋 Hello! I'm your learning assistant. How can I help you today?";
            chatbotMessages.appendChild(welcomeMessage);

            // Add suggested questions
            const suggestionsElement = document.createElement("div");
            suggestionsElement.classList.add("chat-suggestions");
            suggestionsElement.innerHTML = `
                <p class="suggestions-title">Try asking me:</p>
                <div class="suggestion-chips">
                    <button class="suggestion-chip" data-question="How do I bookmark courses?">How do I bookmark courses?</button>
                    <button class="suggestion-chip" data-question="Show me my bookmarks">Show me my bookmarks</button>
                    <button class="suggestion-chip" data-question="Where can I find some courses?">Where can I find some courses?</button>
                    <button class="suggestion-chip" data-question="How do I track my progress?">How do I track my progress?</button>
                    <button class="suggestion-chip" data-question="How do I edit my profile?">How do I edit my profile?</button>
                    <button class="suggestion-chip" data-question="Recommend best courses for me">Recommend best courses for me</button>
                    <button class="suggestion-chip" data-question="How does the leaderboard work?">How does the leaderboard work?</button>
                    <button class="suggestion-chip" data-question="What is HexaHive?">What is HexaHive?</button>
                </div>
            `;
            chatbotMessages.appendChild(suggestionsElement);

            // Add event listeners to suggestion chips
            const suggestionChips = suggestionsElement.querySelectorAll('.suggestion-chip');
            suggestionChips.forEach(chip => {
                chip.addEventListener('click', handleSuggestionClick);
            });
        }
    });

    // Close chatbot popup
    chatbotCloseBtn.addEventListener("click", () => {
        chatbotPopup.classList.remove("open");
    });

    // Send message to chatbot
    chatbotSendBtn.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Function to send a message
    function sendMessage() {
        const userMessage = chatbotInput.value.trim();
        if (userMessage === "") return;

        // Display user message
        appendMessage(userMessage, "user");
        chatbotInput.value = "";

        // Check for ongoing conversation context
        const conversationContext = getChatbotContext();

        // If in a multi-turn conversation, handle accordingly
        if (conversationContext.inRecommendationFlow) {
            handleRecommendationFlow(userMessage, conversationContext);
            return;
        }

        // Check for direct game-related questions
        if (userMessage.toLowerCase().includes("hexahive") ||
            userMessage.toLowerCase().includes("game") ||
            userMessage.toLowerCase() === "what is hexahive?") {

            const hexahiveResponse = "HexaHive is our fun hexagon puzzle game " +
                " where you can take a break from learning and have fun!" +
                " You can access it from the sidebar or by <a href='/hexahive'>clicking here</a>.";

            appendMessage(hexahiveResponse, "bot");
            return;
        }

        // Check for leaderboard questions
        if (userMessage.toLowerCase().includes("leaderboard") ||
            userMessage.toLowerCase() === "how does the leaderboard work?") {

            const leaderboardResponse = "Our leaderboard shows the top ranked users based on number of hours completed." +
                "Your hours are recorded everytime you complete a course." +
                " The more you learn and complete courses, the higher you'll climb! " +
                " You can check the current rankings by visiting the Leaderboard tab or by  <a href='/leaderboard'>clicking here</a>.";

            appendMessage(leaderboardResponse, "bot");
            return;
        }

        // Check for direct course recommendation requests that can be handled locally
        if ((userMessage.toLowerCase().includes("recommend") &&
                userMessage.toLowerCase().includes("course")) ||
            userMessage.toLowerCase() === "recommend courses for me") {

            // Start recommendation flow
            startRecommendationFlow();
            return;
        }

        // Check for bookmarks request
        if (userMessage.toLowerCase().includes("show me my bookmarks") ||
            userMessage.toLowerCase().includes("view my bookmarks") ||
            userMessage.toLowerCase().includes("see my bookmarks")) {

            // Show loading message
            const loadingMessage = document.createElement("div");
            loadingMessage.classList.add("chat-message", "bot", "loading-message");
            loadingMessage.innerHTML = "Fetching your bookmarks...";
            chatbotMessages.appendChild(loadingMessage);

            // Get bookmarks preview
            const bookmarksPromise = showBookmarkedCoursesPreview();

            // Handle both Promise and string returns
            if (bookmarksPromise instanceof Promise) {
                bookmarksPromise
                    .then(response => {
                        // Remove loading message
                        chatbotMessages.removeChild(loadingMessage);
                        // Add bookmarks preview
                        appendMessage(response, "bot");
                    })
                    .catch(error => {
                        // Remove loading message
                        chatbotMessages.removeChild(loadingMessage);
                        console.error("Error loading bookmarks:", error);
                        appendMessage("Sorry, I had trouble loading your bookmarks. Please try visiting the <a href='/bookmarks.html'>Bookmarks page</a> directly.", "bot");
                    });
            } else {
                // Remove loading message
                chatbotMessages.removeChild(loadingMessage);
                // Add bookmarks preview (direct string response)
                appendMessage(bookmarksPromise, "bot");
            }
            return;
        } else if (userMessage.toLowerCase().includes("beginner") &&
            userMessage.toLowerCase().includes("course")) {
            const recommendationResponse = "Here are some beginner courses that might interest you:<br><br>" +
                getCourseRecommendations(null, "Beginner") +
                "<br>View all courses on the <a href='/course'>courses page</a> where you can apply filters for better results.";
            appendMessage(recommendationResponse, "bot");
            return;
        }

        // Show a temporary "thinking" message
        const typingIndicator = document.createElement("div");
        typingIndicator.classList.add("chat-message", "bot", "typing-indicator");
        typingIndicator.innerHTML = "Thinking...";
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Send message to server
        fetch('/api/simple-chatbot/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Remove typing indicator
                chatbotMessages.removeChild(typingIndicator);

                // Check for special response types from the backend
                if (data.special === "course_recommendation") {
                    // This is a course recommendation request - start flow
                    startRecommendationFlow();
                }
                else if (data.special === "show_bookmarks") {
                    // This is a request to show bookmarks
                    // Show loading message
                    const loadingMessage = document.createElement("div");
                    loadingMessage.classList.add("chat-message", "bot", "loading-message");
                    loadingMessage.innerHTML = "Fetching your bookmarks...";
                    chatbotMessages.appendChild(loadingMessage);

                    // Get bookmarks preview
                    const bookmarksPromise = showBookmarkedCoursesPreview();

                    // Handle both Promise and string returns
                    if (bookmarksPromise instanceof Promise) {
                        bookmarksPromise
                            .then(response => {
                                // Remove loading message
                                chatbotMessages.removeChild(loadingMessage);
                                // Add bookmarks preview
                                appendMessage(response, "bot");
                            })
                            .catch(error => {
                                // Remove loading message
                                chatbotMessages.removeChild(loadingMessage);
                                console.error("Error loading bookmarks:", error);
                                appendMessage("Sorry, I had trouble loading your bookmarks. Please try visiting the <a href='/bookmarks.html'>Bookmarks page</a> directly.", "bot");
                            });
                    } else {
                        // Remove loading message
                        chatbotMessages.removeChild(loadingMessage);
                        // Add bookmarks preview (direct string response)
                        appendMessage(bookmarksPromise, "bot");
                    }
                }
                else {
                    // Regular response
                    appendMessage(data.response, "bot");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Remove typing indicator
                chatbotMessages.removeChild(typingIndicator);

                // Handle network error by using fallback response
                console.log("Using fallback response due to network error");

                // Check if this is a recommendation request
                if (userMessage.toLowerCase().includes("recommend") && userMessage.toLowerCase().includes("course")) {
                    startRecommendationFlow();
                } else {
                    // For other queries, use the mock response
                    const fallbackResponse = getMockResponse(userMessage);
                    appendMessage(fallbackResponse, "bot");
                }
            });
    }

    // Function to start a recommendation flow conversation
    function startRecommendationFlow() {
        // Set context to indicate we're in a recommendation flow
        setChatbotContext({
            inRecommendationFlow: true,
            step: "category",
            category: null,
            level: null
        });

        // Ask for category preference - only include the requested categories
        const categoryOptions = ["AI", "Cybersecurity", "Cloud Computing", "Data Science"];

        let response = "I'd be happy to recommend the best courses for you! First, what category are you interested in?<br><br>";
        response += "<div class='chatbot-options'>";

        categoryOptions.forEach(category => {
            response += `<button class="chatbot-option-btn" data-value="${category}">${category}</button>`;
        });

        response += `<button class="chatbot-option-btn" data-value="any">Any category</button>`;
        response += "</div>";

        appendMessage(response, "bot");
    }

    // Function to handle the recommendation flow conversation
    function handleRecommendationFlow(userMessage, context) {
        const lowerMessage = userMessage.toLowerCase();

        if (context.step === "category") {
            // Process user's category selection
            let selectedCategory = null;

            // Check for category in the message - only include the requested categories
            if (lowerMessage.includes("ai") || lowerMessage.includes("artificial intelligence") || lowerMessage.includes("machine learning")) {
                selectedCategory = "AI";
            } else if (lowerMessage.includes("cyber") || lowerMessage.includes("security")) {
                selectedCategory = "Cybersecurity";
            } else if (lowerMessage.includes("cloud") || lowerMessage.includes("aws") || lowerMessage.includes("azure")) {
                selectedCategory = "Cloud Computing";
            } else if (lowerMessage.includes("data") || lowerMessage.includes("analytics")) {
                selectedCategory = "Data Science";
            } else if (lowerMessage.includes("any") || lowerMessage.includes("all") || lowerMessage.includes("doesn't matter")) {
                selectedCategory = "any";
            }

            if (selectedCategory) {
                // Update context with selected category
                const newContext = {
                    ...context,
                    step: "level",
                    category: selectedCategory === "any" ? null : selectedCategory
                };
                setChatbotContext(newContext);

                // Ask for level preference
                const levelOptions = ["Beginner", "Intermediate", "Advanced"];

                let response = `Great! What skill level are you looking for?<br><br>`;
                response += "<div class='chatbot-options'>";

                levelOptions.forEach(level => {
                    response += `<button class="chatbot-option-btn" data-value="${level}">${level}</button>`;
                });

                response += `<button class="chatbot-option-btn" data-value="any">Any level</button>`;
                response += "</div>";

                appendMessage(response, "bot");
            } else {
                // Couldn't determine category, ask again
                appendMessage("I'm not sure which category you're interested in. Please select one of the options above or type the category name.", "bot");
            }
        } else if (context.step === "level") {
            // Process user's level selection
            let selectedLevel = null;

            // Check for level in the message
            if (lowerMessage.includes("beginner") || lowerMessage.includes("basic") || lowerMessage.includes("start")) {
                selectedLevel = "Beginner";
            } else if (lowerMessage.includes("intermediate") || lowerMessage.includes("medium")) {
                selectedLevel = "Intermediate";
            } else if (lowerMessage.includes("advanced") || lowerMessage.includes("expert")) {
                selectedLevel = "Advanced";
            } else if (lowerMessage.includes("any") || lowerMessage.includes("all") || lowerMessage.includes("doesn't matter")) {
                selectedLevel = "any";
            }

            if (selectedLevel) {
                // Show loading message
                const loadingMessage = document.createElement("div");
                loadingMessage.classList.add("chat-message", "bot", "loading-message");
                loadingMessage.innerHTML = "Searching for courses...";
                chatbotMessages.appendChild(loadingMessage);

                // Provide course recommendations based on selected category and level
                const category = context.category;
                const level = selectedLevel === "any" ? null : selectedLevel;

                let responseIntro;
                if (category && level) {
                    responseIntro = `Based on your preferences, here are some ${level.toLowerCase()} ${category} courses that might interest you:`;
                } else if (category) {
                    responseIntro = `Based on your preferences, here are some ${category} courses that might interest you:`;
                } else if (level) {
                    responseIntro = `Based on your preferences, here are some ${level.toLowerCase()} courses that might interest you:`;
                } else {
                    responseIntro = "Based on your preferences, here are some popular courses that might interest you:";
                }

                // Get course recommendations (now returns a Promise)
                const recommendationsPromise = getCourseRecommendations(category, level);

                // Handle both Promise and string returns
                if (recommendationsPromise instanceof Promise) {
                    recommendationsPromise
                        .then(courseRecommendations => {
                            // Remove loading message
                            chatbotMessages.removeChild(loadingMessage);

                            if (courseRecommendations.includes("No courses found")) {
                                appendMessage(`${responseIntro}<br><br>I couldn't find exact matches for your criteria, but here are some other courses you might like:<br><br>${getCourseRecommendations()}`, "bot");
                            } else {
                                appendMessage(`${responseIntro}<br><br>${courseRecommendations}<br><br>Would you like recommendations for any other category or skill level? (You can ask "Recommend courses for me" anytime)`, "bot");
                            }

                            // Reset the context
                            resetChatbotContext();
                        })
                        .catch(error => {
                            // Remove loading message
                            chatbotMessages.removeChild(loadingMessage);
                            console.error("Error getting course recommendations:", error);
                            appendMessage("Sorry, I had trouble finding courses for you. Please try again later.", "bot");
                            // Reset the context
                            resetChatbotContext();
                        });
                } else {
                    // Handle string return (fallback case)
                    chatbotMessages.removeChild(loadingMessage);
                    if (recommendationsPromise.includes("No courses found")) {
                        appendMessage(`${responseIntro}<br><br>I couldn't find exact matches for your criteria, but here are some other courses you might like:<br><br>${getCourseRecommendations()}`, "bot");
                    } else {
                        appendMessage(`${responseIntro}<br><br>${recommendationsPromise}<br><br>Would you like recommendations for any other category or skill level? (You can ask "Recommend courses for me" anytime)`, "bot");
                    }

                    // Reset the context
                    resetChatbotContext();
                }
            } else {
                // Couldn't determine level, ask again
                appendMessage("I'm not sure which skill level you're looking for. Please select one of the options above or type the level.", "bot");
            }
        }
    }

    // Function to get current chatbot context
    function getChatbotContext() {
        // Try to get context from sessionStorage
        const contextString = sessionStorage.getItem('chatbotContext');
        if (contextString) {
            try {
                return JSON.parse(contextString);
            } catch (e) {
                console.error("Error parsing chatbot context:", e);
            }
        }

        // Default context
        return {
            inRecommendationFlow: false,
            step: null,
            category: null,
            level: null
        };
    }

    // Function to set chatbot context
    function setChatbotContext(context) {
        sessionStorage.setItem('chatbotContext', JSON.stringify(context));
    }

    // Function to reset chatbot context
    function resetChatbotContext() {
        const defaultContext = {
            inRecommendationFlow: false,
            step: null,
            category: null,
            level: null
        };
        setChatbotContext(defaultContext);
    }

    // Function to append a message to the chat
    function appendMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message", sender);

        // Special handling for bot messages with course recommendations or option buttons
        if (sender === "bot" && (message.includes("chatbot-course-recommendations") || message.includes("chatbot-options"))) {
            messageElement.innerHTML = message;

            // Add event handlers for course recommendation cards if present
            const courseCards = messageElement.querySelectorAll('.chatbot-course-card');
            courseCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    // Prevent click from bubbling if it's on the view button
                    if (e.target.classList.contains('chatbot-view-course')) {
                        return;
                    }

                    // Otherwise navigate to the course page when clicking the card
                    const viewButton = this.querySelector('.chatbot-view-course');
                    if (viewButton) {
                        window.location.href = viewButton.getAttribute('href');
                    }
                });
            });

            // Add event handlers for option buttons if present
            const optionButtons = messageElement.querySelectorAll('.chatbot-option-btn');
            optionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    chatbotInput.value = value;
                    sendMessage();
                });
            });
        } else {
            // For regular messages, handle links specially
            messageElement.innerHTML = message;

            if (sender === "bot") {
                // Make sure links open in a new tab and have proper styling
                const links = messageElement.querySelectorAll('a');
                links.forEach(link => {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.style.color = '#0066cc';
                    link.style.textDecoration = 'underline';

                    // Add a slight highlight effect when hovering over links
                    link.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = 'rgba(0, 102, 204, 0.1)';
                    });

                    link.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'transparent';
                    });
                });
            }
        }

        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll to bottom

        // Add a subtle animation to the new message
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(10px)';

        setTimeout(() => {
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 10);
    }

    // Function to handle suggestion chip clicks
    function handleSuggestionClick(event) {
        const question = event.target.getAttribute("data-question");

        // Reset any previous conversation context first
        resetChatbotContext();

        // Set input value to the question
        chatbotInput.value = question;

        // Trigger send
        sendMessage();
    }
});

// Fallback responses when the server is unavailable
function getMockResponse(message) {
    message = message.toLowerCase();

    // Profile
    if (message.includes("profile") || message.includes("edit profile") || message.includes("account")) {
        return "You can update your profile by clicking on your profile picture in the top right corner and selecting 'Edit Profile', or by visiting your <a href='/profile'>profile page</a>.";
    }

    // Course tracking
    if (message.includes("track") && (message.includes("progress") || message.includes("courses"))) {
        return "Your course progress is tracked automatically. You can view your current progress in the 'Courses in Progress' section on your <a href='/dashboard'>dashboard</a> and your complete learning history on your <a href='/profile'>profile page</a>.";
    }

    // Bookmarks
    if (message.includes("bookmark") || message.includes("save course")) {
        return "You can bookmark courses by clicking the bookmark icon on any course card. View your bookmarks by clicking on <a href='/bookmarks.html'>Bookmarks</a> in the sidebar or hovering over the bookmark icon in the sidebar to see a quick preview.";
    }

    // HexaHive game
    if (message.includes("hexahive") || message.includes("game")) {
        return "HexaHive is our fun hexagon puzzle game where you can take a break from learning and have fun. You can access it from the sidebar or by <a href='/hexahive'>clicking here</a>.";
    }

    // Leaderboard
    if (message.includes("leaderboard") || message.includes("ranking") || message.includes("score")) {
        return "Our leaderboard shows the top ranked users based on number of hours completed. Your hours are recorded everytime you complete a course. The more you learn and complete courses, the higher you'll climb! You can check the current rankings by visiting the Leaderboard tab or by <a href='/leaderboard'>clicking here</a>.";
    }

    // Courses
    if (message.includes("course") || message.includes("class") || message.includes("learn")) {
        return "We have a variety of courses available. You can browse them on the <a href='/course'>courses page</a> or use specific filters to find what interests you.";
    }

    // Default response
    return "I'm sorry, but I'm having trouble connecting to the server right now. Please try again later or browse our <a href='/course'>course catalog</a> directly.";
}

// Function to show bookmarked courses in chatbot
function showBookmarkedCoursesPreview() {
    // Get bookmarks from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

    if (bookmarks.length === 0) {
        return "You don't have any bookmarked courses yet. You can bookmark courses by clicking the bookmark icon on any course card.";
    }

    // Limit to showing at most 3 bookmarks in preview
    const displayedBookmarks = bookmarks.slice(0, 3);

    let html = "Here are your bookmarked courses:<br><br>";
    html += "<div class='chatbot-course-recommendations'>";

    // Create promises to fetch course details
    const fetchPromises = displayedBookmarks.map(async (bookmarkId) => {
        try {
            const response = await fetch(`/api/courses/${bookmarkId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch course ${bookmarkId}`);
            }
            const course = await response.json();

            // Use the course's thumbnail directly from the course object
            const thumbnail = course.thumbnail || '/photos/course-default.jpg';

            return `
                <div class='chatbot-course-card'>
                    <div class='chatbot-course-img' style='background-image: url("${thumbnail}");'></div>
                    <div class='chatbot-course-content'>
                        <h4>${course.title}</h4>
                        <p>${course.description}</p>
                        <a href='/course' class='chatbot-view-course'>View Course</a>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Error fetching course details:", error);
            return `
                <div class='chatbot-course-card'>
                    <div class='chatbot-course-img' style='background-image: url("/photos/course-default.jpg");'></div>
                    <div class='chatbot-course-content'>
                        <h4>Course ID: ${bookmarkId}</h4>
                        <p>Unable to load course details</p>
                        <a href='/course' class='chatbot-view-course'>View Course</a>
                    </div>
                </div>
            `;
        }
    });

    // Handle the case where fetchCourseDetails might not exist or fail
    if (typeof fetch !== 'function') {
        // Fallback if fetch is not available
        html += displayedBookmarks.map(bookmarkId => `
            <div class='chatbot-course-card'>
                <div class='chatbot-course-img' style='background-image: url("/photos/course-default.jpg");'></div>
                <div class='chatbot-course-content'>
                    <h4>Bookmarked Course</h4>
                    <p>Course ID: ${bookmarkId}</p>
                    <a href='/course' class='chatbot-view-course'>View Course</a>
                </div>
            </div>
        `).join('');
        html += "</div>";

        if (bookmarks.length > 3) {
            html += `<br>You have ${bookmarks.length} bookmarked courses. <a href='/bookmarks.html'>View all bookmarks</a>`;
        }

        return html;
    }

    // Use Promise.all to fetch all course details asynchronously
    return new Promise((resolve) => {
        Promise.all(fetchPromises)
            .then(courseHtmlArray => {
                html += courseHtmlArray.join('');
                html += "</div>";

                if (bookmarks.length > 3) {
                    html += `<br>You have ${bookmarks.length} bookmarked courses. <a href='/bookmarks.html'>View all bookmarks</a>`;
                }

                resolve(html);
            })
            .catch(error => {
                console.error("Error loading bookmarks:", error);
                resolve("Sorry, I had trouble loading your bookmarks. Please try visiting the <a href='/bookmarks.html'>Bookmarks page</a> directly.");
            });
    });
}

// Function to generate course recommendations based on category and level
function getCourseRecommendations(category = null, level = null) {
    // First try to get real course data from the API
    if (typeof fetch === 'function') {
        return fetchRealCourseRecommendations(category, level);
    }

    // Fallback to sample data if API fetch isn't available
    return getStaticCourseRecommendations(category, level);
}

// Function to fetch real course recommendations from the API
function fetchRealCourseRecommendations(category = null, level = null) {
    return new Promise((resolve) => {
        // Build query parameters
        let queryParams = new URLSearchParams();
        if (category) queryParams.append("category", category);
        if (level) queryParams.append("level", level);

        // Fetch courses from API
        fetch(`/api/courses/search-and-filter?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                return response.json();
            })
            .then(courses => {
                // Limit to 3 courses for display
                const limitedCourses = courses.slice(0, 3);

                if (limitedCourses.length === 0) {
                    // No courses found
                    resolve("No courses found matching your criteria. Please try a different category or level.");
                    return;
                }

                // Generate HTML for courses
                let html = "<div class='chatbot-course-recommendations'>";
                limitedCourses.forEach(course => {
                    html += `
                        <div class='chatbot-course-card'>
                            <div class='chatbot-course-img' style='background-image: url("${course.thumbnail || '/photos/course-default.jpg'}");'></div>
                            <div class='chatbot-course-content'>
                                <h4>${course.title}</h4>
                                <p>${course.description}</p>
                                <a href='/course' class='chatbot-view-course'>View Course</a>
                            </div>
                        </div>
                    `;
                });
                html += "</div>";

                resolve(html);
            })
            .catch(error => {
                console.error("Error fetching course recommendations:", error);
                // Fall back to static recommendations
                const staticRecommendations = getStaticCourseRecommendations(category, level);
                resolve(staticRecommendations);
            });
    });
}

// Function for static course recommendations without API
function getStaticCourseRecommendations(category = null, level = null) {
    // Sample course data (in a real implementation, this would come from an API)
    const courses = {
        "AI": {
            "Beginner": [
                {title: "Introduction to AI Concepts", description: "Learn the fundamentals of AI and machine learning", img: "/photos/ai-intro.jpg"},
                {title: "Python for AI Beginners", description: "Build your first AI models with Python", img: "/photos/python-ai.jpg"}
            ],
            "Intermediate": [
                {title: "Neural Networks Fundamentals", description: "Understand and build simple neural networks", img: "/photos/neural-network.jpg"},
                {title: "Natural Language Processing", description: "Process and analyze text with AI techniques", img: "/photos/nlp.jpg"}
            ],
            "Advanced": [
                {title: "Deep Reinforcement Learning", description: "Master advanced AI learning techniques", img: "/photos/reinforcement.jpg"},
                {title: "AI Research Methods", description: "Cutting-edge approaches in AI research", img: "/photos/ai-research.jpg"}
            ]
        },
        "Cybersecurity": {
            "Beginner": [
                {title: "Cybersecurity Fundamentals", description: "Essential security concepts for everyone", img: "/photos/cyber-basics.jpg"},
                {title: "Introduction to Ethical Hacking", description: "Learn the basics of security testing", img: "/photos/ethical-hacking.jpg"}
            ],
            "Intermediate": [
                {title: "Network Security", description: "Protect systems against network-based attacks", img: "/photos/network-security.jpg"},
                {title: "Cryptography Essentials", description: "Understanding encryption and secure communications", img: "/photos/cryptography.jpg"}
            ],
            "Advanced": [
                {title: "Advanced Penetration Testing", description: "Professional security testing techniques", img: "/photos/pentest.jpg"},
                {title: "Security Incident Response", description: "Managing and responding to security breaches", img: "/photos/incident-response.jpg"}
            ]
        },
        "Cloud Computing": {
            "Beginner": [
                {title: "Cloud Computing Basics", description: "Introduction to cloud platforms and services", img: "/photos/cloud-basics.jpg"},
                {title: "AWS Fundamentals", description: "Getting started with Amazon Web Services", img: "/photos/aws.jpg"}
            ],
            "Intermediate": [
                {title: "Cloud Architecture", description: "Designing scalable cloud solutions", img: "/photos/cloud-architecture.jpg"},
                {title: "Containerization with Docker", description: "Building and deploying containerized applications", img: "/photos/docker.jpg"}
            ],
            "Advanced": [
                {title: "Kubernetes Mastery", description: "Advanced container orchestration", img: "/photos/kubernetes.jpg"},
                {title: "Multi-Cloud Strategies", description: "Managing services across cloud providers", img: "/photos/multi-cloud.jpg"}
            ]
        },
        "Data Science": {
            "Beginner": [
                {title: "Introduction to Data Science", description: "The fundamentals of working with data", img: "/photos/data-science-intro.jpg"},
                {title: "Data Visualization Basics", description: "Creating effective data visualizations", img: "/photos/data-viz.jpg"}
            ],
            "Intermediate": [
                {title: "Statistical Analysis with Python", description: "Using Python for statistical modeling", img: "/photos/stats-python.jpg"},
                {title: "Machine Learning Fundamentals", description: "Building predictive models with data", img: "/photos/ml-fundamentals.jpg"}
            ],
            "Advanced": [
                {title: "Advanced Data Mining", description: "Extracting insights from complex datasets", img: "/photos/data-mining.jpg"},
                {title: "Big Data Processing", description: "Working with massive datasets at scale", img: "/photos/big-data.jpg"}
            ]
        }
    };

    // Define popular courses as fallback from the allowed categories
    const popularCourses = [
        {title: "Introduction to AI", description: "Learn the fundamentals of artificial intelligence", img: "/photos/ai-intro.jpg"},
        {title: "Cloud Computing Basics", description: "Introduction to cloud platforms and services", img: "/photos/cloud-basics.jpg"},
        {title: "Cybersecurity Fundamentals", description: "Essential security concepts for everyone", img: "/photos/cyber-basics.jpg"}
    ];

    let recommendedCourses = [];

    // Filter courses based on category and level
    if (category && level && courses[category] && courses[category][level]) {
        recommendedCourses = courses[category][level];
    } else if (category && courses[category]) {
        // If only category is specified, get courses from all levels
        Object.values(courses[category]).forEach(levelCourses => {
            recommendedCourses = recommendedCourses.concat(levelCourses.slice(0, 1));
        });
    } else if (level) {
        // If only level is specified, get one course from each category at that level
        Object.keys(courses).forEach(cat => {
            if (courses[cat][level]) {
                recommendedCourses.push(courses[cat][level][0]);
            }
        });
        // Limit to 3 courses
        recommendedCourses = recommendedCourses.slice(0, 3);
    } else {
        // If neither category nor level is specified, return popular courses
        recommendedCourses = popularCourses;
    }

    // If no recommended courses were found and we had specific criteria
    if (recommendedCourses.length === 0 && (category || level)) {
        return "No courses found matching your criteria. Please try a different category or level.";
    }

    // Generate HTML for recommended courses
    let html = "<div class='chatbot-course-recommendations'>";
    recommendedCourses.forEach(course => {
        html += `
            <div class='chatbot-course-card'>
                <div class='chatbot-course-img' style='background-image: url("${course.img || '/photos/course-default.jpg'}");'></div>
                <div class='chatbot-course-content'>
                    <h4>${course.title}</h4>
                    <p>${course.description}</p>
                    <a href='/course' class='chatbot-view-course'>View Course</a>
                </div>
            </div>
        `;
    });
    html += "</div>";

    return html;
}


