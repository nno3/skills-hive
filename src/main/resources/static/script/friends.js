function acceptFriend(friendshipId) {
    fetch('/friends/accept/' + friendshipId, { method: 'POST' })
        .then(response => { if(response.ok) location.reload(); });
}

function declineFriend(friendshipId) {
    fetch('/friends/decline/' + friendshipId, { method: 'POST' })
        .then(response => { if(response.ok) location.reload(); });
}

// New: Remove Friend Function
function removeFriend(friendUsername) {
    console.log("removeFriend called with:", friendUsername); // Debug log
    fetch('/friends/remove/' + friendUsername, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                response.text().then(errorMessage => alert(errorMessage));
            }
        })
        .catch(error => console.error('Error removing friend:', error));
}

// Function to handle friend request submission
function handleFriendRequest(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const recipientUsername = formData.get('recipientUsername');
    const statusMessage = document.getElementById('request-status-message');

    fetch('/friends/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString(),
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return response.text().then(errorMessage => {
                    throw new Error(errorMessage);
                });
            }
        })
        .then(message => {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message success';
            statusMessage.style.display = 'block';
            form.reset(); // Clear the input field
        })
        .catch(error => {
            statusMessage.textContent = error.message;
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
        });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (e) {
    const searchDropdown = document.getElementById('search-dropdown');
    const addFriendDropdown = document.getElementById('add-friend-dropdown');
    if (!searchDropdown.contains(e.target) && e.target.id !== 'search-input') {
        searchDropdown.style.display = 'none';
    }
    if (!addFriendDropdown.contains(e.target) && e.target.id !== 'add-friend-input') {
        addFriendDropdown.style.display = 'none';
    }
});

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-input').addEventListener('input', searchFriends);
    document.getElementById('add-friend-input').addEventListener('input', searchUsersToAdd);
    document.getElementById('add-friend-form').addEventListener('submit', handleFriendRequest);
});

// Enhanced search function for friends with dropdown
function searchFriends() {
    const input = document.getElementById('search-input');
    const query = input.value.toLowerCase();
    const friendCards = document.getElementsByClassName('friend-card');
    const dropdown = document.getElementById('search-dropdown');

    dropdown.innerHTML = ''; // Clear previous content

    if (query.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    const matches = Array.from(friendCards).filter(friendCard => {
        const friendNameElement = friendCard.querySelector('p');
        return friendNameElement && friendNameElement.innerText.toLowerCase().includes(query);
    });

    if (matches.length > 0) {
        matches.forEach(friendCard => {
            const friendName = friendCard.querySelector('p').innerText;
            const option = document.createElement('div');
            option.className = 'dropdown-item';
            option.innerHTML = `<span class="bee-emoji">🐝</span> ${friendName}`;
            option.addEventListener('click', () => {
                input.value = friendName;
                dropdown.style.display = 'none';
                friendCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                friendCard.classList.add('highlight');
                setTimeout(() => friendCard.classList.remove('highlight'), 2000);
            });
            dropdown.appendChild(option);
        });
        dropdown.style.display = 'block';
    } else {
        const noMatch = document.createElement('div');
        noMatch.className = 'dropdown-item no-match';
        noMatch.textContent = 'No matching friends found';
        dropdown.appendChild(noMatch);
        dropdown.style.display = 'block';
    }
}

// Function to search for users to add as friends
function searchUsersToAdd() {
    const input = document.getElementById('add-friend-input');
    const query = input.value.trim();
    const dropdown = document.getElementById('add-friend-dropdown');

    if (query.length < 1) {
        dropdown.style.display = 'none';
        return;
    }

    fetch(`/friends/search?query=${query}`)
        .then(response => response.json())
        .then(users => {
            dropdown.innerHTML = ''; // Clear previous content
            if (users.length > 0) {
                users.forEach(user => {
                    const option = document.createElement('div');
                    option.className = 'dropdown-item';
                    option.innerHTML = `
                        <span class="bee-emoji">🐝</span>
                        <span class="user-info">${user.username}</span>
                    `;
                    option.addEventListener('click', () => {
                        input.value = user.username;
                        dropdown.style.display = 'none';
                    });
                    dropdown.appendChild(option);
                });
                dropdown.style.display = 'block';
            } else {
                const noMatch = document.createElement('div');
                noMatch.className = 'dropdown-item no-match';
                noMatch.textContent = 'No users found';
                dropdown.appendChild(noMatch);
                dropdown.style.display = 'block';
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded!'); // Debug log

    const beeButtons = document.querySelectorAll('.bee-button');
    beeButtons.forEach(beeButton => {
        beeButton.addEventListener('click', (event) => {
            console.log('Bee button clicked!'); // Debug log
            const friendCard = event.target.closest('.friend-card');
            const friendUsername = friendCard.querySelector('p').innerText;
        
            showFriendSummary(friendUsername);
        });
    });

    const modal = document.getElementById('friend-summary-modal');
    const closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function showFriendSummary(friendUsername) {
    const modal = document.getElementById('friend-summary-modal');
    const totalHoursSpan = document.getElementById('summary-total-hours');
    const highScoreSpan = document.getElementById('summary-high-score');
    const badgesDiv = document.getElementById('summary-badges');
    const bioDiv = document.getElementById('summary-bio');
    const friendNameHeader = document.getElementById('friend-name');

    fetch(`/friends/summary/${friendUsername}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Set friend name in the header
                friendNameHeader.textContent = friendUsername;
                
                // Update modal content
                totalHoursSpan.textContent = data.totalHours.toFixed(1);
                highScoreSpan.textContent = data.highestScore;
                
                // Set bio content
                bioDiv.textContent = data.bio || "No bio available";
                
                // Clear and update badges
                badgesDiv.innerHTML = '';
                if (data.badges && data.badges.length > 0) {
                    data.badges.forEach(badge => {
                        const badgeElement = document.createElement('div');
                        badgeElement.className = 'badge-item';
                        
                        // Update badge display to match dashboard format
                        badgeElement.innerHTML = `
                            <img src="${badge.imagePath}" alt="Badge Image">
                            <div class="badge-details">
                                <h3>${badge.type}</h3>
                                <p>Earned on: <span>${new Date(badge.earnedAt).toLocaleDateString()}</span></p>
                            </div>
                        `;
                        badgesDiv.appendChild(badgeElement);
                    });
                } else {
                    badgesDiv.innerHTML = '<p>No badges earned yet</p>';
                }

                // Show the modal
                modal.style.display = 'block';
            } else {
                console.error('Could not retrieve friend summary');
            }
        })
        .catch(error => {
            console.error('Error fetching friend summary:', error);
            modal.style.display = 'none';
        });
}