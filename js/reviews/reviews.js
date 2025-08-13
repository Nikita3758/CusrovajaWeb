document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userMenu = document.getElementById('user-menu');
    const reviewsList = document.getElementById('reviews-list');
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    const addReviewBtn = document.getElementById('add-review-btn');
    const reviewModal = document.getElementById('review-modal');
    
    let currentPage = 1;
    const reviewsPerPage = 10;
    let allReviews = [];

    if (currentUser) {
        userMenu.innerHTML = `
            <span>${currentUser.username}</span>
            <button id="logout-btn">Выйти</button>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    } else {
        userMenu.innerHTML = '<a href="../auth/login.html">Войти</a>';
        addReviewBtn.style.display = 'none';
    }

    async function fetchReviews() {
        try {
            const response = await fetch('http://localhost:3000/testimonials');
            if (!response.ok) throw new Error('Network error');
            allReviews = await response.json();
            renderReviews();
            renderPagination();
        } catch (error) {
            console.error('Error:', error);
            reviewsList.innerHTML = '<p>Ошибка загрузки отзывов. Пожалуйста, попробуйте позже.</p>';
        }
    }

    function renderReviews() {
        const start = (currentPage - 1) * reviewsPerPage;
        const end = start + reviewsPerPage;
        const paginatedReviews = allReviews.slice(start, end);
        
        reviewsList.innerHTML = paginatedReviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">${review.author || 'Аноним'}</div>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                </div>
                <div class="review-content">
                    <p>${review.text}</p>
                </div>
                <div class="review-footer">
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                    ${currentUser && currentUser.id === review.userId ? `
                    <div class="review-actions">
                        <button class="edit-review" data-id="${review.id}">Редактировать</button>
                        <button class="delete-review" data-id="${review.id}">Удалить</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', deleteReview);
        });
        
        document.querySelectorAll('.edit-review').forEach(btn => {
            btn.addEventListener('click', editReview);
        });
    }

    function renderPagination() {
        const pageCount = Math.ceil(allReviews.length / reviewsPerPage);
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= pageCount; i++) {
            const pageBtn = document.createElement('div');
            pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderReviews();
                renderPagination();
            });
            pageNumbers.appendChild(pageBtn);
        }
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === pageCount;
    }

    async function deleteReview(e) {
        const reviewId = e.target.dataset.id;
        if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/testimonials/${reviewId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchReviews(); 
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Ошибка при удалении отзыва');
        }
    }

    function editReview(e) {
        const reviewId = e.target.dataset.id;
        const review = allReviews.find(r => r.id == reviewId);

        document.getElementById('review-rating').value = review.rating;
        document.getElementById('review-text').value = review.text;

        reviewModal.style.display = 'block';

        document.getElementById('review-form').onsubmit = async function(e) {
            e.preventDefault();
            
            const updatedReview = {
                ...review,
                rating: document.getElementById('review-rating').value,
                text: document.getElementById('review-text').value,
                date: new Date().toISOString()
            };
            
            try {
                const response = await fetch(`http://localhost:3000/testimonials/${reviewId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedReview)
                });
                
                if (response.ok) {
                    reviewModal.style.display = 'none';
                    fetchReviews(); 
                }
            } catch (error) {
                console.error('Update error:', error);
                alert('Ошибка при обновлении отзыва');
            }
        };
    }

    addReviewBtn.addEventListener('click', function() {
        if (!currentUser) {
            window.location.href = '../auth/login.html';
            return;
        }

        document.getElementById('review-form').reset();

        reviewModal.style.display = 'block';

        document.getElementById('review-form').onsubmit = async function(e) {
            e.preventDefault();
            
            const newReview = {
                userId: currentUser.id,
                author: currentUser.fullName || currentUser.username,
                rating: document.getElementById('review-rating').value,
                text: document.getElementById('review-text').value,
                date: new Date().toISOString()
            };
            
            try {
                const response = await fetch('http://localhost:3000/testimonials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newReview)
                });
                
                if (response.ok) {
                    reviewModal.style.display = 'none';
                    fetchReviews(); 
                }
            } catch (error) {
                console.error('Create error:', error);
                alert('Ошибка при добавлении отзыва');
            }
        };
    });

    document.querySelector('.close-btn').addEventListener('click', function() {
        reviewModal.style.display = 'none';
    });

    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderReviews();
            renderPagination();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentPage < Math.ceil(allReviews.length / reviewsPerPage)) {
            currentPage++;
            renderReviews();
            renderPagination();
        }
    });

    fetchReviews();
});