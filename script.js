// Theme handling with localStorage
const THEME_KEY = "locals-only-theme";

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
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = stored || (prefersDark ? "night" : "light");
  applyTheme(initialTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  // Theme init
  initTheme();

  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const isNight = document.body.classList.contains("theme-night");
      const nextTheme = isNight ? "light" : "night";
      applyTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
    });
  }

  // Smooth scroll for nav and footer links
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

  document.querySelectorAll("[data-scroll-target]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.getAttribute("data-scroll-target");
      if (target) {
        smoothScrollTo(target);
      }
    });
  });

  // City filter from header nav
  document.querySelectorAll(".nav-link[data-city-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = btn.getAttribute("data-city-filter");
      filterEvents(city);
      smoothScrollTo("#upcoming");
    });
  });

  // City filter buttons in section
  const filterButtons = document.querySelectorAll(".city-filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      filterEvents(filter);
    });
  });

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

  // RSVP placeholder
  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const eventName = btn.getAttribute("data-event") || "this meetup";
      alert(
        "RSVP for " +
          eventName +
          " will be available soon. For now, you can note it and come by."
      );
    });
  });

  // Fade in on scroll
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
    {
      threshold: 0.15
    }
  );

  fadeEls.forEach((el) => observer.observe(el));

  // Mobile nav toggle
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

  // Start shooting stars
  startShootingStars();
});

// Shooting star system (night mode only)
function startShootingStars() {
  const star = document.querySelector(".shooting-star");
  if (!star) return;

  function launch() {
    // Only shoot in night mode
    if (!document.body.classList.contains("theme-night")) {
      setTimeout(launch, 4000);
      return;
    }

    const delay = Math.random() * 15000 + 8000; // 8–23 seconds

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
