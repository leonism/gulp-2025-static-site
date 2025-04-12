/**
 * Toggles mobile navigation menu visibility when the toggle button is clicked.
 * Adds click event listener to the nav toggle button and toggles 'open' class
 * on the navigation list for showing/hiding mobile menu.
 */
export function toggleMenu() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-list");

  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}
