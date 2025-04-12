import { toggleMenu } from "./modules/nav.js";
import { handleSignup } from "./modules/form.js";

document.addEventListener("DOMContentLoaded", () => {
  toggleMenu();
  handleSignup();
});
