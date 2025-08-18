document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const dropdownUsername = document.getElementById('dropdown-username');
    const userBtn = document.getElementById('user-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const logoutBtn = document.getElementById('logout-btn');
    const settingsBtn = document.getElementById('settings-btn');

    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-btn');
    const languageSelect = document.getElementById('language-select');
    const fontSizeButtons = document.querySelectorAll('.font-size-buttons button');
    const colorSchemes = document.querySelectorAll('.color-scheme');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const accessibilityOptions = document.getElementById('accessibility-options');
    const disableImages = document.getElementById('disable-images');
    const resetSettings = document.getElementById('reset-settings');

    const adminMessage = localStorage.getItem('adminRedirectMessage');
    if (adminMessage) {
        alert(adminMessage);
        localStorage.removeItem('adminRedirectMessage');
    }

    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userMenu.style.display = 'block';
        usernameDisplay.textContent = currentUser.username || currentUser.fullName.split(' ')[0];
        dropdownUsername.textContent = currentUser.username || currentUser.fullName;

        if (currentUser.role === 'admin') {
            addAdminMenuLink();
        }
    }

    function addAdminMenuLink() {
        if (!document.querySelector('.admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin-panel.html';
            adminLink.className = 'admin-link';
            adminLink.textContent = 'Admin Panel';
            adminLink.setAttribute('data-i18n', 'adminPanel');
            
            const li = document.createElement('li');
            li.appendChild(adminLink);

            const nav = document.querySelector('nav ul');
            const authButtons = document.querySelector('.auth-buttons').parentElement;
            authButtons.parentElement.insertBefore(li, authButtons);

            updateTranslations(languageSelect.value);
        }
    }

    userBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        userBtn.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        userBtn.classList.remove('active');
    });

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'home.html';
    });

    settingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'block';
        loadSettings();
    });

    closeBtn.addEventListener('click', function() {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};

        if (settings.language) {
            languageSelect.value = settings.language;
            updateTranslations(settings.language);
        }

        if (settings.fontSize) {
            document.querySelectorAll('.font-size-buttons button').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.size === settings.fontSize) {
                    btn.classList.add('active');
                }
            });
        }

        if (settings.colorScheme) {
            document.querySelectorAll('.color-scheme').forEach(scheme => {
                scheme.classList.remove('selected');
                if (scheme.dataset.scheme === settings.colorScheme) {
                    scheme.classList.add('selected');
                }
            });
        }

        if (settings.accessibility) {
            accessibilityToggle.checked = settings.accessibility.enabled;
            accessibilityOptions.style.display = settings.accessibility.enabled ? 'block' : 'none';
            if (settings.accessibility.disableImages) {
                disableImages.checked = settings.accessibility.disableImages;
            }
        }
        
    }

    function saveSettings() {
        const activeFontSize = document.querySelector('.font-size-buttons button.active');
        const selectedColorScheme = document.querySelector('.color-scheme.selected');

        const settings = {
            language: languageSelect.value,
            fontSize: activeFontSize ? activeFontSize.dataset.size : 'medium',
            colorScheme: selectedColorScheme ? selectedColorScheme.dataset.scheme : 'light-black',
            accessibility: {
                enabled: accessibilityToggle.checked,
                disableImages: disableImages.checked
            }
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        applySettings(settings);
    }

    function applySettings(settings) {
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${settings.fontSize}`);

        document.body.classList.remove(
            'color-scheme-dark-white',
            'color-scheme-dark-green',
            'color-scheme-light-black',
            'color-scheme-beige-brown',
            'color-scheme-blue-darkblue'
        );
        document.body.classList.add(`color-scheme-${settings.colorScheme}`);

        if (settings.accessibility.enabled) {
            document.body.classList.add('accessibility-mode');
            if (settings.accessibility.disableImages) {
                document.body.classList.add('no-images');
            } else {
                document.body.classList.remove('no-images');
            }
        } else {
            document.body.classList.remove('accessibility-mode', 'no-images');
        }

        updateTranslations(settings.language);
    }

    languageSelect.addEventListener('change', saveSettings);
    
    fontSizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            fontSizeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            saveSettings();
        });
    });
    
    colorSchemes.forEach(scheme => {
        scheme.addEventListener('click', function() {
            colorSchemes.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            saveSettings();
        });
    });
    
    accessibilityToggle.addEventListener('change', function() {
        accessibilityOptions.style.display = this.checked ? 'block' : 'none';
        saveSettings();
    });
    
    disableImages.addEventListener('change', saveSettings);
    
    resetSettings.addEventListener('click', function() {
        localStorage.removeItem('userSettings');
        document.body.className = '';
        settingsModal.style.display = 'none';
        window.location.reload();
    });

    const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    if (savedSettings) {
        applySettings(savedSettings);
    } else {
        const defaultSettings = {
            language: 'ru',
            fontSize: 'medium',
            colorScheme: 'light-black',
            accessibility: {
                enabled: false,
                disableImages: false
            }
        };
        localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
        applySettings(defaultSettings);
    }
});