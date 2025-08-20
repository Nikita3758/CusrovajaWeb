import { commonPasswords } from './constants.js';

export function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('375') && 
           cleanPhone.length === 12 && 
           ['25', '29', '33', '44'].includes(cleanPhone.substring(3, 5));
}

export function checkAge(birthDate) {
    const birthDateObj = new Date(birthDate);
    const ageDiff = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) >= 16;
}

export function validatePassword(password) {
    return {
        length: password.length >= 8 && password.length <= 20,
        upper: /[A-ZА-Я]/.test(password),
        lower: /[a-zа-я]/.test(password),
        digit: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        common: !commonPasswords.includes(password.toLowerCase())
    };
}

export function updateRequirement(id, isValid) {
    const element = document.getElementById(`req-${id}`);
    if (element) {
        element.classList.toggle('valid', isValid);
        element.classList.toggle('invalid', !isValid);
    }
}