document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const passwordOption = document.querySelector('input[name="password-option"]:checked');
    const manualPasswordFields = document.getElementById('manual-password-fields');
    const generateBtn = document.getElementById('generate-username');
    const usernameInput = document.getElementById('username');
    const registerBtn = document.getElementById('register-btn');
    
    let usernameAttempts = 5;
    let isManualUsername = false;

    function generateUsername(fullName) {
        if (isManualUsername) return;
        
        const [lastName, firstName, middleName] = fullName.split(' ');
        let username = '';
        
        if (lastName && firstName) {
            username = `${lastName.toLowerCase()}_${firstName[0].toLowerCase()}${middleName ? middleName[0].toLowerCase() : ''}`;
        } else {
            username = `user_${Math.floor(Math.random() * 10000)}`;
        }
        
        return username;
    }

    function validatePhone(phone) {
        const regex = /^\+375(24|25|29|33|44)\d{7}$/;
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
        
        return requirements;
    }

    function validateForm() {
        let isValid = true;

        if (!validatePhone(document.getElementById('phone').value)) isValid = false;
        if (!document.getElementById('email').checkValidity()) isValid = false;

        const birthDate = new Date(document.getElementById('birth-date').value);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        
        if (age < 16) isValid = false;

        if (passwordOption.value === 'manual') {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) isValid = false;
            
            const passwordValid = validatePassword(password);
            if (!Object.values(passwordValid).every(Boolean)) isValid = false;
        }

        if (!document.getElementById('agreement').checked) isValid = false;

        registerBtn.disabled = !isValid;
    }

    document.getElementById('full-name').addEventListener('input', function() {
        if (!isManualUsername) {
            usernameInput.value = generateUsername(this.value);
        }
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
    });
    
    document.querySelectorAll('input[name="password-option"]').forEach(radio => {
        radio.addEventListener('change', function() {
            manualPasswordFields.style.display = this.value === 'manual' ? 'block' : 'none';
            validateForm();
        });
    });

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            birthDate: document.getElementById('birth-date').value,
            password: passwordOption.value === 'auto' ? generatePassword() : document.getElementById('password').value,
            fullName: document.getElementById('full-name').value,
            username: document.getElementById('username').value,
            agreement: document.getElementById('agreement').checked,
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
            
            if (response.ok) {
                alert('Регистрация успешна!');
                window.location.href = '../../pages/login.html';
            } else {
                throw new Error('Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации');
        }
    });

    validateForm();
});