/* ---------------------------------------------------
   MOBILE NAV
--------------------------------------------------- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

/* ---------------------------------------------------
   THEME SWITCH (Light <-> Night)
--------------------------------------------------- */
const modeToggle = document.getElementById("modeToggle");
const body = document.body;

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    body.classList.toggle("theme-light");
    body.classList.toggle("theme-night");

    modeToggle.textContent =
      body.classList.contains("theme-light")
        ? "Night mode"
        : "Light mode";
  });
}

/* ---------------------------------------------------
   CITY FILTERS
--------------------------------------------------- */
const filterButtons = document.querySelectorAll(".city-filter-btn");
const eventCards = document.querySelectorAll(".event-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    eventCards.forEach((card) => {
      const city = card.dataset.city;

      if (filter === "all" || filter === city) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});

/* ---------------------------------------------------
   FADE-IN ON SCROLL
--------------------------------------------------- */
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

/* ---------------------------------------------------
   SMOOTH SCROLL FOR NAV LINKS
--------------------------------------------------- */
const scrollLinks = document.querySelectorAll("[data-scroll-target]");

scrollLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.dataset.scrollTarget);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    mainNav.classList.remove("open");
  });
});

/* ---------------------------------------------------
   SHOOTING STARS (Night mode only)
--------------------------------------------------- */
function createShootingStar() {
  if (!body.classList.contains("theme-night")) return;

  const star = document.createElement("div");
  star.className = "shooting-star";

  const startTop = Math.random() * window.innerHeight * 0.4;
  const startLeft = Math.random() * window.innerWidth * 0.4;

  star.style.top = `${startTop}px`;
  star.style.left = `${startLeft}px`;

  document.body.appendChild(star);

  star.style.animation = "shoot 1.8s ease-out forwards";

  setTimeout(() => star.remove(), 2000);
}

function scheduleStars() {
  const delay = 10000 + Math.random() * 20000; // 10–30s
  setTimeout(() => {
    if (body.classList.contains("theme-night")) {
      const count = 3 + Math.floor(Math.random() * 3); // 3–5 stars
      for (let i = 0; i < count; i++) {
        setTimeout(createShootingStar, i * 300);
      }
    }
    scheduleStars();
  }, delay);
}

window.addEventListener("load", scheduleStars);

/* ---------------------------------------------------
   INLINE RSVP (future-ready)
--------------------------------------------------- */
const rsvpButtons = document.querySelectorAll(".event-rsvp-btn");

rsvpButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("RSVP coming soon — this feature is being added gently.");
  });
});
