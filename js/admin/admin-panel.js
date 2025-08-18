document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') {
        localStorage.setItem('adminRedirectMessage', 'У вас нет прав доступа к этой странице');
        window.location.href = 'index.html';
        return;
    }

    const destinationsTable = document.getElementById('destinationsTable');
    const testimonialsTable = document.getElementById('testimonialsTable');
    const usersTable = document.getElementById('usersTable');
    const adminModal = document.getElementById('adminModal');
    const adminForm = document.getElementById('adminForm');
    const modalTitle = document.getElementById('modalTitle');
    const addDestinationBtn = document.getElementById('addDestinationBtn');
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    const closeModal = document.querySelector('.close-modal');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');

    const destinationFields = document.querySelector('.destination-fields');
    const testimonialFields = document.querySelector('.testimonial-fields');

    let currentTab = 'destinations';
    let destinations = [];
    let testimonials = [];
    let users = [];
    let isEditing = false;

    loadData();
    setupEventListeners();

    function loadData() {
        Promise.all([
            fetch('http://localhost:3000/destinations').then(res => res.json()),
            fetch('http://localhost:3000/testimonials').then(res => res.json()),
            fetch('http://localhost:3000/users').then(res => res.json())
        ])
        .then(([destData, testData, userData]) => {
            destinations = destData;
            testimonials = testData;
            users = userData;
            renderAllTables();
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            alert('Ошибка загрузки данных. Подробности в консоли.');
        });
    }

    function renderAllTables() {
        renderDestinationsTable();
        renderTestimonialsTable();
        renderUsersTable();
    }

    function renderDestinationsTable() {
        destinationsTable.innerHTML = '';
        
        if (destinations.length === 0) {
            destinationsTable.innerHTML = '<tr><td colspan="6">Направления не найдены</td></tr>';
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
                    <button class="action-btn edit-btn" data-id="${destination.id}">Редактировать</button>
                    <button class="action-btn delete-btn" data-id="${destination.id}">Удалить</button>
                </td>
            `;
            destinationsTable.appendChild(row);
        });

        addTableEventListeners('#destinationsTable');
    }

    function renderTestimonialsTable() {
        testimonialsTable.innerHTML = '';
        
        if (testimonials.length === 0) {
            testimonialsTable.innerHTML = '<tr><td colspan="6">Отзывы не найдены</td></tr>';
            return;
        }
        
        testimonials.forEach(testimonial => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${testimonial.id}</td>
                <td><img src="${testimonial.photo}" alt="${testimonial.author}" class="admin-thumbnail" onerror="this.src='../img/default-avatar.svg'"></td>
                <td>${testimonial.author}</td>
                <td>${testimonial.position}</td>
                <td>${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${testimonial.id}">Редактировать</button>
                    <button class="action-btn delete-btn" data-id="${testimonial.id}">Удалить</button>
                </td>
            `;
            testimonialsTable.appendChild(row);
        });

        addTableEventListeners('#testimonialsTable');
    }

    function renderUsersTable() {
        usersTable.innerHTML = '';
        
        if (users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="5">Пользователи не найдены</td></tr>';
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
                        <button class="action-btn edit-btn" data-id="${user.id}">Изменить роль</button>
                        <button class="action-btn delete-btn" data-id="${user.id}">Удалить</button>
                    ` : 'Админ'}
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
                else if (tableSelector === '#usersTable') handleEditUser(id);
            });
        });
        
        document.querySelectorAll(`${tableSelector} .delete-btn`).forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.dataset.id;
                if (tableSelector === '#destinationsTable') handleDeleteDestination(id);
                else if (tableSelector === '#testimonialsTable') handleDeleteTestimonial(id);
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
            modalTitle.textContent = 'Добавить новое направление';
            document.getElementById('currentTab').value = 'destinations';
            updateFormFieldsVisibility();
            adminModal.style.display = 'block';
        });

        addTestimonialBtn.addEventListener('click', () => {
            isEditing = false;
            adminForm.reset();
            modalTitle.textContent = 'Добавить новый отзыв';
            document.getElementById('currentTab').value = 'testimonials';
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
        }
    }

    function handleEditDestination(id) {
        const destination = destinations.find(d => d.id == id);
        
        if (destination) {
            isEditing = true;
            modalTitle.textContent = 'Редактировать направление';
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
            alert('Направление не найдено!');
        }
    }

    function handleDeleteDestination(id) {
        if (confirm('Вы уверены, что хотите удалить это направление?')) {
            fetch(`http://localhost:3000/destinations/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    destinations = destinations.filter(d => d.id != id);
                    renderDestinationsTable();
                    alert('Направление успешно удалено!');
                } else {
                    throw new Error('Не удалось удалить направление');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка удаления направления: ' + error.message);
            });
        }
    }

    function handleEditTestimonial(id) {
        const testimonial = testimonials.find(t => t.id == id);
        
        if (testimonial) {
            isEditing = true;
            modalTitle.textContent = 'Редактировать отзыв';
            document.getElementById('currentTab').value = 'testimonials';

            document.getElementById('editId').value = testimonial.id;
            document.getElementById('author').value = testimonial.author;
            document.getElementById('position').value = testimonial.position;
            document.getElementById('quote').value = testimonial.quote;
            document.getElementById('rating').value = testimonial.rating;
            document.getElementById('photo').value = testimonial.photo;
            
            adminModal.style.display = 'block';
        } else {
            alert('Отзыв не найден!');
        }
    }

    function handleDeleteTestimonial(id) {
        if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            fetch(`http://localhost:3000/testimonials/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    testimonials = testimonials.filter(t => t.id != id);
                    renderTestimonialsTable();
                    alert('Отзыв успешно удален!');
                } else {
                    throw new Error('Не удалось удалить отзыв');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка удаления отзыва: ' + error.message);
            });
        }
    }

    function handleEditUser(id) {
        const user = users.find(u => u.id == id);
        
        if (user) {
            const newRole = prompt('Введите новую роль (admin/user):', user.role || 'user');
            
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
                        alert('Роль пользователя успешно обновлена!');
                    } else {
                        throw new Error('Не удалось обновить роль пользователя');
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Ошибка обновления роли пользователя: ' + error.message);
                });
            }
        }
    }

    function handleDeleteUser(id) {
        const user = users.find(u => u.id == id);
        
        if (!user) {
            alert('Пользователь не найден!');
            return;
        }
        
        if (user.role === 'admin') {
            alert('Нельзя удалить администратора!');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            fetch(`http://localhost:3000/users/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    users = users.filter(u => u.id != id);
                    renderUsersTable();
                    alert('Пользователь успешно удален!');
                } else {
                    throw new Error('Не удалось удалить пользователя');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Ошибка удаления пользователя: ' + error.message);
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
                name.setCustomValidity('Название обязательно');
                isValid = false;
            }
            if (!location.value.trim()) {
                location.setCustomValidity('Местоположение обязательно');
                isValid = false;
            }
            if (!image.value.trim()) {
                image.setCustomValidity('URL изображения обязателен');
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
                author.setCustomValidity('Автор обязателен');
                isValid = false;
            }
            if (!position.value.trim()) {
                position.setCustomValidity('Должность обязательна');
                isValid = false;
            }
            if (!quote.value.trim()) {
                quote.setCustomValidity('Текст отзыва обязателен');
                isValid = false;
            }
            if (!rating.value || rating.value < 1 || rating.value > 5) {
                rating.setCustomValidity('Рейтинг должен быть от 1 до 5');
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
            if (!response.ok) throw new Error(`Ошибка HTTP! статус: ${response.status}`);
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
            }
            
            adminModal.style.display = 'none';
            alert(`Успешно ${isEditing ? 'обновлено' : 'добавлено'}!`);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert(`Ошибка ${isEditing ? 'обновления' : 'добавления'}: ${error.message}`);
        });
    }
});