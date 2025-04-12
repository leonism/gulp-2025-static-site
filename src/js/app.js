/**
 * Main JavaScript entry point for the application.
 * Imports and initializes all module functionality when the DOM is fully loaded.
 */
import { toggleMenu } from "./modules/nav.js";
import { handleSignup } from "./modules/form.js";

// Initialize all module functionality after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  toggleMenu(); // Sets up mobile navigation toggle functionality
  handleSignup(); // Initializes form submission handling
});
