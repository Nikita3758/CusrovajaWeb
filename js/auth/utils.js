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

function formatPhone(phone) {
    return phone.replace(/(\+375)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function checkPasswordStrength(password) {
    const strength = {
        length: password.length >= 8 && password.length <= 20,
        upper: /[A-ZА-Я]/.test(password),
        lower: /[a-zа-я]/.test(password),
        digit: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    return strength;
}