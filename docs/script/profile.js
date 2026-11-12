
    // Initialize any tooltips or interactive elements
    const badgeItems = document.querySelectorAll('.badge-item');
    badgeItems.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            // Add animation or effect on hover
            this.style.transform = 'translateY(-5px)';
        });
        
        badge.addEventListener('mouseleave', function() {
            // Reset on mouse leave
            this.style.transform = '';
        });
    });
