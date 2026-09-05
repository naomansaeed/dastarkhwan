// ============================================
// FAVORITE DISHES FUNCTIONALITY
// ============================================

function initFavorites() {
    // Guard: this feature only applies where the dishes grid exists.
    // On other pages (About, etc.) we exit early so nothing runs or errors.
    const dishesGrid = document.querySelector('.dishes-grid');
    if (!dishesGrid) return;

    // --- Storage helpers (Day 27: error handling) ---
    function loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('dastarkhwanFavorites')) || {};
        } catch (error) {
            console.warn('Could not read saved favorites; starting fresh.', error);
            return {};
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem('dastarkhwanFavorites', JSON.stringify(favorites));
        } catch (error) {
            console.warn('Could not save favorites.', error);
        }
    }

    // Load saved favorites once, up front.
    let favorites = loadFavorites();

    // --- Rendering helpers ---
    function renderCard(card) {
        const dishId = card.dataset.dishId;
        const favoriteBtn = card.querySelector('.favorite-btn');
        const heartIcon = card.querySelector('.heart-icon');
        const favoriteCount = card.querySelector('.favorite-count');
        const isFavorite = Boolean(favorites[dishId]);

        // toggle(class, force): adds if force is true, removes if false
        favoriteBtn.classList.toggle('active', isFavorite);
        favoriteBtn.setAttribute('aria-pressed', isFavorite);
        heartIcon.textContent = isFavorite ? '♥' : '♡'; // ternary (Day 17)
        favoriteCount.textContent = favorites[dishId] || 0;
    }

    function renderAllCards() {
        dishesGrid.querySelectorAll('.dish-card').forEach(renderCard);
    }

    // --- Event delegation (Day 23): ONE listener on the whole grid ---
    dishesGrid.addEventListener('click', (event) => {
        // Only continue if the click landed on a favorite button (or its icon)
        const favoriteBtn = event.target.closest('.favorite-btn');
        if (!favoriteBtn) return;

        const dishCard = favoriteBtn.closest('.dish-card');
        const dishId = dishCard.dataset.dishId;

        // Toggle the favorite in our data
        if (favorites[dishId]) {
            delete favorites[dishId];
        } else {
            favorites[dishId] = 1;
        }

        saveFavorites();
        renderCard(dishCard); // update only the card that changed

        // Visual feedback animation
        favoriteBtn.style.transform = 'scale(1.3)';
        setTimeout(() => {
            favoriteBtn.style.transform = '';
        }, 200);
    });

    // Paint the initial state on load
    renderAllCards();
}

initFavorites();

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
