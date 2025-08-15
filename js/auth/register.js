document.addEventListener('DOMContentLoaded', function() {

    const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123'];
    const form = document.getElementById('register-form');
    const passwordOptions = document.querySelectorAll('input[name="password-option"]');
    const manualPasswordFields = document.getElementById('manual-password-fields');
    const generateBtn = document.getElementById('generate-username');
    const usernameInput = document.getElementById('username');
    const registerBtn = document.getElementById('register-btn');
    const phoneInput = document.getElementById('phone');
    
    let usernameAttempts = 5;
    let isManualUsername = false;

    phoneInput.addEventListener('input', function(e) {
        const cursorPosition = this.selectionStart;
        let value = this.value.replace(/\D/g, '');
        
        if (!value.startsWith('375') && value.length > 0) {
            value = '375' + value;
        }
        
        if (value.length > 12) value = value.substring(0, 12);
        
        let formattedValue = '';
        if (value.length > 3) {
            formattedValue = '+' + value.substring(0, 3) + ' ' + value.substring(3, 5) + ' ' + 
                            value.substring(5, 8) + ' ' + value.substring(8, 10) + ' ' + value.substring(10);
        }
        
        this.value = formattedValue;
        const addedChars = formattedValue.length - this.value.length;
        this.setSelectionRange(cursorPosition + addedChars, cursorPosition + addedChars);
        
        validateForm();
    });

    function validatePhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.startsWith('375') && 
               cleanPhone.length === 12 && 
               ['25', '29', '33', '44'].includes(cleanPhone.substring(3, 5));
    }

    function checkAge(birthDate) {
        const birthDateObj = new Date(birthDate);
        const ageDiff = Date.now() - birthDateObj.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970) >= 16;
    }

    function validatePassword(password) {
        return {
            length: password.length >= 8 && password.length <= 20,
            upper: /[A-ZА-Я]/.test(password),
            lower: /[a-zа-я]/.test(password),
            digit: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            common: !commonPasswords.includes(password.toLowerCase())
        };
    }

    function updateRequirement(id, isValid) {
        const element = document.getElementById(`req-${id}`);
        if (element) {
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
        }
    }

    function validateForm() {
        let isValid = true;
        const errors = {};

        const phoneValue = phoneInput.value.trim();
        if (!phoneValue) {
            errors.phone = 'Введите номер телефона';
            isValid = false;
        } else if (!validatePhone(phoneValue)) {
            errors.phone = 'Введите корректный номер телефона РБ (+375 29 XXX XX XX)';
            isValid = false;
        }

        const emailValue = document.getElementById('email').value.trim();
        if (!emailValue) {
            errors.email = 'Введите email';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            errors.email = 'Введите корректный email';
            isValid = false;
        }

    const birthDateValue = document.getElementById('birth-date').value;
    if (!birthDateValue) {
        errors['birth-date'] = 'Введите дату рождения';
        isValid = false;
    } else if (!checkAge(birthDateValue)) {
        errors['birth-date'] = 'Регистрация доступна с 16 лет';
        isValid = false;
    }

        const passwordOption = document.querySelector('input[name="password-option"]:checked').value;
        if (passwordOption === 'manual') {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!password) {
                errors.password = 'Введите пароль';
                isValid = false;
            } else {
                const passwordValid = validatePassword(password);
                updateRequirement('length', passwordValid.length);
                updateRequirement('upper', passwordValid.upper);
                updateRequirement('lower', passwordValid.lower);
                updateRequirement('digit', passwordValid.digit);
                updateRequirement('special', passwordValid.special);
                
                if (!Object.values(passwordValid).every(Boolean)) {
                    errors.password = 'Пароль не соответствует требованиям';
                    isValid = false;
                }
                
                if (password !== confirmPassword) {
                    errors.password = 'Пароли не совпадают';
                    isValid = false;
                }
            }
        }

    const fullNameValue = document.getElementById('full-name').value.trim();
    if (!fullNameValue) {
        errors['full-name'] = 'Введите фамилию и имя';
        isValid = false;
    } else {
        const nameParts = fullNameValue.split(/\s+/).filter(p => p.trim() !== '');
        if (nameParts.length < 2) {
            errors['full-name'] = 'Введите фамилию и имя (отчество необязательно)';
            isValid = false;
        }
    }
    Object.keys(errors).forEach(fieldId => {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement && inputElement) {
            errorElement.textContent = errors[fieldId];
            errorElement.style.display = 'block';
            inputElement.classList.add('error');
        }
    });

        const usernameValue = usernameInput.value.trim();
        if (!usernameValue) {
            errors.username = 'Введите никнейм';
            isValid = false;
        }

        if (!document.getElementById('agreement').checked) {
            errors.agreement = 'Необходимо согласиться с условиями';
            isValid = false;
        }

        document.querySelectorAll('.error-message').forEach(errorElement => {
            const field = errorElement.id.replace('-error', '');
            const inputElement = document.getElementById(field);
            
            if (errors[field]) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
                inputElement?.classList.add('error');
            } else {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
                inputElement?.classList.remove('error');
            }
        });

        registerBtn.disabled = !isValid;
        return isValid;
    }

    function setupInputValidation() {
        const inputs = [
            'phone', 'email', 'birth-date', 'password', 
            'confirm-password', 'full-name', 'username'
        ];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', function() {
                    const errorElement = document.getElementById(`${inputId}-error`);
                    if (errorElement) {
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                        this.classList.remove('error');
                    }
                    validateForm();
                });
            }
        });

        const agreementCheckbox = document.getElementById('agreement');
        if (agreementCheckbox) {
            agreementCheckbox.addEventListener('change', function() {
                const errorElement = document.getElementById('agreement-error');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                validateForm();
            });
        }
    }

    function generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';

        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
        password += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
        password += '0123456789'.charAt(Math.floor(Math.random() * 10));
        password += '!@#$%^&*()'.charAt(Math.floor(Math.random() * 10));

        for (let i = 4; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    function generateUsername(fullName) {
        if (!fullName || fullName.trim() === '') {
            return 'user_' + Math.floor(Math.random() * 10000);
        }
        
        const parts = fullName.trim().split(/\s+/).filter(p => p !== '');
        const randomSuffix = Math.floor(Math.random() * 90 + 10); // от 10 до 99

        if (parts.length >= 3) {
            return `${parts[0].toLowerCase()}_${parts[1][0]}${parts[2][0]}${randomSuffix}`.substring(0, 20);
        } else if (parts.length === 2) {
            return `${parts[0].toLowerCase()}_${parts[1][0]}${randomSuffix}`.substring(0, 20);
        } else {
            return `${parts[0].toLowerCase()}${randomSuffix}`.substring(0, 20);
        }
    }

    document.getElementById('full-name').addEventListener('input', function() {
        if (!isManualUsername) {
            usernameInput.value = generateUsername(this.value);
        }
        validateForm();
    });
    
    generateBtn.addEventListener('click', function() {
        if (usernameAttempts > 0) {
            usernameInput.value = generateUsername(document.getElementById('full-name').value);
            usernameAttempts--;
            document.getElementById('attempts-left').textContent = `(попыток: ${usernameAttempts})`;
            
            if (usernameAttempts === 0) {
                usernameInput.readOnly = false;
                isManualUsername = true;
                document.getElementById('attempts-left').textContent = '(введите вручную)';
                generateBtn.disabled = true;
            }
        }
        validateForm();
    });
    
    passwordOptions.forEach(radio => {
        radio.addEventListener('change', function() {
            manualPasswordFields.style.display = this.value === 'manual' ? 'block' : 'none';
            validateForm();
        });
    });

    document.getElementById('password')?.addEventListener('input', function() {
        validatePassword(this.value);
        validateForm();
    });

    document.getElementById('confirm-password')?.addEventListener('input', validateForm);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            console.log("Форма не прошла валидацию");
            return;
        }
        
        const passwordOption = document.querySelector('input[name="password-option"]:checked').value;
        const password = passwordOption === 'auto' ? generatePassword() : document.getElementById('password').value;
        
        const formData = {
            phone: phoneInput.value.replace(/\D/g, ''),
            email: document.getElementById('email').value,
            birthDate: document.getElementById('birth-date').value,
            password: password,
            fullName: document.getElementById('full-name').value,
            username: usernameInput.value,
            agreement: document.getElementById('agreement').checked,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Ошибка сервера: ' + response.status);
            }
            
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = '../../pages/home.html';
            alert('Регистрация успешна! Пароль: ' + password);
        } catch (error) {
            console.error('Registration error:', error);
            alert('Ошибка регистрации: ' + error.message);
        }
    });

    usernameInput.value = generateUsername('');
    usernameInput.readOnly = true;
    setupInputValidation();
    validateForm();
});