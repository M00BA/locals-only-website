// MOBILE NAV TOGGLE
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// THEME SWITCHING
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

// FADE-IN ON SCROLL
const fadeEls = document.querySelectorAll(".fade-in");

const revealOnScroll = () => {
  fadeEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// RSVP FORM (optional)
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
