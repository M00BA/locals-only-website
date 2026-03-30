// MOBILE NAV
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// THEME SWITCH
const modeToggle = document.querySelector(".mode-toggle");
const body = document.body;

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    body.classList.toggle("theme-light");
    body.classList.toggle("theme-night");

    modeToggle.textContent =
      body.classList.contains("theme-light") ? "Night mode" : "Light mode";
  });
}

// FADE-IN
const fadeEls = document.querySelectorAll(".fade-in");

const reveal = () => {
  fadeEls.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight - 80) {
      el.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

// RSVP SUCCESS
const rsvpForm = document.querySelector(".rsvp-form");
const rsvpSuccess = document.querySelector(".rsvp-success");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    rsvpSuccess.textContent = "Thanks for saying hi!";
    setTimeout(() => (rsvpSuccess.textContent = ""), 3000);
    rsvpForm.reset();
  });
}
