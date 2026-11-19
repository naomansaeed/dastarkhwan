# Dastarkhwan | Heritage Restaurant Website

A fully responsive, multi-page website for a fictional century-old heritage restaurant in Bahawalpur. Built from scratch using semantic HTML, modern CSS, and Vanilla JavaScript to demonstrate core front-end fundamentals without relying on any frameworks or libraries.

🔗 **[View Live Demo on Netlify](https://dastarkhwan-demo.netlify.app)**

## Project Overview

Dastarkhwan acts as a digital billboard and interactive menu for a traditional Nawabi restaurant. The project was built as a structured learning roadmap to master DOM manipulation, state management, form validation, and responsive design using only native web technologies.

## Key Features

*   **Cross-Page Favorites System:** Guests can "heart" dishes on the homepage or the full menu. Selections persist across page reloads and sync instantly between pages using `localStorage`. A live badge in the header tracks the total count.
*   **Data-Driven Menu:** The 16-dish menu on the Products page is rendered dynamically from a JavaScript array of objects using `.map()` and template literals.
*   **Interactive Filtering & Search:** Category buttons and a live search bar share state to filter the menu in real-time using `.filter()`.
*   **Smart Reservation Form:** 
    *   Custom validation with a specialized `ValidationError` class.
    *   Auto-saving drafts to `sessionStorage` so users do not lose their input if they accidentally refresh.
    *   Ghost-draft prevention (clears storage upon successful submission).
*   **Responsive Navigation:** A custom hamburger menu with CSS transitions that morphs the bars into an "X" on mobile viewports.

## Technical Concepts Demonstrated

This project intentionally avoids frameworks to build a deep understanding of the JavaScript engine and the browser API:

*   **DOM Manipulation:** Event delegation, dynamic HTML generation via `innerHTML`, and class toggling.
*   **State Management:** Shared state variables for complex UI interactions (filters + search) and browser storage APIs (`localStorage` for long-term preferences, `sessionStorage` for transient form drafts).
*   **Error Handling:** `try/catch` blocks around storage parsing, and custom `Error` classes to pass contextual data (like field IDs) to the UI layer.
*   **Array Methods:** Heavy use of `.map()`, `.filter()`, `.forEach()`, and `Object.keys()`.
*   **Accessibility (a11y):** ARIA attributes (`aria-live`, `aria-expanded`, `aria-pressed`), semantic HTML5 landmarks, skip-links, and proper form labeling.
*   **CSS Architecture:** CSS Custom Properties (variables) for a centralized design system, Flexbox/Grid layouts, and mobile-first media queries.

## Project Structure

```text
├── index.html          # Homepage (Hero, Heritage, Signature Dishes)
├── about.html          # Our Story (Origin, Keepers, Gallery)
├── products.html       # Interactive Menu (Filters, Search, Grid)
├── visit.html          # Plan Your Visit (Info, Reservation Form)
├── css/
│   └── styles.css      # Global styles and component design system
├── js/
│   ├── scripts.js      # Main application logic and event listeners
│   └── menu-data.js    # Single source of truth for the 16 menu items
└── images/             # Optimized photography and UI icons
```

## Running Locally

Since this is a static site with no build step, you can run it using any local server.

1. Clone the repository.
2. Open the folder in your code editor.
3. Use a local server extension (like VS Code's "Live Server") or run `python -m http.server` in the terminal.
4. Open `http://localhost:8000` (or your designated port) in your browser.

## Future Enhancements

* Replace emoji icons with custom inline SVGs for sharper scaling and styling control.
* Add a "Shortlist" or Cart feature using `.reduce()` to calculate estimated totals.
* Implement `prefers-reduced-motion` media queries for users sensitive to animations.
* Connect the reservation form to a real backend or serverless function (like Netlify Forms) to actually process bookings.
