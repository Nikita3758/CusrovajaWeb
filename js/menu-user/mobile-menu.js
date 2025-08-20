function updateMobileMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mobileAuth = document.querySelector('.mobile-auth');
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    
    if (currentUser) {
        if (mobileAuth) {
            mobileAuth.style.display = 'none';
        }

        if (mobileUserMenu) {
            mobileUserMenu.style.display = 'block';
            const usernameSpan = mobileUserMenu.querySelector('#mobile-username');
            if (usernameSpan) {
                usernameSpan.textContent = currentUser.username || currentUser.fullName.split(' ')[0];
            }

            if (currentUser.role === 'admin' && !mobileUserMenu.querySelector('.admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin-panel.html';
                adminLink.className = 'admin-link mobile-admin-link';
                adminLink.textContent = 'Admin Panel';
                adminLink.setAttribute('data-i18n', 'adminPanel');
                
                const li = document.createElement('li');
                li.appendChild(adminLink);
                mobileUserMenu.querySelector('ul').appendChild(li);
            }
        }
    } else {
        if (mobileAuth) {
            mobileAuth.style.display = 'flex';
        }
        if (mobileUserMenu) {
            mobileUserMenu.style.display = 'none';
        }
    }
}

function mobileLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'home.html';
}

function openMobileSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.style.display = 'block';
        const loadSettingsEvent = new Event('loadSettings');
        document.dispatchEvent(loadSettingsEvent);
    }
}