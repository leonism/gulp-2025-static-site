export function handleSignup(){const e=document.querySelector("#signupForm");e&&e.addEventListener("submit",(n=>{n.preventDefault();const t=e.querySelector("input").value;t&&(alert(`Thanks for signing up, ${t}!`),e.reset())}))}