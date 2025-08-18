document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('destinationsGrid');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');

    const itemsPerPage = 10;
    let currentPage = 1;
    let totalPages = 1;
    let allDestinations = [];
    let filteredDestinations = [];

    fetch('http://localhost:3000/destinations')
        .then(response => response.json())
        .then(data => {
            allDestinations = data;
            filteredDestinations = [...allDestinations];
            updateDisplay();
        })
        .catch(error => {
            console.error('Error loading destinations:', error);
            gridContainer.innerHTML = '<p class="error">Failed to load destinations. Please try again later.</p>';
        });

    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    categoryFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    function applyFilters() {
        currentPage = 1; 
        
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        filteredDestinations = allDestinations.filter(destination => {
            const matchesSearch = destination.name.toLowerCase().includes(searchTerm) || 
                                 destination.location.toLowerCase().includes(searchTerm) ||
                                 (destination.description && destination.description.toLowerCase().includes(searchTerm));
            const matchesCategory = !category || destination.category === category;
            
            return matchesSearch && matchesCategory;
        });

        applySorting();

        updateDisplay();
    }

    function applySorting() {
        const sortValue = sortBy.value;
        
        filteredDestinations.sort((a, b) => {
            switch (sortValue) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'location-asc':
                    return a.location.localeCompare(b.location);
                case 'location-desc':
                    return b.location.localeCompare(a.location);
                default:
                    return 0;
            }
        });
    }

    function updateDisplay() {
        totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredDestinations.slice(startIndex, endIndex);

        gridContainer.innerHTML = '';
        
        if (currentItems.length === 0) {
            gridContainer.innerHTML = '<p class="no-results">No destinations found matching your criteria.</p>';
            paginationContainer.innerHTML = '';
            return;
        }
        
        currentItems.forEach(destination => {
            const card = document.createElement('div');
            card.className = 'destination-card';
            card.innerHTML = `
                <img src="${destination.image}" alt="${destination.name}" class="destination-image">
                <div class="destination-info">
                    <h3 class="destination-name">${destination.name}</h3>
                    <div class="destination-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${destination.location}
                    </div>
                    ${destination.category ? `<span class="destination-category">${destination.category}</span>` : ''}
                    ${destination.description ? `<p class="destination-description">${destination.description}</p>` : ''}
                </div>
            `;
            gridContainer.appendChild(card);
        });

        updatePagination();
    }
    function updatePagination() {
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateDisplay();
            }
        });
        paginationContainer.appendChild(prevButton);

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                currentPage = 1;
                updateDisplay();
            });
            paginationContainer.appendChild(firstPageButton);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updateDisplay();
            });
            paginationContainer.appendChild(pageButton);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                updateDisplay();
            });
            paginationContainer.appendChild(lastPageButton);
        }
        
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateDisplay();
            }
        });
        paginationContainer.appendChild(nextButton);
    }
});