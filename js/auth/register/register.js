import { setupPhoneInput, setupInputValidation, validateForm } from './formHandlers.js';
import { generateUsername } from './generators.js';
import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const passwordOptions = document.querySelectorAll('input[name="password-option"]');
    const manualPasswordFields = document.getElementById('manual-password-fields');
    const generateBtn = document.getElementById('generate-username');
    const usernameInput = document.getElementById('username');
    const registerBtn = document.getElementById('register-btn');
    const phoneInput = document.getElementById('phone');
    
    let usernameAttempts = 5;
    let isManualUsername = false;

    setupPhoneInput(phoneInput);
    setupInputValidation();

    document.getElementById('full-name').addEventListener('input', function() {
        if (!isManualUsername) {
            usernameInput.value = generateUsername(this.value);
            validateForm(phoneInput, usernameInput);
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
                generateBtn.disabled = true;
            }
            validateForm(phoneInput, usernameInput);
        }
    });
    
    passwordOptions.forEach(radio => {
        radio.addEventListener('change', function() {
            manualPasswordFields.style.display = this.value === 'manual' ? 'block' : 'none';
            validateForm(phoneInput, usernameInput);
        });
    });

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            registerBtn.disabled = !validateForm(phoneInput, usernameInput);
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm(phoneInput, usernameInput)) {
            console.log("Форма не прошла валидацию");
            return;
        }
        
        const formData = {
            phone: phoneInput.value,
            email: document.getElementById('email').value,
            birthDate: document.getElementById('birth-date').value,
            fullName: document.getElementById('full-name').value,
            username: usernameInput.value,
            agreement: document.getElementById('agreement').checked
        };
        
        const passwordOption = document.querySelector('input[name="password-option"]:checked').value;
        
        try {
            const user = await registerUser(formData, passwordOption);
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = '../../pages/home.html';
            alert('Регистрация успешна!');
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message);
        }
    });

    usernameInput.value = generateUsername('');
    usernameInput.readOnly = true;
    registerBtn.disabled = true;
});