export function toggleMenu() {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-list");

  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}
