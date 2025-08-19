document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        localStorage.setItem('adminRedirectMessage', 'You do not have permission to access this page');
        window.location.href = 'index.html';
        return;
    }

    const destinationsTable = document.getElementById('destinationsTable');
    const testimonialsTable = document.getElementById('testimonialsTable');
    const articlesTable = document.getElementById('articlesTable');
    const usersTable = document.getElementById('usersTable');
    const adminModal = document.getElementById('adminModal');
    const adminForm = document.getElementById('adminForm');
    const modalTitle = document.getElementById('modalTitle');
    const addDestinationBtn = document.getElementById('addDestinationBtn');
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    const addArticleBtn = document.getElementById('addArticleBtn');
    const closeModal = document.querySelector('.close-modal');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');

    const destinationFields = document.querySelector('.destination-fields');
    const testimonialFields = document.querySelector('.testimonial-fields');
    const articleFields = document.querySelector('.article-fields');

    let currentTab = 'destinations';
    let destinations = [];
    let testimonials = [];
    let articles = [];
    let users = [];
    let isEditing = false;

    loadData();
    setupEventListeners();

    function loadData() {
        Promise.all([
            fetch('http://localhost:3000/destinations').then(res => res.json()),
            fetch('http://localhost:3000/testimonials').then(res => res.json()),
            fetch('http://localhost:3000/articles').then(res => res.json()),
            fetch('http://localhost:3000/users').then(res => res.json())
        ])
        .then(([destData, testData, articleData, userData]) => {
            destinations = destData;
            testimonials = testData;
            articles = articleData;
            users = userData;
            renderAllTables();
        })
        .catch(error => {
            console.error('Error loading data:', error);
            alert('Error loading data. Please check console for details.');
        });
    }

    function renderAllTables() {
        renderDestinationsTable();
        renderTestimonialsTable();
        renderArticlesTable();
        renderUsersTable();
    }

    function renderDestinationsTable() {
        destinationsTable.innerHTML = '';
        
        if (destinations.length === 0) {
            destinationsTable.innerHTML = '<tr><td colspan="6">No destinations found</td></tr>';
            return;
        }
        
        destinations.forEach(destination => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${destination.id}</td>
                <td><img src="${destination.image}" alt="${destination.name}" class="admin-thumbnail" onerror="this.src='../img/default-image.svg'"></td>
                <td>${destination.name}</td>
                <td>${destination.location}</td>
                <td>${destination.category}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${destination.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${destination.id}">Delete</button>
                </td>
            `;
            destinationsTable.appendChild(row);
        });

        addTableEventListeners('#destinationsTable');
    }

    function renderTestimonialsTable() {
        testimonialsTable.innerHTML = '';
        
        if (testimonials.length === 0) {
            testimonialsTable.innerHTML = '<tr><td colspan="6">No testimonials found</td></tr>';
            return;
        }
        
        testimonials.forEach(testimonial => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${testimonial.id}</td>
                <td><img src="${testimonial.photo}" alt="${testimonial.author}" class="admin-thumbnail" onerror="this.src='../img/default-avatar.svg'"></td>
                <td>${testimonial.author}</td>
                <td>${testimonial.position}</td>
                <td class="rating-stars">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${testimonial.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${testimonial.id}">Delete</button>
                </td>
            `;
            testimonialsTable.appendChild(row);
        });

        addTableEventListeners('#testimonialsTable');
    }

    function renderArticlesTable() {
        articlesTable.innerHTML = '';
        
        if (articles.length === 0) {
            articlesTable.innerHTML = '<tr><td colspan="6">No articles found</td></tr>';
            return;
        }
        
        articles.forEach(article => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${article.id}</td>
                <td><img src="${article.image}" alt="${article.title}" class="admin-thumbnail" onerror="this.src='../img/default-image.svg'"></td>
                <td>${article.title}</td>
                <td>${article.category}</td>
                <td>${new Date(article.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${article.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${article.id}">Delete</button>
                </td>
            `;
            articlesTable.appendChild(row);
        });

        addTableEventListeners('#articlesTable');
    }

    function renderUsersTable() {
        usersTable.innerHTML = '';
        
        if (users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role || 'user'}</td>
                <td>
                    ${user.role !== 'admin' ? `
                        <button class="action-btn edit-btn" data-id="${user.id}">Edit Role</button>
                        <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
                    ` : 'Admin'}
                </td>
            `;
            usersTable.appendChild(row);
        });

        addTableEventListeners('#usersTable');
    }

    function addTableEventListeners(tableSelector) {
        document.querySelectorAll(`${tableSelector} .edit-btn`).forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.dataset.id;
                if (tableSelector === '#destinationsTable') handleEditDestination(id);
                else if (tableSelector === '#testimonialsTable') handleEditTestimonial(id);
                else if (tableSelector === '#articlesTable') handleEditArticle(id);
                else if (tableSelector === '#usersTable') handleEditUser(id);
            });
        });
        
        document.querySelectorAll(`${tableSelector} .delete-btn`).forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.dataset.id;
                if (tableSelector === '#destinationsTable') handleDeleteDestination(id);
                else if (tableSelector === '#testimonialsTable') handleDeleteTestimonial(id);
                else if (tableSelector === '#articlesTable') handleDeleteArticle(id);
                else if (tableSelector === '#usersTable') handleDeleteUser(id);
            });
        });
    }

    function setupEventListeners() {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentTab = btn.dataset.tab;
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${currentTab}-tab`).classList.add('active');
                
                updateFormFieldsVisibility();
                document.getElementById('currentTab').value = currentTab;
            });
        });

        addDestinationBtn.addEventListener('click', () => {
            isEditing = false;
            adminForm.reset();
            modalTitle.textContent = 'Add New Destination';
            document.getElementById('currentTab').value = 'destinations';
            updateFormFieldsVisibility();
            adminModal.style.display = 'block';
        });

        addTestimonialBtn.addEventListener('click', () => {
            isEditing = false;
            adminForm.reset();
            modalTitle.textContent = 'Add New Testimonial';
            document.getElementById('currentTab').value = 'testimonials';
            updateFormFieldsVisibility();
            adminModal.style.display = 'block';
        });

        addArticleBtn.addEventListener('click', () => {
            isEditing = false;
            adminForm.reset();
            modalTitle.textContent = 'Add New Article';
            document.getElementById('currentTab').value = 'articles';
            document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
            updateFormFieldsVisibility();
            adminModal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });

        adminForm.addEventListener('submit', handleFormSubmit);
    }

    function updateFormFieldsVisibility() {
        destinationFields.style.display = 'none';
        testimonialFields.style.display = 'none';
        articleFields.style.display = 'none';

        document.querySelectorAll('#adminForm [required]').forEach(field => {
            field.required = false;
        });

        if (currentTab === 'destinations') {
            destinationFields.style.display = 'block';
            document.querySelectorAll('.destination-fields [required]').forEach(field => {
                field.required = true;
            });
        } else if (currentTab === 'testimonials') {
            testimonialFields.style.display = 'block';
            document.querySelectorAll('.testimonial-fields [required]').forEach(field => {
                field.required = true;
            });
        } else if (currentTab === 'articles') {
            articleFields.style.display = 'block';
            document.querySelectorAll('.article-fields [required]').forEach(field => {
                field.required = true;
            });
        }
    }

    function handleEditDestination(id) {
        const destination = destinations.find(d => d.id == id);
        
        if (destination) {
            isEditing = true;
            modalTitle.textContent = 'Edit Destination';
            document.getElementById('currentTab').value = 'destinations';
            updateFormFieldsVisibility();
            
            document.getElementById('editId').value = destination.id;
            document.getElementById('name').value = destination.name;
            document.getElementById('location').value = destination.location;
            document.getElementById('category').value = destination.category;
            document.getElementById('image').value = destination.image;
            document.getElementById('description').value = destination.description || '';
            
            adminModal.style.display = 'block';
        } else {
            alert('Destination not found!');
        }
    }

    function handleDeleteDestination(id) {
        if (confirm('Are you sure you want to delete this destination?')) {
            fetch(`http://localhost:3000/destinations/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    destinations = destinations.filter(d => d.id != id);
                    renderDestinationsTable();
                    alert('Destination deleted successfully!');
                } else {
                    throw new Error('Failed to delete destination');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting destination: ' + error.message);
            });
        }
    }

    function handleEditTestimonial(id) {
        const testimonial = testimonials.find(t => t.id == id);
        
        if (testimonial) {
            isEditing = true;
            modalTitle.textContent = 'Edit Testimonial';
            document.getElementById('currentTab').value = 'testimonials';
            updateFormFieldsVisibility();
            
            document.getElementById('editId').value = testimonial.id;
            document.getElementById('author').value = testimonial.author;
            document.getElementById('position').value = testimonial.position;
            document.getElementById('quote').value = testimonial.quote;
            document.getElementById('rating').value = testimonial.rating;
            document.getElementById('photo').value = testimonial.photo;
            
            adminModal.style.display = 'block';
        } else {
            alert('Testimonial not found!');
        }
    }

    function handleDeleteTestimonial(id) {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            fetch(`http://localhost:3000/testimonials/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    testimonials = testimonials.filter(t => t.id != id);
                    renderTestimonialsTable();
                    alert('Testimonial deleted successfully!');
                } else {
                    throw new Error('Failed to delete testimonial');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting testimonial: ' + error.message);
            });
        }
    }

    function handleEditArticle(id) {
        const article = articles.find(a => a.id == id);
        
        if (article) {
            isEditing = true;
            modalTitle.textContent = 'Edit Article';
            document.getElementById('currentTab').value = 'articles';
            updateFormFieldsVisibility();
            
            document.getElementById('editId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleExcerpt').value = article.excerpt;
            document.getElementById('articleContent').value = article.content;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleImage').value = article.image;
            document.getElementById('articleDate').value = article.date;
            
            adminModal.style.display = 'block';
        } else {
            alert('Article not found!');
        }
    }

    function handleDeleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            fetch(`http://localhost:3000/articles/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    articles = articles.filter(a => a.id != id);
                    renderArticlesTable();
                    alert('Article deleted successfully!');
                } else {
                    throw new Error('Failed to delete article');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting article: ' + error.message);
            });
        }
    }

    function handleEditUser(id) {
        const user = users.find(u => u.id == id);
        
        if (user) {
            const newRole = prompt('Enter new role (admin/user):', user.role || 'user');
            
            if (newRole && (newRole === 'admin' || newRole === 'user')) {
                fetch(`http://localhost:3000/users/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                })
                .then(response => {
                    if (response.ok) {
                        user.role = newRole;
                        renderUsersTable();
                        alert('User role updated successfully!');
                    } else {
                        throw new Error('Failed to update user role');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error updating user role: ' + error.message);
                });
            }
        }
    }

    function handleDeleteUser(id) {
        const user = users.find(u => u.id == id);
        
        if (!user) {
            alert('User not found!');
            return;
        }
        
        if (user.role === 'admin') {
            alert('Cannot delete admin user!');
            return;
        }
        
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`http://localhost:3000/users/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    users = users.filter(u => u.id != id);
                    renderUsersTable();
                    alert('User deleted successfully!');
                } else {
                    throw new Error('Failed to delete user');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting user: ' + error.message);
            });
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        document.querySelectorAll('#adminForm input, #adminForm textarea').forEach(field => {
            field.setCustomValidity('');
        });
        
        const currentTab = document.getElementById('currentTab').value;
        const id = document.getElementById('editId').value;
        let formData, url, method;
        let isValid = true;
        
        if (currentTab === 'destinations') {
            const name = document.getElementById('name');
            const location = document.getElementById('location');
            const image = document.getElementById('image');
            
            if (!name.value.trim()) {
                name.setCustomValidity('Name is required');
                isValid = false;
            }
            if (!location.value.trim()) {
                location.setCustomValidity('Location is required');
                isValid = false;
            }
            if (!image.value.trim()) {
                image.setCustomValidity('Image URL is required');
                isValid = false;
            }
            
            if (!isValid) {
                name.reportValidity();
                return;
            }
            
            formData = {
                name: name.value.trim(),
                location: location.value.trim(),
                category: document.getElementById('category').value,
                image: image.value.trim(),
                description: document.getElementById('description').value.trim()
            };
        } else if (currentTab === 'testimonials') {
            const author = document.getElementById('author');
            const position = document.getElementById('position');
            const quote = document.getElementById('quote');
            const rating = document.getElementById('rating');
            
            if (!author.value.trim()) {
                author.setCustomValidity('Author is required');
                isValid = false;
            }
            if (!position.value.trim()) {
                position.setCustomValidity('Position is required');
                isValid = false;
            }
            if (!quote.value.trim()) {
                quote.setCustomValidity('Quote is required');
                isValid = false;
            }
            if (!rating.value || rating.value < 1 || rating.value > 5) {
                rating.setCustomValidity('Rating must be between 1 and 5');
                isValid = false;
            }
            
            if (!isValid) {
                author.reportValidity();
                return;
            }
            
            formData = {
                author: author.value.trim(),
                position: position.value.trim(),
                quote: quote.value.trim(),
                rating: parseInt(rating.value),
                photo: document.getElementById('photo').value.trim() || '../img/default-avatar.svg'
            };
        } else if (currentTab === 'articles') {
            const title = document.getElementById('articleTitle');
            const excerpt = document.getElementById('articleExcerpt');
            const content = document.getElementById('articleContent');
            const image = document.getElementById('articleImage');
            const date = document.getElementById('articleDate');
            
            if (!title.value.trim()) {
                title.setCustomValidity('Title is required');
                isValid = false;
            }
            if (!excerpt.value.trim()) {
                excerpt.setCustomValidity('Excerpt is required');
                isValid = false;
            }
            if (!content.value.trim()) {
                content.setCustomValidity('Content is required');
                isValid = false;
            }
            if (!image.value.trim()) {
                image.setCustomValidity('Image URL is required');
                isValid = false;
            }
            if (!date.value) {
                date.setCustomValidity('Date is required');
                isValid = false;
            }
            
            if (!isValid) {
                title.reportValidity();
                return;
            }
            
            formData = {
                title: title.value.trim(),
                excerpt: excerpt.value.trim(),
                content: content.value.trim(),
                category: document.getElementById('articleCategory').value,
                image: image.value.trim(),
                date: date.value
            };
        }
        
        url = isEditing ? `http://localhost:3000/${currentTab}/${id}` : `http://localhost:3000/${currentTab}`;
        method = isEditing ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (currentTab === 'destinations') {
                if (isEditing) {
                    const index = destinations.findIndex(d => d.id == id);
                    if (index !== -1) destinations[index] = data;
                } else {
                    destinations.push(data);
                }
                renderDestinationsTable();
            } else if (currentTab === 'testimonials') {
                if (isEditing) {
                    const index = testimonials.findIndex(t => t.id == id);
                    if (index !== -1) testimonials[index] = data;
                } else {
                    testimonials.push(data);
                }
                renderTestimonialsTable();
            } else if (currentTab === 'articles') {
                if (isEditing) {
                    const index = articles.findIndex(a => a.id == id);
                    if (index !== -1) articles[index] = data;
                } else {
                    articles.push(data);
                }
                renderArticlesTable();
            }
            
            adminModal.style.display = 'none';
            alert(`Successfully ${isEditing ? 'updated' : 'added'}!`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error ${isEditing ? 'updating' : 'adding'} item: ${error.message}`);
        });
    }
});