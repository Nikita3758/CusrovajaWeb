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

    const translations = {
        en: {
            name: "Name",
            phone: "Phone",
            email: "Email",
            travelDate: "Travel Date",
            travelersCount: "Travelers Count",
            message: "Message",
            messagePlaceholder: "Your wishes...",
            sendRequest: "Send Request",
            bookingSuccess: "Thank you for your request! We will contact you shortly.",
            noDestinationsFound: "No destinations found",
            loginRequired: "Please log in to book a destination",
            validation: {
                requiredField: "This field is required",
                nameMinLength: "Name must be at least 2 characters",
                nameInvalid: "Name can only contain letters, spaces and hyphens",
                phoneInvalid: "Please enter a valid phone number",
                emailInvalid: "Please enter a valid email address",
                dateFuture: "Please select a future date",
                travelersCount: "Number of travelers must be between 1 and 50",
                messageTooLong: "Message must not exceed 500 characters"
            }
        },
        ru: {
            name: "Имя",
            phone: "Телефон",
            email: "Email",
            travelDate: "Дата поездки",
            travelersCount: "Количество путешественников",
            message: "Сообщение",
            messagePlaceholder: "Ваши пожелания...",
            sendRequest: "Отправить заявку",
            bookingSuccess: "Спасибо за заявку! Мы свяжемся с вами в ближайшее время.",
            noDestinationsFound: "Направления не найдены",
            loginRequired: "Пожалуйста, войдите в систему, чтобы забронировать направление",
            validation: {
                requiredField: "Это поле обязательно для заполнения",
                nameMinLength: "Имя должно содержать минимум 2 символа",
                nameInvalid: "Имя может содержать только буквы, пробелы и дефисы",
                phoneInvalid: "Пожалуйста, введите корректный номер телефона",
                emailInvalid: "Пожалуйста, введите корректный email адрес",
                dateFuture: "Пожалуйста, выберите дату в будущем",
                travelersCount: "Количество путешественников должно быть от 1 до 50",
                messageTooLong: "Сообщение не должно превышать 500 символов"
            }
        }
    };

    function t(key) {
        const currentLang = localStorage.getItem('language') || 'en';
        const keys = key.split('.');
        let value = translations[currentLang];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || translations.en[key] || key;
    }

    function isUserLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    let bookingModalCreated = false;

    fetch('http://localhost:3000/destinations')
        .then(response => response.json())
        .then(data => {
            allDestinations = data;
            filteredDestinations = [...allDestinations];
            updateDisplay();
            
            if (!bookingModalCreated) {
                createBookingModal();
                bookingModalCreated = true;
            }
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
            gridContainer.innerHTML = '<p class="no-results">' + t('noDestinationsFound') + '</p>';
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

            card.addEventListener('click', () => {
                if (isUserLoggedIn()) {
                    openBookingModal(destination);
                } else {
                    showNotification(t('loginRequired'), 'error');
                }
            });
            
            gridContainer.appendChild(card);
        });

        updatePagination();
    }

    function createBookingModal() {
        const modalHTML = `
            <div class="booking-modal">
                <div class="booking-modal-content">
                    <span class="booking-close">&times;</span>
                    <div class="booking-destination-header">
                        <img class="booking-destination-image" src="" alt="">
                        <div class="booking-header-info">
                            <h2 class="booking-destination-name"></h2>
                            <div class="booking-destination-location"></div>
                            <div class="booking-destination-category"></div>
                        </div>
                    </div>
                    <form class="booking-form">
                        <input type="hidden" class="booking-selected-destination">
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('name')} *</label>
                            <input type="text" class="booking-form-input" name="name" required>
                            <div class="booking-error-message" data-field="name"></div>
                        </div>
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('phone')} *</label>
                            <input type="tel" class="booking-form-input" name="phone" required>
                            <div class="booking-error-message" data-field="phone"></div>
                        </div>
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('email')} *</label>
                            <input type="email" class="booking-form-input" name="email" required>
                            <div class="booking-error-message" data-field="email"></div>
                        </div>
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('travelDate')}</label>
                            <input type="date" class="booking-form-input" name="travelDate">
                            <div class="booking-error-message" data-field="travelDate"></div>
                        </div>
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('travelersCount')}</label>
                            <input type="number" class="booking-form-input" name="travelersCount" min="1" value="1">
                            <div class="booking-error-message" data-field="travelersCount"></div>
                        </div>
                        <div class="booking-form-group">
                            <label class="booking-form-label">${t('message')}</label>
                            <textarea class="booking-form-textarea" name="message" placeholder="${t('messagePlaceholder')}"></textarea>
                            <div class="booking-error-message" data-field="message"></div>
                        </div>
                        <button type="submit" class="booking-submit-btn">${t('sendRequest')}</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.querySelector('.booking-modal');
        const closeBtn = modal.querySelector('.booking-close');
        const form = modal.querySelector('.booking-form');

        closeBtn.addEventListener('click', closeBookingModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBookingModal();
            }
        });

        form.addEventListener('submit', handleBookingSubmit);
        
        const inputs = form.querySelectorAll('.booking-form-input, .booking-form-textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const errorElement = document.querySelector(`.booking-error-message[data-field="${fieldName}"]`);
        
        clearFieldError(field);

        switch(fieldName) {
            case 'name':
                if (!value) {
                    showFieldError(field, t('validation.requiredField'));
                } else if (value.length < 2) {
                    showFieldError(field, t('validation.nameMinLength'));
                } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value)) {
                    showFieldError(field, t('validation.nameInvalid'));
                }
                break;
                
            case 'phone':
                if (!value) {
                    showFieldError(field, t('validation.requiredField'));
                } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
                    showFieldError(field, t('validation.phoneInvalid'));
                }
                break;
                
            case 'email':
                if (!value) {
                    showFieldError(field, t('validation.requiredField'));
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    showFieldError(field, t('validation.emailInvalid'));
                }
                break;
                
            case 'travelDate':
                if (value) {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        showFieldError(field, t('validation.dateFuture'));
                    }
                }
                break;
                
            case 'travelersCount':
                if (value && (value < 1 || value > 50)) {
                    showFieldError(field, t('validation.travelersCount'));
                }
                break;
                
            case 'message':
                if (value && value.length > 500) {
                    showFieldError(field, t('validation.messageTooLong'));
                }
                break;
        }
    }

    function showFieldError(field, message) {
        field.classList.add('booking-input-error');
        const errorElement = document.querySelector(`.booking-error-message[data-field="${field.name}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearFieldError(field) {
        field.classList.remove('booking-input-error');
        const errorElement = document.querySelector(`.booking-error-message[data-field="${field.name}"]`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    function validateForm(formData) {
        let isValid = true;
        const errors = {};

        const name = formData.get('name').trim();
        if (!name) {
            errors.name = t('validation.requiredField');
            isValid = false;
        } else if (name.length < 2) {
            errors.name = t('validation.nameMinLength');
            isValid = false;
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(name)) {
            errors.name = t('validation.nameInvalid');
            isValid = false;
        }

        const phone = formData.get('phone').trim();
        if (!phone) {
            errors.phone = t('validation.requiredField');
            isValid = false;
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone)) {
            errors.phone = t('validation.phoneInvalid');
            isValid = false;
        }

        const email = formData.get('email').trim();
        if (!email) {
            errors.email = t('validation.requiredField');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = t('validation.emailInvalid');
            isValid = false;
        }

        const travelDate = formData.get('travelDate');
        if (travelDate) {
            const selectedDate = new Date(travelDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.travelDate = t('validation.dateFuture');
                isValid = false;
            }
        }

        const travelersCount = formData.get('travelersCount');
        if (travelersCount && (travelersCount < 1 || travelersCount > 50)) {
            errors.travelersCount = t('validation.travelersCount');
            isValid = false;
        }

        const message = formData.get('message').trim();
        if (message && message.length > 500) {
            errors.message = t('validation.messageTooLong');
            isValid = false;
        }

        return { isValid, errors };
    }

    function openBookingModal(destination) {
        if (!isUserLoggedIn()) {
            showNotification(t('loginRequired'), 'error');
            return;
        }

        const modal = document.querySelector('.booking-modal');
        if (!modal) {
            createBookingModal();
        }
        
        const destinationImage = modal.querySelector('.booking-destination-image');
        const destinationName = modal.querySelector('.booking-destination-name');
        const destinationLocation = modal.querySelector('.booking-destination-location');
        const destinationCategory = modal.querySelector('.booking-destination-category');
        const destinationInput = modal.querySelector('.booking-selected-destination');
        
        destinationInput.value = destination.name;
        destinationImage.src = destination.image;
        destinationImage.alt = destination.name;
        destinationName.textContent = destination.name;
        destinationLocation.textContent = destination.location;
        
        if (destination.category) {
            destinationCategory.textContent = destination.category;
            destinationCategory.style.display = 'inline-block';
        } else {
            destinationCategory.style.display = 'none';
        }

        const currentUser = getCurrentUser();
        if (currentUser) {
            const nameInput = modal.querySelector('input[name="name"]');
            const emailInput = modal.querySelector('input[name="email"]');
            const phoneInput = modal.querySelector('input[name="phone"]');
            
            if (nameInput && currentUser.name) nameInput.value = currentUser.name;
            if (emailInput && currentUser.email) emailInput.value = currentUser.email;
            if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
        }
        
        modal.style.display = 'block';
    }

    function closeBookingModal() {
        const modal = document.querySelector('.booking-modal');
        if (modal) {
            modal.style.display = 'none';
            
            const errorMessages = modal.querySelectorAll('.booking-error-message');
            errorMessages.forEach(error => {
                error.textContent = '';
                error.style.display = 'none';
            });
            
            const inputs = modal.querySelectorAll('.booking-form-input, .booking-form-textarea');
            inputs.forEach(input => {
                input.classList.remove('booking-input-error');
            });
            
            document.querySelector('.booking-form').reset();
        }
    }

    function handleBookingSubmit(e) {
        e.preventDefault();

        if (!isUserLoggedIn()) {
            showNotification(t('loginRequired'), 'error');
            closeBookingModal();
            return;
        }
        
        const formData = new FormData(e.target);
        const validation = validateForm(formData);
        
        if (!validation.isValid) {
            Object.keys(validation.errors).forEach(fieldName => {
                const field = e.target.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    showFieldError(field, validation.errors[fieldName]);
                }
            });
            return;
        }

        const bookingData = {
            destination: formData.get('destination'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            travelDate: formData.get('travelDate'),
            travelersCount: formData.get('travelersCount'),
            message: formData.get('message'),
            userId: getCurrentUser()?.id,
            submittedAt: new Date().toISOString()
        };

        console.log('Booking data:', bookingData);

        showNotification(t('bookingSuccess'), 'success');

        closeBookingModal();

        e.target.reset();
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
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