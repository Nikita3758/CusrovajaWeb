class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.minDisplayTime = 1000; 
        this.maxDisplayTime = 5000; 
        this.startTime = Date.now();
    }

    init() {
        window.addEventListener('load', () => {
            this.hide();
        });

        setTimeout(() => {
            if (this.preloader && !this.preloader.classList.contains('hidden')) {
                this.hide();
            }
        }, this.maxDisplayTime);
    }

    hide() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);

        setTimeout(() => {
            if (this.preloader) {
                this.preloader.classList.add('hidden');

                setTimeout(() => {
                    if (this.preloader && this.preloader.parentNode) {
                        this.preloader.parentNode.removeChild(this.preloader);
                    }
                }, 800); 
            }
        }, remainingTime);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const preloader = new Preloader();
    preloader.init();
});