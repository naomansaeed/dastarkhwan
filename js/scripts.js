// ============================================
       // FAVORITE DISHES FUNCTIONALITY
       // ============================================

       // 1. Select all favorite buttons and dish cards
       const favoriteButtons = document.querySelectorAll('.favorite-btn');
       const dishCards = document.querySelectorAll('.dish-card');

       // 2. Load favorites from localStorage when page loads
       let favorites = JSON.parse(localStorage.getItem('dastarkhwanFavorites')) || {};

       // 3. Update the UI based on stored favorites
       function updateFavoritesUI() {
           dishCards.forEach(card => {
               const dishId = card.dataset.dishId;
               const heartIcon = card.querySelector('.heart-icon');
               const favoriteBtn = card.querySelector('.favorite-btn');
               const favoriteCount = card.querySelector('.favorite-count');

               // Check if this dish is favorited
               if (favorites[dishId]) {
                   favoriteBtn.classList.add('active');
                   heartIcon.textContent = '♥'; // Filled heart
               } else {
                   favoriteBtn.classList.remove('active');
                   heartIcon.textContent = '♡'; // Empty heart
               }

               // Update favorite count
               const count = favorites[dishId] || 0;
               favoriteCount.textContent = count;
           });
       }

       // 4. Add click event listeners to all favorite buttons
       favoriteButtons.forEach(button => {
           button.addEventListener('click', function() {
               // Find the parent dish card
               const dishCard = this.closest('.dish-card');
               const dishId = dishCard.dataset.dishId;

               // Toggle favorite status
               if (favorites[dishId]) {
                   // If already favorited, remove it
                   delete favorites[dishId];
               } else {
                   // If not favorited, add it with count of 1
                   favorites[dishId] = 1;
               }

               // Save to localStorage
               localStorage.setItem('dastarkhwanFavorites', JSON.stringify(favorites));

               // Update the UI
               updateFavoritesUI();

               // Visual feedback animation
               this.style.transform = 'scale(1.3)';
               setTimeout(() => {
                   this.style.transform = 'scale(1)';
               }, 200);
           });
       });

       // 5. Initialize the UI on page load
       updateFavoritesUI();

       // ============================================
       // SCROLL-AWARE HEADER (existing functionality)
       // ============================================
      const header = document.querySelector('.site-header');

       window.addEventListener('scroll', () => {
           if (window.scrollY > 50) {
               header.classList.add('scrolled');
           } else {
               header.classList.remove('scrolled');
           }
       });
