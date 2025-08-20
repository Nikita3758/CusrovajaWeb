document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    checkAdminRedirect();
    updateMenu(currentUser);
    setupUserDropdown();
    setupSettingsModal();
    setupSettingsControls();
    initializeDefaultSettings();

    document.addEventListener('loadSettings', loadSettings);
});