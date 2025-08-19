document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('articlesGrid');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');

    const itemsPerPage = 6;
    let currentPage = 1;
    let totalPages = 1;
    let allArticles = [];
    let filteredArticles = [];

    fetch('http://localhost:3000/articles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allArticles = data;
            filteredArticles = [...allArticles];
            applySorting();
            updateDisplay();
        })
        .catch(error => {
            console.error('Error loading articles:', error);
            gridContainer.innerHTML = '<p class="error">Failed to load articles. Please try again later.</p>';
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

        filteredArticles = allArticles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm) || 
                                 article.excerpt.toLowerCase().includes(searchTerm) ||
                                 (article.content && article.content.toLowerCase().includes(searchTerm));
            const matchesCategory = !category || article.category === category;
            
            return matchesSearch && matchesCategory;
        });

        applySorting();
        updateDisplay();
    }

    function applySorting() {
        const sortValue = sortBy.value;
        
        filteredArticles.sort((a, b) => {
            switch (sortValue) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'popular':
                    return new Date(b.date) - new Date(a.date);
                default:
                    return 0;
            }
        });
    }

    function updateDisplay() {
        totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredArticles.slice(startIndex, endIndex);

        gridContainer.innerHTML = '';
        
        if (currentItems.length === 0) {
            gridContainer.innerHTML = '<p class="no-results">No articles found matching your criteria.</p>';
            paginationContainer.innerHTML = '';
            return;
        }
        
        currentItems.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            const fullContent = article.content || '';
            
            card.innerHTML = `
                <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='../img/default-article.jpg'">
                <div class="article-info">
                    <span class="article-category">${article.category}</span>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-content-full">${fullContent}</div>
                    <div class="article-meta">
                        <span class="article-date">${new Date(article.date).toLocaleDateString()}</span>
                        <span class="read-more">Hover to read more ↑</span>
                    </div>
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
                ellipsis.style.padding = '8px 12px';
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
                ellipsis.style.padding = '8px 12px';
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