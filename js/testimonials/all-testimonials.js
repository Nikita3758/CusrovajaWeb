document.addEventListener('DOMContentLoaded', function() {
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortBy = document.getElementById('sortBy');

    const itemsPerPage = 9;
    let currentPage = 1;
    let totalPages = 1;
    let allTestimonials = [];
    let filteredTestimonials = [];

    fetch('http://localhost:3000/testimonials')
        .then(response => response.json())
        .then(data => {
            allTestimonials = data;
            filteredTestimonials = [...allTestimonials];
            updateDisplay();
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            testimonialsGrid.innerHTML = '<p class="error">Failed to load testimonials. Please try again later.</p>';
        });

    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    ratingFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    function applyFilters() {
        currentPage = 1;
        
        const searchTerm = searchInput.value.toLowerCase();
        const rating = parseInt(ratingFilter.value);
        
        filteredTestimonials = allTestimonials.filter(testimonial => {
            const matchesSearch = testimonial.author.toLowerCase().includes(searchTerm) || 
                                 testimonial.position.toLowerCase().includes(searchTerm) ||
                                 testimonial.quote.toLowerCase().includes(searchTerm);
            const matchesRating = rating === 0 || testimonial.rating === rating;
            
            return matchesSearch && matchesRating;
        });
        
        applySorting();
        updateDisplay();
    }

    function applySorting() {
        const sortValue = sortBy.value;
        
        filteredTestimonials.sort((a, b) => {
            switch (sortValue) {
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'rating-asc':
                    return a.rating - b.rating;
                case 'author-asc':
                    return a.author.localeCompare(b.author);
                case 'author-desc':
                    return b.author.localeCompare(a.author);
                default:
                    return 0;
            }
        });
    }

    function updateDisplay() {
        totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredTestimonials.slice(startIndex, endIndex);
        
        testimonialsGrid.innerHTML = '';
        
        if (currentItems.length === 0) {
            testimonialsGrid.innerHTML = '<p class="no-results">No testimonials found matching your criteria.</p>';
            paginationContainer.innerHTML = '';
            return;
        }
        
        currentItems.forEach(testimonial => {
            const testimonialElement = document.createElement('div');
            testimonialElement.className = 'testimonial-item';
            testimonialElement.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-photo">
                        <img src="${testimonial.photo}" alt="${testimonial.author}" 
                             onerror="this.src='../img/default-avatar.svg'">
                    </div>
                    <div>
                        <div class="testimonial-author">${testimonial.author}</div>
                        <div class="testimonial-position">${testimonial.position}</div>
                    </div>
                </div>
                <div class="testimonial-rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
                <div class="testimonial-text">"${testimonial.quote}"</div>
            `;
            testimonialsGrid.appendChild(testimonialElement);
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