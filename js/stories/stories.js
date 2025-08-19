document.addEventListener('DOMContentLoaded', function() {
  const trendingStories = document.getElementById('trendingStories');

  fetch('http://localhost:3000/articles')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(articles => {
      trendingStories.innerHTML = '';

      const shuffled = [...articles].sort(() => 0.5 - Math.random());
      const randomArticles = shuffled.slice(0, 4);

      randomArticles.forEach(article => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="story-image" onerror="this.src='../img/default-article.jpg'">
            <div class="story-content">
                <h3 class="story-title">${article.title}</h3>
                <p class="story-excerpt">${article.excerpt}</p>
                <a href="articles.html?id=${article.id}" class="read-more">Read more</a>
            </div>
        `;
        trendingStories.appendChild(storyCard);
      });
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      trendingStories.innerHTML = `
        <div class="error-message">
          Failed to load stories. Please try again later.
        </div>
      `;
    });
});