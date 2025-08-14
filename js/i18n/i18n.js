const translations = {
    en: {
        home: "Home",
        destinations: "Destinations",
        about: "About",
        partner: "Partner",
        login: "Login",
        register: "Register",
        settings: "Settings",
        logout: "Logout",
        language: "Language",
        fontSize: "Font Size",
        small: "Small",
        medium: "Medium",
        large: "Large",
        colorScheme: "Color Scheme",
        darkWhite: "Black/White",
        darkGreen: "Black/Green",
        lightBlack: "White/Black",
        beigeBrown: "Beige/Brown",
        blueDarkblue: "Blue/Dark Blue",
        accessibility: "Accessibility Mode",
        disableImages: "Disable images",
        reset: "Reset Settings",
        welcome: "Welcome to our travel website",
        welcomeText: "Here you will find the best destinations for your next adventure.",
        travelImage: "Traveler in the mountains"
    },
    ru: {
        home: "Главная",
        destinations: "Направления",
        about: "О нас",
        partner: "Партнеры",
        login: "Вход",
        register: "Регистрация",
        settings: "Настройки",
        logout: "Выход",
        language: "Язык",
        fontSize: "Размер шрифта",
        small: "Маленький",
        medium: "Средний",
        large: "Большой",
        colorScheme: "Цветовая схема",
        darkWhite: "Черный/Белый",
        darkGreen: "Черный/Зеленый",
        lightBlack: "Белый/Черный",
        beigeBrown: "Бежевый/Коричневый",
        blueDarkblue: "Голубой/Темно-синий",
        accessibility: "Версия для слабовидящих",
        disableImages: "Отключить изображения",
        reset: "Сбросить настройки",
        welcome: "Добро пожаловать на наш сайт о путешествиях",
        welcomeText: "Здесь вы найдете лучшие направления для вашего следующего приключения.",
        travelImage: "Путешественник в горах"
    }
};

function updateTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'IMG') {
                element.alt = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    document.documentElement.lang = lang;
}