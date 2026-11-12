// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Learning history page loaded');
    
    // Format dates and times for better display
    function formatDateAndTime() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            // Get the date data attributes
            const dateStr = item.getAttribute('data-date');
            const duration = parseFloat(item.getAttribute('data-duration') || '0');
            const status = item.getAttribute('data-status');
            
            if (dateStr) {
                console.log(`Timeline item date: ${dateStr}, status: ${status}, duration: ${duration}`);
            }
        });
    }
    
    // Call the formatting function
    formatDateAndTime();
    
    // Add sorting functionality
    function setupSorting() {
        // Sort by newest first (default)
        let currentSortOrder = 'newest';
        
        // Add sort controls to the page
        const historyContainer = document.querySelector('.history-container');
        if (historyContainer) {
            const sortControls = document.createElement('div');
            sortControls.className = 'sort-controls';
            sortControls.innerHTML = `
                <span>Sort by: </span>
                <button id="sort-newest" class="sort-btn active">Newest First</button>
                <button id="sort-oldest" class="sort-btn">Oldest First</button>
            `;
            
            // Insert at the top of the container
            historyContainer.insertBefore(sortControls, historyContainer.firstChild);
            
            // Add event listeners
            document.getElementById('sort-newest').addEventListener('click', function() {
                if (currentSortOrder !== 'newest') {
                    sortItems('newest');
                    currentSortOrder = 'newest';
                    updateSortButtons();
                }
            });
            
            document.getElementById('sort-oldest').addEventListener('click', function() {
                if (currentSortOrder !== 'oldest') {
                    sortItems('oldest');
                    currentSortOrder = 'oldest';
                    updateSortButtons();
                }
            });
        }
        
        function updateSortButtons() {
            document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`sort-${currentSortOrder}`).classList.add('active');
        }
        
        function sortItems(order) {
            // Get all sections
            const sections = document.querySelectorAll('.history-section');
            
            sections.forEach(section => {
                const timeline = section.querySelector('.completion-timeline');
                const items = Array.from(timeline.querySelectorAll('.timeline-item'));
                
                // Sort items by date
                items.sort((a, b) => {
                    const dateA = new Date(a.getAttribute('data-date'));
                    const dateB = new Date(b.getAttribute('data-date'));
                    
                    return order === 'newest' ? dateB - dateA : dateA - dateB;
                });
                
                // Reappend items in the new order
                items.forEach(item => timeline.appendChild(item));
            });
        }
    }
    
    // Call setup sorting
    setupSorting();
    
    // Initialize interaction features
    function initInteractions() {
        // Add hover effects for timeline items
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
                this.style.transition = 'transform 0.2s, background-color 0.2s';
                
                // Different highlight color based on status
                const status = this.getAttribute('data-status');
                if (status === 'in-progress') {
                    this.style.backgroundColor = '#f0f7ff'; // Light blue for in progress
                } else if (status === 'completed') {
                    this.style.backgroundColor = '#f0fff0'; // Light green for completed
                } else {
                    this.style.backgroundColor = '#f5f5f5'; // Default light gray
                }
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.backgroundColor = '';
            });
        });
    }
    
    // Initialize interactions
    initInteractions();
}); 