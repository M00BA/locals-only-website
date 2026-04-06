if (window.location.pathname.includes("login.html")) {
  console.log("Main script disabled on login page");
  return;
}



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

  if (logoImage) {
    logoImage.style.opacity = 0;
    setTimeout(() => {
      logoImage.style.opacity = 1;
    }, 200);
  }

  if (modeToggle) {
    modeToggle.textContent = theme === "theme-light" ? "Night mode" : "Light mode";
  }

  localStorage.setItem("theme", theme);
}

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    const newTheme = body.classList.contains("theme-night") ? "theme-light" : "theme-night";
    applyTheme(newTheme);
    spawnShootingStar();
  });
}

applyTheme(localStorage.getItem("theme") || "theme-night");

// -------------------------------------------------------------
// SHOOTING STARS (Random + triggered)
// -------------------------------------------------------------
function spawnShootingStar() {
  const star = document.querySelector(".shooting-star");
  if (!star) return;

  star.style.animation = "none";
  star.offsetHeight;
  star.style.animation = "shoot 1.4s ease-out";
}

function randomStars() {
  if (!body.classList.contains("theme-night")) return;

  const count = Math.floor(Math.random() * 4) + 3; // 3–6 stars
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnShootingStar(), Math.random() * 1200);
  }
}

function scheduleStars() {
  randomStars();
  const delay = Math.random() * 8000 + 6000; // 6–14 sec
  setTimeout(scheduleStars, delay);
}

scheduleStars();

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

    spawnShootingStar();
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

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// -------------------------------------------------------------
// SMOOTH SCROLL
// -------------------------------------------------------------
document.querySelectorAll("[data-scroll-target]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// -------------------------------------------------------------
// SESSION CHECK (Navbar text + My Meetups link)
// -------------------------------------------------------------
const myMeetupsLink = document.getElementById("myMeetupsLink");
const becomeLocalLink = document.querySelector('a[href="login.html"]');

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;

  if (!session) {
    // Listen for future auth changes (e.g. after magic link)
    supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) updateNavbar(newSession);
    });
    return;
  }

  updateNavbar(session);
}

function updateNavbar(session) {
  const username = session.user.user_metadata?.username || "Local";

  if (becomeLocalLink) {
    becomeLocalLink.textContent = `Signed in as ${username}`;
    becomeLocalLink.removeAttribute("href");
    becomeLocalLink.style.cursor = "default";
  }

  if (myMeetupsLink) {
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
    if (rsvpEventName) rsvpEventName.textContent = eventName;

    const { data } = await supabaseClient.auth.getSession();
    const session = data.session;

    if (!session) {
      alert("Please sign in first.");
      return;
    }

    if (rsvpEmail) rsvpEmail.value = session.user.email;
    if (rsvpUsername) rsvpUsername.value = session.user.user_metadata?.username || "Local";

    if (rsvpModal) {
      rsvpModal.style.display = "flex";
      spawnShootingStar();
    }
  });
});

if (closeRsvpModal && rsvpModal) {
  closeRsvpModal.addEventListener("click", () => {
    rsvpModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === rsvpModal) rsvpModal.style.display = "none";
  });
}

if (submitRsvp) {
  submitRsvp.addEventListener("click", async () => {
    const { data } = await supabaseClient.auth.getSession();
    const session = data.session;

    if (!session) {
      alert("Please sign in first.");
      return;
    }

    const { error } = await supabaseClient.from("rsvps").insert({
      user_id: session.user.id,
      email: session.user.email,
      username: session.user.user_metadata?.username || "Local",
      event_name: rsvpEventName ? rsvpEventName.textContent : ""
    });

    if (error) {
      alert("Error saving RSVP.");
    } else {
      alert("You're in!");
      if (rsvpModal) rsvpModal.style.display = "none";
      spawnShootingStar();
    }
  });
}
