document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const currentLang = localStorage.getItem('language') || 'ru';
        
        try {
            const response = await fetch('http://localhost:3000/users');
            const users = await response.json();
            
            const user = users.find(u => 
                (u.email === login || u.phone === login) && 
                verifyPassword(password, u.password)
            );
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = '../../pages/home.html';
            } else {
                document.getElementById('login-error').textContent = 
                    translations[currentLang].loginError;
            }
        } catch (error) {
            console.error('Ошибка:', error);
            document.getElementById('login-error').textContent = 
                translations[currentLang].loginServerError;
        }
    });
});

function verifyPassword(inputPassword, storedHash) {
    return inputPassword === storedHash; 
}
