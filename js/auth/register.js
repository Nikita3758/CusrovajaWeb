document.addEventListener('DOMContentLoaded', function() {

    const commonPasswords = [
        'password', '123456', '12345678', '123456789', '12345', 
        'qwerty', 'abc123', 'football', 'monkey', '111111',
        'letmein', 'dragon', 'baseball', 'sunshine', 'iloveyou'
    ];

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
        let value = this.value.replace(/\D/g, '');
        if (value.length > 0) value = '+' + value;
        if (value.length > 4) value = value.substring(0, 4) + ' ' + value.substring(4);
        if (value.length > 7) value = value.substring(0, 7) + ' ' + value.substring(7);
        if (value.length > 10) value = value.substring(0, 10) + ' ' + value.substring(10);
        if (value.length > 13) value = value.substring(0, 13) + ' ' + value.substring(13);
        this.value = value.substring(0, 17);
        validateForm();
    });

    function generateUsername(fullName) {
        if (!fullName) return 'user_' + Math.floor(Math.random() * 10000);
        
        const parts = fullName.trim().split(/\s+/);
        if (parts.length < 2) return parts[0].toLowerCase() + '_' + Math.floor(Math.random() * 100);
        
        const lastName = parts[0].toLowerCase();
        const firstNameChar = parts[1].charAt(0).toLowerCase();
        const middleNameChar = parts.length > 2 ? parts[2].charAt(0).toLowerCase() : '';
        
        return `${lastName}_${firstNameChar}${middleNameChar}`.substring(0, 20);
    }

    function validatePhone(phone) {
        const regex = /^\+375 (24|25|29|33|44) \d{3} \d{2} \d{2}$/;
        return regex.test(phone);
    }

    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8 && password.length <= 20,
            upper: /[A-ZА-Я]/.test(password),
            lower: /[a-zа-я]/.test(password),
            digit: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            common: !commonPasswords.includes(password.toLowerCase())
        };

        document.getElementById('req-length').style.color = requirements.length ? 'green' : 'red';
        document.getElementById('req-upper').style.color = requirements.upper ? 'green' : 'red';
        document.getElementById('req-lower').style.color = requirements.lower ? 'green' : 'red';
        document.getElementById('req-digit').style.color = requirements.digit ? 'green' : 'red';
        document.getElementById('req-special').style.color = requirements.special ? 'green' : 'red';
        document.getElementById('req-common').style.color = requirements.common ? 'green' : 'red';
        
        return requirements;
    }

    function validateForm() {
    let isValid = true;
    const errors = {};

    const phoneValue = phoneInput.value.trim();
    if (!phoneValue) {
        errors.phone = 'Введите номер телефона';
        isValid = false;
    } else if (!validatePhone(phoneValue)) {
        errors.phone = 'Введите корректный номер телефона РБ (+375 ...)';
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
        errors.birthDate = 'Введите дату рождения';
        isValid = false;
    } else {
        const birthDate = new Date(birthDateValue);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        if (age < 16) {
            errors.birthDate = 'Регистрация доступна с 16 лет';
            isValid = false;
        }
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
        errors.fullName = 'Введите ФИО';
        isValid = false;
    } else if (fullNameValue.trim().split(/\s+/).length < 2) {
        errors.fullName = 'Введите Фамилию и Имя';
        isValid = false;
    }

    const usernameValue = usernameInput.value.trim();
    if (!usernameValue) {
        errors.username = 'Введите никнейм';
        isValid = false;
    }

    if (!document.getElementById('agreement').checked) {
        errors.agreement = 'Необходимо согласиться с условиями';
        isValid = false;
    }

    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            const inputField = document.getElementById(field);
            if (inputField) {
                inputField.style.borderColor = errors[field] ? 'red' : '';
            }
        }
    });

    document.querySelectorAll('.error-message').forEach(el => {
        const field = el.id.replace('-error', '');
        if (!errors[field]) {
            el.textContent = '';
            const inputField = document.getElementById(field);
            if (inputField) {
                inputField.style.borderColor = '';
            }
        }
    });

    registerBtn.disabled = !isValid;

    console.log('Form validation:', {isValid, errors});
    
    return isValid;
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

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const passwordOption = document.querySelector('input[name="password-option"]:checked').value;
        const password = passwordOption === 'auto' ? generatePassword() : document.getElementById('password').value;
        
        const formData = {
            phone: phoneInput.value,
            email: document.getElementById('email').value,
            birthDate: document.getElementById('birth-date').value,
            password: password,
            fullName: document.getElementById('full-name').value,
            username: usernameInput.value,
            agreement: document.getElementById('agreement').checked,
            createdAt: new Date().toISOString()
        };
        
        try {
            console.log('Отправка данных:', formData);
            alert('Регистрация успешна! Пароль: ' + password);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации');
        }
    });

    usernameInput.value = generateUsername('');
    validateForm();
});