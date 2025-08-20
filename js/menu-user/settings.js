function setupSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-btn');
    const resetSettings = document.getElementById('reset-settings');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            if (settingsModal) {
                settingsModal.style.display = 'block';
                loadSettings();
            }
        });
    }

    if (closeBtn && settingsModal) {
        closeBtn.addEventListener('click', function() {
            settingsModal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }

    if (resetSettings) {
        resetSettings.addEventListener('click', function() {
            localStorage.removeItem('userSettings');
            document.body.className = '';
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
            window.location.reload();
        });
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
    const languageSelect = document.getElementById('language-select');
    const fontSizeButtons = document.querySelectorAll('.font-size-buttons button');
    const colorSchemes = document.querySelectorAll('.color-scheme');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const accessibilityOptions = document.getElementById('accessibility-options');
    const disableImages = document.getElementById('disable-images');

    if (settings.language && languageSelect) {
        languageSelect.value = settings.language;
        if (typeof updateTranslations === 'function') {
            updateTranslations(settings.language);
        }
    }

    if (settings.fontSize && fontSizeButtons) {
        fontSizeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === settings.fontSize) {
                btn.classList.add('active');
            }
        });
    }

    if (settings.colorScheme && colorSchemes) {
        colorSchemes.forEach(scheme => {
            scheme.classList.remove('selected');
            if (scheme.dataset.scheme === settings.colorScheme) {
                scheme.classList.add('selected');
            }
        });
    }

    if (settings.accessibility && accessibilityToggle && accessibilityOptions && disableImages) {
        accessibilityToggle.checked = settings.accessibility.enabled;
        accessibilityOptions.style.display = settings.accessibility.enabled ? 'block' : 'none';
        if (settings.accessibility.disableImages) {
            disableImages.checked = settings.accessibility.disableImages;
        }
    }
}

function saveSettings() {
    const languageSelect = document.getElementById('language-select');
    const activeFontSize = document.querySelector('.font-size-buttons button.active');
    const selectedColorScheme = document.querySelector('.color-scheme.selected');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const disableImages = document.getElementById('disable-images');

    const settings = {
        language: languageSelect ? languageSelect.value : 'ru',
        fontSize: activeFontSize ? activeFontSize.dataset.size : 'medium',
        colorScheme: selectedColorScheme ? selectedColorScheme.dataset.scheme : 'light-black',
        accessibility: {
            enabled: accessibilityToggle ? accessibilityToggle.checked : false,
            disableImages: disableImages ? disableImages.checked : false
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

    if (typeof updateTranslations === 'function') {
        updateTranslations(settings.language);
    }
}

function setupSettingsControls() {
    const languageSelect = document.getElementById('language-select');
    const fontSizeButtons = document.querySelectorAll('.font-size-buttons button');
    const colorSchemes = document.querySelectorAll('.color-scheme');
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const disableImages = document.getElementById('disable-images');

    if (languageSelect) {
        languageSelect.addEventListener('change', saveSettings);
    }
    
    if (fontSizeButtons) {
        fontSizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                fontSizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                saveSettings();
            });
        });
    }
    
    if (colorSchemes) {
        colorSchemes.forEach(scheme => {
            scheme.addEventListener('click', function() {
                colorSchemes.forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                saveSettings();
            });
        });
    }
    
    if (accessibilityToggle) {
        const accessibilityOptions = document.getElementById('accessibility-options');
        accessibilityToggle.addEventListener('change', function() {
            if (accessibilityOptions) {
                accessibilityOptions.style.display = this.checked ? 'block' : 'none';
            }
            saveSettings();
        });
    }
    
    if (disableImages) {
        disableImages.addEventListener('change', saveSettings);
    }
}

function initializeDefaultSettings() {
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
}