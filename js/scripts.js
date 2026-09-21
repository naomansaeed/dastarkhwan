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
        updateFavoritesBadge(); // keep the header count in sync

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

// ============================================
// MOBILE NAV TOGGLE (hamburger menu)
// ============================================

function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const header = document.querySelector('.site-header');

    // Guard: only run if both elements exist on this page
    if (!navToggle || !header) return;

    navToggle.addEventListener('click', () => {
        // classList.toggle RETURNS a boolean:
        // true if the class was added, false if it was removed
        const isOpen = header.classList.toggle('nav-open');

        // Keep the accessibility state in sync
        navToggle.setAttribute('aria-expanded', isOpen);
        navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
}

initMobileNav();

// ============================================
// FAVORITES BADGE (header count)
// ============================================

function updateFavoritesBadge() {
    const badge = document.querySelector('.favorites-badge');
    if (!badge) return; // guard: pages without the badge simply skip

    let count = 0;
    try {
        const favorites = JSON.parse(localStorage.getItem('dastarkhwanFavorites')) || {};
        count = Object.keys(favorites).length;
    } catch (error) {
        console.warn('Could not read favorites for badge:', error);
    }

    badge.textContent = count;
    badge.setAttribute('title', count === 1 ? '1 saved dish' : count + ' saved dishes');
}

updateFavoritesBadge(); // paint the count on page load

// ============================================
// MENU RENDERING (products page)
// ============================================

function renderDishes(dishes) {
    const menuGrid = document.querySelector('.menu-grid');
    const emptyMessage = document.querySelector('.menu-empty');
    if (!menuGrid) return; // guard: only the products page has this grid

    // Empty state: zero matches means an empty grid plus the message
    if (dishes.length === 0) {
        menuGrid.innerHTML = '';
        if (emptyMessage) emptyMessage.hidden = false;
        return;
    }

    // We have matches, so hide the message if it was showing
    if (emptyMessage) emptyMessage.hidden = true;
    
    // Read favorites so each card's heart starts in the right state
    let favorites = {};
    try {
        favorites = JSON.parse(localStorage.getItem('dastarkhwanFavorites')) || {};
    } catch (error) {
        console.warn('Could not read favorites while rendering the menu:', error);
    }

    // Day 20: .map() turns each dish object into a card's HTML string
    const cardsHTML = dishes.map((dish) => {
        const isFavorite = Boolean(favorites[dish.id]);

        return `
        <article class="dish-card" data-dish-id="${dish.id}">
            <div class="dish-image">
                <img src="${dish.img}" alt="${dish.name}" loading="lazy">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}"
                        aria-label="${isFavorite ? 'Remove from' : 'Add to'} favorites"
                        aria-pressed="${isFavorite}">
                    <span class="heart-icon">${isFavorite ? '♥' : '♡'}</span>
                </button>
            </div>
            <div class="dish-content">
                <h3>${dish.name}</h3>
                <p>${dish.description}</p>
                <div class="dish-footer">
                    <span class="price">Rs. ${dish.price}</span>
                    <span class="favorite-count">${favorites[dish.id] || 0}</span>
                </div>
            </div>
        </article>`;
    }).join(''); // glue the array of strings into one string

    menuGrid.innerHTML = cardsHTML;
}

renderDishes(menuData); // initial paint: show everything

// ============================================
// MENU FILTERS + SEARCH (products page)
// ============================================

// Shared state: the filter buttons and the search box both read these
let activeCategory = 'all';
let searchTerm = '';

// The single place that combines category + search, then re-renders
function applyFilters() {
    let visible = menuData;

    if (activeCategory !== 'all') {
        visible = visible.filter((dish) => dish.category === activeCategory);
    }

    if (searchTerm !== '') {
        visible = visible.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm)
        );
    }

    renderDishes(visible);
}

function initMenuFilters() {
    const filterBar = document.querySelector('.filter-buttons');
    if (!filterBar) return;

    // Day 23: one delegated listener on the button container
    filterBar.addEventListener('click', (event) => {
        const clickedBtn = event.target.closest('.filter-btn');
        if (!clickedBtn) return;

        // Move the active highlight: true only for the clicked button
        filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn === clickedBtn);
        });

        // Update shared state, then re-render through applyFilters
        activeCategory = clickedBtn.dataset.category;
        applyFilters();
    });
}

function initMenuSearch() {
    const searchInput = document.querySelector('.menu-search');
    if (!searchInput) return; // guard: products page only

    // 'input' fires on every keystroke, paste, or clear
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        applyFilters();
    });
}

initMenuFilters();
initMenuSearch();
