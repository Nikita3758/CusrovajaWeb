import { validatePhone, checkAge, validatePassword, updateRequirement } from './validation.js';

export function setupPhoneInput(phoneInput) {
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
    });
}

export function setupInputValidation() {
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
        });
    }
}

export function validateForm(phoneInput, usernameInput) {
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

    const usernameValue = usernameInput.value.trim();
    if (!usernameValue) {
        errors.username = 'Введите никнейм';
        isValid = false;
    }

    if (!document.getElementById('agreement').checked) {
        errors.agreement = 'Необходимо согласиться с условиями';
        isValid = false;
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

    return isValid;
}