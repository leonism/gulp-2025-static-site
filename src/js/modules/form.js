/**
 * Handles the signup form submission.
 * Prevents default form submission, validates email input,
 * shows a thank you message, and resets the form.
 */
export function handleSignup() {
  const form = document.querySelector("#signupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input").value;
    if (email) {
      alert(`Thanks for signing up, ${email}!`);
      form.reset();
    }
  });
}
