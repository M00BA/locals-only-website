// Keys for localStorage
const THEME_KEY = "locals-only-theme";
const RSVP_KEY = "locals-only-rsvps";
const SUGGEST_KEY = "locals-only-suggestions";
const PAST_KEY = "locals-only-past-meetups";

// -------------------------------------------------------
// THEME HANDLING
// -------------------------------------------------------
function applyTheme(theme) {
  const body = document.body;

  if (theme === "night") {
    body.classList.remove("theme-light");
    body.classList.add("theme-night");
  } else {
    body.classList.remove("theme-night");
    body.classList.add("theme-light");
  }

  const toggle = document.getElementById("modeToggle");
  if (toggle) {
    toggle.textContent = body.classList.contains("theme-night")
      ? "Light mode"
      : "Night mode";
  }
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = stored || (prefersDark ? "night" : "light");
  applyTheme(initialTheme);
}

// -------------------------------------------------------
// SMOOTH SCROLL
// -------------------------------------------------------
function smoothScrollTo(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const headerOffset = 72;
  const rect = target.getBoundingClientRect();
  const offsetTop = rect.top + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetTop,
    behavior: "smooth"
  });
}

// -------------------------------------------------------
// CITY FILTERS
// -------------------------------------------------------
function filterEvents(filter) {
  const cards = document.querySelectorAll(".event-card");

  cards.forEach((card) => {
    const city = card.getAttribute("data-city");

    if (filter === "all" || !filter) {
      card.style.display = "";
    } else {
      card.style.display = city === filter ? "" : "none";
    }
  });
}

// -------------------------------------------------------
// RSVP MODAL
// -------------------------------------------------------
let rsvpOverlayEl = null;
let rsvpTitleEl = null;
let rsvpFormEl = null;
let rsvpSuccessEl = null;

function initRsvpModal() {
  rsvpOverlayEl = document.getElementById("rsvpOverlay");
  rsvpTitleEl = document.getElementById("rsvpEventTitle");
  rsvpFormEl = document.getElementById("rsvpForm");
  rsvpSuccessEl = document.getElementById("rsvpSuccess");

  const closeBtn = document.getElementById("rsvpClose");

  if (!rsvpOverlayEl || !rsvpFormEl) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeRsvpModal);
  }

  rsvpOverlayEl.addEventListener("click", (e) => {
    if (e.target === rsvpOverlayEl) {
      closeRsvpModal();
    }
  });

  rsvpFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    handleRsvpSubmit();
  });
}

function openRsvpModal(eventName) {
  if (!rsvpOverlayEl || !rsvpTitleEl || !rsvpFormEl) return;

  rsvpTitleEl.textContent = eventName;
  rsvpFormEl.reset();
  if (rsvpSuccessEl) rsvpSuccessEl.textContent = "";

  rsvpOverlayEl.classList.add("open");
  rsvpOverlayEl.setAttribute("aria-hidden", "false");
}

function closeRsvpModal() {
  if (!rsvpOverlayEl) return;
  rsvpOverlayEl.classList.remove("open");
  rsvpOverlayEl.setAttribute("aria-hidden", "true");
}

function handleRsvpSubmit() {
  const name = rsvpFormEl.querySelector("#rsvpName")?.value.trim() || "";
  const email = rsvpFormEl.querySelector("#rsvpEmail")?.value.trim() || "";
  const message = rsvpFormEl.querySelector("#rsvpMessage")?.value.trim() || "";
  const eventName = rsvpTitleEl ? rsvpTitleEl.textContent || "" : "";

  const existing = JSON.parse(localStorage.getItem(RSVP_KEY) || "[]");
  existing.push({
    event: eventName,
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(RSVP_KEY, JSON.stringify(existing));

  if (rsvpSuccessEl) {
    rsvpSuccessEl.textContent = "Thank you for your gentle RSVP.";
  }
}

// -------------------------------------------------------
// SUGGEST MEETUP FORM
// -------------------------------------------------------
function initSuggestForm() {
  const form = document.getElementById("suggestForm");
  const successEl = document.getElementById("suggestSuccess");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const idea = form.querySelector("#suggestIdea")?.value.trim() || "";
    const location = form.querySelector("#suggestLocation")?.value.trim() || "";
    const size = form.querySelector("#suggestSize")?.value.trim() || "";
    const email = form.querySelector("#suggestEmail")?.value.trim() || "";

    if (!idea || !location) {
      if (successEl) {
        successEl.textContent = "Please add at least an idea and a location.";
      }
      return;
    }

    const existing = JSON.parse(localStorage.getItem(SUGGEST_KEY) || "[]");
    existing.push({
      idea,
      location,
      size,
      email,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem(SUGGEST_KEY, JSON.stringify(existing));

    form.reset();
    if (successEl) {
      successEl.textContent = "Thank you for sharing a gentle meetup idea.";
    }
  });
}

// -------------------------------------------------------
// PAST MEETUPS (dynamic)
// -------------------------------------------------------
function renderPastMeetups() {
  const container = document.getElementById("pastMeetupsGrid");
  if (!container) return;

  const items = JSON.parse(localStorage.getItem(PAST_KEY) || "[]");

  container.innerHTML = "";

  if (!items.length) {
    const placeholders = [
      "First quiet picnic in Hamburg",
      "Board game evening in Lübeck",
      "Slow walk by the water"
    ];

    placeholders.forEach((text) => {
      const card = document.createElement("div");
      card.className = "past-card past-placeholder";
      card.textContent = text + " · coming soon.";
      container.appendChild(card);
    });

    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "past-card";

    const title = document.createElement("h3");
    title.style.margin = "0 0 4px";
    title.style.fontSize = "0.95rem";
    title.textContent = item.title || "Past meetup";

    const meta = document.createElement("p");
    meta.style.margin = "0 0 6px";
    meta.style.fontSize = "0.8rem";
    meta.style.color = "var(--text-muted)";
    meta.textContent = [item.date, item.city].filter(Boolean).join(" · ");

    const recap = document.createElement("p");
    recap.style.margin = "0";
    recap.style.fontSize = "0.85rem";
    recap.textContent = item.recap || "A gentle meetup with soft vibes.";

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(recap);

    container.appendChild(card);
  });
}

// Helper to manually add a past meetup (via console)
function addPastMeetup(meetup) {
  const existing = JSON.parse(localStorage.getItem(PAST_KEY) || "[]");
  existing.push({
    title: meetup.title || "Past meetup",
    date: meetup.date || "",
    city: meetup.city || "",
    recap: meetup.recap || "",
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(PAST_KEY, JSON.stringify(existing));
  renderPastMeetups();
}

// -------------------------------------------------------
// SHOOTING STAR
// -------------------------------------------------------
function startShootingStars() {
  const star = document.querySelector(".shooting-star");
  if (!star) return;

  function launch() {
    if (!document.body.classList.contains("theme-night")) {
      setTimeout(launch, 4000);
      return;
    }

    const delay = Math.random() * 20000 + 20000;

    setTimeout(() => {
      const startX = Math.random() * window.innerWidth * 0.6;
      const startY = Math.random() * window.innerHeight * 0.3;

      star.style.top = startY + "px";
      star.style.left = startX + "px";

      star.style.animation = "shoot 1.2s ease-out";

      setTimeout(() => {
        star.style.animation = "";
        launch();
      }, 1500);
    }, delay);
  }

  launch();
}

// -------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // Theme toggle
  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const isNight = document.body.classList.contains("theme-night");
      const nextTheme = isNight ? "light" : "night";
      applyTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }

  // Smooth scroll
  document.querySelectorAll("[data-scroll-target]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo(el.getAttribute("data-scroll-target"));
    });
  });

  // City filters
  const filterButtons = document.querySelectorAll(".city-filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterEvents(btn.getAttribute("data-filter"));
    });
  });

  // RSVP modal
  initRsvpModal();
  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openRsvpModal(btn.getAttribute("data-event"));
    });
  });

  // Suggest form
  initSuggestForm();

  // Past meetups
  renderPastMeetups();

  // Fade-in on scroll
  const fadeEls = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  fadeEls.forEach((el) => observer.observe(el));

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        mainNav.classList.remove("open");
      });
    });
  }

  // Last updated timestamp
  const lastUpdatedEl = document.getElementById("lastUpdated");
  if (lastUpdatedEl) {
    const now = new Date();
    lastUpdatedEl.textContent =
      "Last updated: " +
      now.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
  }

  // Shooting stars
  startShootingStars();
});
