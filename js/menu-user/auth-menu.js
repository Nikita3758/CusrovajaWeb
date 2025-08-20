function updateMenu(user) {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const dropdownUsername = document.getElementById('dropdown-username');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (usernameDisplay) usernameDisplay.textContent = user.username || user.fullName.split(' ')[0];
        if (dropdownUsername) dropdownUsername.textContent = user.username || user.fullName;

        if (user.role === 'admin') {
            addAdminMenuLink();
        }
    }

    updateMobileMenu();
}

function addAdminMenuLink() {
    if (!document.querySelector('.admin-link')) {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin-panel.html';
        adminLink.className = 'admin-link';
        adminLink.textContent = 'Admin Panel';
        adminLink.setAttribute('data-i18n', 'adminPanel');
        
        const li = document.createElement('li');
        li.style.listStyle = 'none'; 
        li.appendChild(adminLink);

        const nav = document.querySelector('nav ul');
        if (nav) {
            const authButtons = document.querySelector('.auth-buttons');
            if (authButtons) {
                authButtons.parentElement.insertBefore(li, authButtons);
            } else {
                nav.appendChild(li);
            }
        }

        const languageSelect = document.getElementById('language-select');
        if (languageSelect && typeof updateTranslations === 'function') {
            updateTranslations(languageSelect.value);
        }
    }
}

function setupUserDropdown() {
    const userBtn = document.getElementById('user-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const logoutBtn = document.getElementById('logout-btn');

    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            userBtn.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
            userBtn.classList.remove('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'home.html';
        });
    }
}

function checkAdminRedirect() {
    const adminMessage = localStorage.getItem('adminRedirectMessage');
    if (adminMessage) {
        alert(adminMessage);
        localStorage.removeItem('adminRedirectMessage');
    }
}