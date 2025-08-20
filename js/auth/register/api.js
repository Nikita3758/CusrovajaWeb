import { API_URL } from './constants.js';
import { generatePassword } from './generators.js';

export async function registerUser(formData, passwordOption) {
    const password = passwordOption === 'auto' ? generatePassword() : document.getElementById('password').value;
    
    const userData = {
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email,
        birthDate: formData.birthDate,
        password: password,
        fullName: formData.fullName,
        username: formData.username,
        agreement: formData.agreement,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сервера: ' + response.status);
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Ошибка регистрации: ' + error.message);
    }
}