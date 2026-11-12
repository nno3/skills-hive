document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const searchIcon = document.getElementById("search-icon");
    const searchForm = document.getElementById("sidebar-search-form");
    const searchInput = document.getElementById("sidebar-search-input");
    const categoryFilter = document.getElementById("sidebar-category-filter");
    const levelFilter = document.getElementById("sidebar-level-filter");
    const searchButton = document.getElementById("sidebar-search-button");

    // Toggle Sidebar Collapse
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            sidebar.classList.toggle("collapsed");
        });
    }

    // Expand Sidebar and Show Search Form When Search Icon is Clicked
    searchIcon.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed"); // Expand sidebar
        }
    });

    // Handle Sidebar Search Form Submission
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission
        handleSearch();
    });

    // Handle Search Button Click
    searchButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default button behavior
        handleSearch();
    });

    // Highlight the active page in the sidebar
    highlightActivePage();

    // Function to Handle Search
    function handleSearch() {
        // Get search term, category, and level
        const searchTerm = searchInput.value.trim();
        const category = categoryFilter.value;
        const level = levelFilter.value;

        // Build the URL with query parameters
        let url = "/course"; // Redirect to the course page
        const params = [];
        if (searchTerm) params.push(`query=${encodeURIComponent(searchTerm)}`);
        if (category) params.push(`category=${encodeURIComponent(category)}`);
        if (level) params.push(`level=${encodeURIComponent(level)}`);
        if (params.length) url += `?${params.join("&")}`;

        // Redirect to the courses page with query parameters
        window.location.href = url;
    }

    // Prevent clicks inside the sidebar from collapsing it
    if (sidebar) {
        sidebar.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
        });
    }
});

// Function to highlight the current active page in the sidebar
function highlightActivePage() {
    // Get the current path from the URL
    const currentPath = window.location.pathname;
    console.log("Current path:", currentPath); // Debug log
    
    // Get all sidebar menu items
    const menuItems = document.querySelectorAll(".sidebar-menu li");
    
    // First, remove active class from all menu items
    menuItems.forEach(item => {
        item.classList.remove("active");
    });
    
    // Then find and mark the correct active item
    menuItems.forEach(item => {
        const link = item.querySelector("a");
        if (!link) return; // Skip if no link (like for logout)
        
        const linkPath = link.getAttribute("href");
        console.log("Checking link:", linkPath); // Debug log
        
        // Check if the current path matches the link path
        if (currentPath === linkPath || 
            (linkPath !== '/' && currentPath.startsWith(linkPath) && 
             (linkPath.length > 1 || currentPath === '/'))) {
            console.log("Setting active:", linkPath); // Debug log
            item.classList.add("active");
        }
    });
    
    // Special case for root path
    if (currentPath === "/") {
        const dashboardItem = document.querySelector('.sidebar-menu li a[href="/dashboard"]');
        if (dashboardItem) {
            dashboardItem.parentElement.classList.add("active");
        }
    }
    
    // Special case for hexahive path
    if (currentPath.includes("/hexahive")) {
        const gameItem = document.querySelector('.sidebar-menu li a[href="/hexahive"]');
        if (gameItem) {
            gameItem.parentElement.classList.add("active");
        }
    }
}
