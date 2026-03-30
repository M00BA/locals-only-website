// MOBILE NAV
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
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

// INLINE RSVP TOGGLE + SAVE
const rsvpButtons = document.querySelectorAll(".event-rsvp-btn");

rsvpButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".event-card");
    if (!card) return;

    const inline = card.querySelector(".event-rsvp-inline");
    if (!inline) return;

    inline.classList.toggle("open");
  });
});

const rsvpInlineBlocks = document.querySelectorAll(".event-rsvp-inline");

rsvpInlineBlocks.forEach((block) => {
  const form = block.querySelector(".event-rsvp-form");
  const confirmation = block.querySelector(".event-rsvp-confirmation");
  const eventId = block.dataset.eventId || "unknown-event";

  if (!form || !confirmation) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";

    const rsvpData = {
      eventId,
      name,
      email,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("localsOnlyRSVPs") || "[]");
      existing.push(rsvpData);
      localStorage.setItem("localsOnlyRSVPs", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save RSVP to localStorage", err);
    }

    form.style.display = "none";
    confirmation.textContent = "Thank you — see you there.";
  });
});

// SUGGEST A MEETUP (localStorage)
const suggestForm = document.querySelector(".suggest-form");
const suggestTextarea = document.querySelector(".suggest-textarea");
const suggestConfirmation = document.querySelector(".suggest-confirmation");

if (suggestForm && suggestTextarea && suggestConfirmation) {
  suggestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = suggestTextarea.value.trim();
    if (!text) return;

    const suggestion = {
      text,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("localsOnlySuggestions") || "[]");
      existing.push(suggestion);
      localStorage.setItem("localsOnlySuggestions", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save suggestion to localStorage", err);
    }

    suggestTextarea.value = "";
    suggestConfirmation.textContent = "Thank you for the idea.";
    setTimeout(() => (suggestConfirmation.textContent = ""), 3000);
  });
}

// LAST UPDATED DATE
const lastUpdatedEl = document.getElementById("lastUpdated");
if (lastUpdatedEl) {
  const now = new Date();
  const formatted = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  lastUpdatedEl.textContent = formatted;
}

// SMOOTH SCROLL FOR [data-scroll-target]
const scrollLinks = document.querySelectorAll("[data-scroll-target]");

scrollLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("data-scroll-target");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// MULTIPLE SHOOTING STARS (NIGHT MODE ONLY)
const createShootingStar = () => {
  if (!body.classList.contains("theme-night")) return;

  const star = document.createElement("div");
  star.className = "shooting-star";
  // reuse your existing .shooting-star styles + @keyframes shoot
  const startTop = Math.random() * window.innerHeight * 0.4;
  const startLeft = Math.random() * window.innerWidth * 0.4;

  star.style.top = `${startTop}px`;
  star.style.left = `${startLeft}px`;
  star.style.position = "fixed";
  star.style.opacity = "0";

  document.body.appendChild(star);

  // trigger animation
  star.style.animation = "shoot 1.8s ease-out forwards";

  setTimeout(() => {
    star.remove();
  }, 2000);
};

const scheduleShootingStars = () => {
  const delay = 10000 + Math.random() * 20000; // 10–30s
  setTimeout(() => {
    if (body.classList.contains("theme-night")) {
      const count = 3 + Math.floor(Math.random() * 3); // 3–5
      for (let i = 0; i < count; i++) {
        setTimeout(createShootingStar, i * 300);
      }
    }
    scheduleShootingStars();
  }, delay);
};

window.addEventListener("load", () => {
  scheduleShootingStars();
});
