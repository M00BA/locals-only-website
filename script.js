console.log("SCRIPT LOADED!");

// -------------------------------------------------------------
// SUPABASE INIT
// -------------------------------------------------------------
const SUPABASE_URL = "https://wezzokxbwzocgeawzrsp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QiilYh9S-TYQzc6Lh1Ixxw_zFb8ZNtM";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// -------------------------------------------------------------
// THEME TOGGLE (Smooth transitions + smooth logo fade)
// -------------------------------------------------------------
const modeToggle = document.getElementById("modeToggle");
const body = document.body;
const logoImage = document.querySelector(".logo-image");

function applyTheme(theme) {
  body.classList.remove("theme-light", "theme-night");
  body.classList.add(theme);

  // Smooth logo fade
  logoImage.style.opacity = 0;
  setTimeout(() => {
    logoImage.style.opacity = 1;
  }, 200);

  modeToggle.textContent = theme === "theme-light" ? "Night mode" : "Light mode";
  localStorage.setItem("theme", theme);
}

modeToggle.addEventListener("click", () => {
  const newTheme = body.classList.contains("theme-night") ? "theme-light" : "theme-night";
  applyTheme(newTheme);
  spawnShootingStar(); // Trigger star on theme change
});

// Load saved theme
applyTheme(localStorage.getItem("theme") || "theme-night");

// -------------------------------------------------------------
// SHOOTING STARS (Random + triggered)
// -------------------------------------------------------------
function spawnShootingStar() {
  const star = document.querySelector(".shooting-star");
  if (!star) return;

  star.style.animation = "none";
  star.offsetHeight; // force reflow
  star.style.animation = "shoot 1.4s ease-out";
}

// Random stars every 6–12 seconds
setInterval(() => {
  if (body.classList.contains("theme-night")) {
    spawnShootingStar();
  }
}, Math.random() * 6000 + 6000);

// -------------------------------------------------------------
// CITY FILTERS
// -------------------------------------------------------------
document.querySelectorAll(".city-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    document.querySelectorAll(".city-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".event-card").forEach(card => {
      if (filter === "all" || card.dataset.city === filter) {
        card.style.display = "block";
        setTimeout(() => card.classList.add("visible"), 10);
      } else {
        card.style.display = "none";
      }
    });

    spawnShootingStar(); // Trigger star on filter change
  });
});

// -------------------------------------------------------------
// FADE-IN ANIMATIONS
// -------------------------------------------------------------
const fadeEls = document.querySelectorAll(".fade-in");

function revealOnScroll() {
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// -------------------------------------------------------------
// MOBILE NAV
// -------------------------------------------------------------
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

navToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

// -------------------------------------------------------------
// SMOOTH SCROLL
// -------------------------------------------------------------
document.querySelectorAll("[data-scroll-target]").forEach(link => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// -------------------------------------------------------------
// AUTH MODAL
// -------------------------------------------------------------
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authButton = document.getElementById("authButton");
const sendMagicLink = document.getElementById("sendMagicLink");
const authEmail = document.getElementById("authEmail");
const myMeetupsLink = document.getElementById("myMeetupsLink");

authButton.addEventListener("click", (e) => {
  e.preventDefault();
  authModal.style.display = "flex";
  spawnShootingStar();
});

closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
});

// Send magic link
sendMagicLink.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  if (!email) return alert("Please enter an email.");

  const { error } = await supabaseClient.auth.signInWithOtp({ email });

  if (error) {
    alert("Error sending magic link.");
  } else {
    alert("Magic link sent! Check your inbox.");
    authModal.style.display = "none";
  }
});

// Check session
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  if (session) {
    const username = session.user.user_metadata.username || "Local";
    authButton.textContent = `Signed in as ${username}`;
    myMeetupsLink.style.display = "inline-block";
  }
}

checkSession();

// -------------------------------------------------------------
// RSVP MODAL
// -------------------------------------------------------------
const rsvpModal = document.getElementById("rsvpModal");
const closeRsvpModal = document.getElementById("closeRsvpModal");
const rsvpEventName = document.getElementById("rsvpEventName");
const rsvpEmail = document.getElementById("rsvpEmail");
const rsvpUsername = document.getElementById("rsvpUsername");
const submitRsvp = document.getElementById("submitRsvp");

document.querySelectorAll(".event-rsvp-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const eventName = btn.dataset.event;
    rsvpEventName.textContent = eventName;

    const { data } = await supabaseClient.auth.getSession();
    const session = data.session;

    if (!session) {
      alert("Please sign in first.");
      return;
    }

    rsvpEmail.value = session.user.email;
    rsvpUsername.value = session.user.user_metadata.username || "Local";

    rsvpModal.style.display = "flex";
    spawnShootingStar();
  });
});

closeRsvpModal.addEventListener("click", () => {
  rsvpModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === rsvpModal) rsvpModal.style.display = "none";
});

// Submit RSVP
submitRsvp.addEventListener("click", async () => {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  const { error } = await supabaseClient.from("rsvps").insert({
    user_id: session.user.id,
    email: session.user.email,
    username: session.user.user_metadata.username || "Local",
    event_name: rsvpEventName.textContent
  });

  if (error) {
    alert("Error saving RSVP.");
  } else {
    alert("You're in!");
    rsvpModal.style.display = "none";
    spawnShootingStar();
  }
});
