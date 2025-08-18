document.addEventListener('DOMContentLoaded', function() {
  const featuredContainer = document.getElementById('featuredDestinations');

  fetch('http://localhost:3000/destinations')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      featuredContainer.innerHTML = '';

      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const randomDestinations = shuffled.slice(0, 4);

      randomDestinations.forEach(destination => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.innerHTML = `
          <img src="${destination.image}" alt="${destination.name}" class="destination-image">
          <div class="destination-overlay">
            <div class="destination-name">${destination.name}</div>
            <div class="destination-location">${destination.location}</div>
          </div>
        `;
        featuredContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error fetching destinations:', error);
      featuredContainer.innerHTML = `
        <div class="error-message">
          Failed to load destinations. Please try again later.
        </div>
      `;
    });
});