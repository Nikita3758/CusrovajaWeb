document.addEventListener('DOMContentLoaded', function() {
  const sliderContainer = document.getElementById('slider-container');
  const paginationContainer = document.getElementById('slider-pagination');
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');
  
  let currentSlide = 0;
  let testimonials = [];
  let slides = [];
  let dots = [];
  let slideInterval;

  async function fetchTestimonials() {
    try {
      const response = await fetch('http://localhost:3000/testimonials');
      if (!response.ok) throw new Error('Network response was not ok');
      testimonials = await response.json();

      testimonials = testimonials.map(item => ({
        ...item,
        photo: item.photo || '../../img/default-avatar.svg'
      }));
      
      initSlider();
      startAutoSlide();
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showError();
    }
  }

  function initSlider() {
    sliderContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    slides = [];
    dots = [];
    
    testimonials.forEach((testimonial, index) => {

      const slide = document.createElement('div');
      slide.className = 'testimonial-card';
      slide.innerHTML = `
        <div class="testimonial-content">
          <div class="testimonial-text-content">
            <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
            <p class="testimonial-text">"${testimonial.quote}"</p>
            <h4 class="testimonial-author">${testimonial.author}</h4>
            <p class="testimonial-position">${testimonial.position}</p>
          </div>
          <div class="author-photo">
            <img src="${testimonial.photo}" alt="${testimonial.author}" 
                 onerror="this.src='../img/default-avatar.svg'">
          </div>
        </div>
      `;
      sliderContainer.appendChild(slide);
      slides.push(slide);

      const dot = document.createElement('div');
      dot.className = 'pagination-dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      paginationContainer.appendChild(dot);
      dots.push(dot);
    });
    
    updateSlider();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetAutoSlide();
  }

    function updateSlider() {
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${-100 * currentSlide}%)`; // Изменили формулу
            slide.style.opacity = index === currentSlide ? '1' : '0'; // Добавили управление прозрачностью
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

  function startAutoSlide() {
    if (testimonials.length > 1) {
      slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
      }, 5000);
    }
  }

  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    resetAutoSlide();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    resetAutoSlide();
  });

  sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });

  sliderContainer.addEventListener('mouseleave', () => {
    resetAutoSlide();
  });

  function showError() {
    sliderContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load testimonials. Please try again later.</p>
      </div>
    `;
  }

  fetchTestimonials();
});