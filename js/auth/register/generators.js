export function generatePassword() {
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

export function generateUsername(fullName) {
    if (!fullName || fullName.trim() === '') {
        return 'user_' + Math.floor(Math.random() * 10000);
    }
    
    const parts = fullName.trim().split(/\s+/).filter(p => p !== '');
    const randomSuffix = Math.floor(Math.random() * 90 + 10); 

    if (parts.length >= 3) {
        return `${parts[0].toLowerCase()}_${parts[1][0]}${parts[2][0]}${randomSuffix}`.substring(0, 20);
    } else if (parts.length === 2) {
        return `${parts[0].toLowerCase()}_${parts[1][0]}${randomSuffix}`.substring(0, 20);
    } else {
        return `${parts[0].toLowerCase()}${randomSuffix}`.substring(0, 20);
    }
}