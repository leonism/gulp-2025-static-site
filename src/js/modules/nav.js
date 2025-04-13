/**
 * Toggles mobile navigation menu visibility when the toggle button is clicked.
 * Adds click event listener to the nav toggle button and toggles 'open' class
 * on the navigation list for showing/hiding mobile menu.
 */
export function toggleMenu() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    navToggle.classList.toggle("active");

    // Toggle aria-expanded for accessibility
    const expanded = navToggle.getAttribute("aria-expanded") === "true" || false;
    navToggle.setAttribute("aria-expanded", !expanded);

    // Prevent body scrolling when menu is open
    document.body.classList.toggle("nav-open");
  });

  // Close menu when clicking on a link
  const navLinks = document.querySelectorAll(".nav-list a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.classList.remove("active");
      document.body.classList.remove("nav-open");
    });
  });
}
