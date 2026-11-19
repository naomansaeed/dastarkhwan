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

//renderDishes(menuData); // initial paint: show everything

// Only render the menu where menu-data.js is loaded (products.html).
// On other pages menuData is undefined, and referencing it would
// throw an error and halt the rest of the script.
if (typeof menuData !== 'undefined') {
    renderDishes(menuData); // initial paint: show everything
}

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

// ============================================
// RESERVATION DRAFT (visit page, sessionStorage)
// ============================================

function saveDraft(form) {
    // Collect every named field's current value into one object
    const draft = {};
    for (const field of form.elements) {
        if (field.name) {
            draft[field.name] = field.value;
        }
    }

    try {
        sessionStorage.setItem('dastarkhwanReservationDraft', JSON.stringify(draft));
    } catch (error) {
        console.warn('Could not save reservation draft:', error);
    }
}

function restoreDraft(form) {
    let draft = {};
    try {
        draft = JSON.parse(sessionStorage.getItem('dastarkhwanReservationDraft')) || {};
    } catch (error) {
        console.warn('Could not read reservation draft:', error);
        return;
    }

    // Put each saved value back into its matching field
    for (const field of form.elements) {
        if (field.name && draft[field.name] !== undefined) {
            field.value = draft[field.name];
        }
    }
}

function initReservationDraft() {
    const form = document.querySelector('#reservation-form');
    if (!form) return; // guard: only the visit page has this form

    restoreDraft(form); // arrival: give the guest their words back

    // Day 23 delegation: ONE listener on the form catches every field's input
    form.addEventListener('change', () => {
        saveDraft(form);
    });
}

initReservationDraft();

// ============================================
// RESERVATION VALIDATION (visit page) — Layer 1
// ============================================

// Day 27: a custom error class.
// A normal Error only carries a message. Ours also carries the id of the
// field that failed, so we know exactly WHERE to show the message.
class ValidationError extends Error {
    constructor(message, fieldId) {
        super(message);          // hand the message to the built-in Error
        this.name = 'ValidationError';
        this.fieldId = fieldId;  // extra property: which input failed
    }
}

// --- Showing and clearing errors in the DOM ---

function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('input-error');   // red border (from our CSS)
    if (errorSpan) errorSpan.textContent = message;  // the message itself
}

function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + '-error');
    if (input) input.classList.remove('input-error');
    if (errorSpan) errorSpan.textContent = '';
}

// ============================================
// RESERVATION VALIDATION (visit page) — Layer 2
// ============================================
// One validator per field. Each takes the field's value and either
// passes silently or throws a ValidationError carrying the message
// and the id of the field it belongs to.

function validateName(value) {
    if (!value.trim()) {
        throw new ValidationError('Please enter your full name.', 'res-name');
    }
}

function validatePhone(value) {
    const cleaned = value.trim();
    if (!cleaned) {
        throw new ValidationError('Please enter your phone number.', 'res-phone');
    }
    // Day 38 preview: a regex. Accepts 03001234567 or +923001234567.
    const phonePattern = /^(\+92|0)3\d{9}$/;
    if (!phonePattern.test(cleaned)) {
        throw new ValidationError('Enter a valid number, like 03001234567.', 'res-phone');
    }
}

function validateDate(value) {
    if (!value) {
        throw new ValidationError('Please choose a date.', 'res-date');
    }
    // 'T00:00:00' anchors parsing to local time (avoids a timezone trap)
    const chosen = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight today, ignoring the clock time
    if (chosen < today) {
        throw new ValidationError('That date has already passed. Please pick a future one.', 'res-date');
    }
}

function validateTime(value) {
    if (!value) {
        throw new ValidationError('Please choose a time slot.', 'res-time');
    }
}

function validateGuests(value) {
    if (!value) {
        throw new ValidationError('How many guests will be joining?', 'res-guests');
    }
    const guests = Number(value); // form values always arrive as strings
    if (!Number.isInteger(guests) || guests < 1 || guests > 8) {
        throw new ValidationError('For parties of more than eight, please call us directly.', 'res-guests');
    }
}

// ============================================
// RESERVATION VALIDATION (visit page) — Layer 3
// ============================================
// The orchestrator's field list. Each entry pairs an input's id with
// the function that checks it. Adding a field to the form later means
// adding exactly one line here.
const reservationFields = [
    { id: 'res-name',   validate: validateName },
    { id: 'res-phone',  validate: validatePhone },
    { id: 'res-date',   validate: validateDate },
    { id: 'res-time',   validate: validateTime },
    { id: 'res-guests', validate: validateGuests },
];

function validateForm() {
    let isValid = true;
    let firstErrorField = null;

    for (const field of reservationFields) {
        const input = document.getElementById(field.id);
        try {
            field.validate(input.value);   // throws if the value is bad
            clearFieldError(field.id);     // passed: remove any stale error
        } catch (error) {
            if (error instanceof ValidationError) {
                showFieldError(error.fieldId, error.message);
                isValid = false;
                if (!firstErrorField) firstErrorField = input; // remember first problem
            } else {
                throw error;               // not one of ours: don't hide a real bug
            }
        }
    }

    return { isValid, firstErrorField };
}

// The submit handler: ties everything together (Day 24)
function initReservationForm() {
    const form = document.querySelector('#reservation-form');
    if (!form) return; // guard: visit page only

    const successPanel = document.getElementById('form-success');

    form.addEventListener('submit', (event) => {
        // Day 24: stop the browser's default navigation. There is no backend.
        event.preventDefault();

        const result = validateForm();

        if (!result.isValid) {
            // Send keyboard focus straight to the first problem field
            if (result.firstErrorField) result.firstErrorField.focus();
            return;
        }

        // Everything passed: swap the form for the success panel
        form.hidden = true;
        if (successPanel) successPanel.hidden = false;

        // The Ghost Draft fix: a submitted draft must not refill on refresh
        sessionStorage.removeItem('dastarkhwanReservationDraft');
    });
}
initReservationForm();
