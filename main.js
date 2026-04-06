// ===============================
// Supabase Initialization
// ===============================
const SUPABASE_URL = "https://wezzokxbwzocgeawzrsp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QiilYh9S-TYQzc6Lh1Ixxw_zFb8ZNtM";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ===============================
// Page Detection
// ===============================
const isLoginPage = window.location.pathname.includes("login.html");
const isSuggestPage = window.location.pathname.includes("suggest-event.html");
const isMyMeetupsPage = window.location.pathname.includes("my-meetups.html");

// ===============================
// Navbar Session Logic
// ===============================
supabaseClient.auth.getSession().then(({ data }) => {
  const session = data.session;
  const myMeetupsLink = document.getElementById("myMeetupsLink");
  const loginLink = document.querySelector('a[href="login.html"]');

  if (session && session.user) {
    const username = session.user.user_metadata?.username;

    // Show username instead of "Become a Local"
    if (loginLink && username) {
      loginLink.textContent = username;
      loginLink.href = "my-meetups.html";
    }

    // Show My Meetups link
    if (myMeetupsLink) {
      myMeetupsLink.style.display = "inline-block";
    }
  }
});

// ===============================
// Mobile Navigation Toggle
// ===============================
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// ===============================
// Fade‑In Animation
// ===============================
const fadeElements = document.querySelectorAll(".fade-in");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

fadeElements.forEach((el) => fadeObserver.observe(el));

// ===============================
// Ambient Shooting Stars (3–6 stars every 6–14 seconds)
// ===============================
function spawnShootingStar() {
  const star = document.createElement("div");
  star.classList.add("shooting-star");

  const startX = Math.random() * window.innerWidth * 0.4;
  const startY = Math.random() * window.innerHeight * 0.2;

  const duration = 0.9 + Math.random() * 0.6;

  star.style.left = `${startX}px`;
  star.style.top = `${startY}px`;
  star.style.animation = `shoot ${duration}s ease-out forwards`;

  document.body.appendChild(star);

  setTimeout(() => star.remove(), duration * 1000 + 200);
}

function ambientStarsLoop() {
  const count = 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    setTimeout(spawnShootingStar, i * 250);
  }

  const nextDelay = 6000 + Math.random() * 8000;
  setTimeout(ambientStarsLoop, nextDelay);
}

ambientStarsLoop();

// ===============================
// City Filters (Homepage Only)
// ===============================
const filterButtons = document.querySelectorAll(".city-filter-btn");
const eventCards = document.querySelectorAll(".event-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    eventCards.forEach((card) => {
      const city = card.dataset.city;
      card.style.display = filter === "all" || filter === city ? "block" : "none";
    });
  });
});

// ===============================
// RSVP Modal Logic (Homepage Only)
// ===============================
const rsvpModal = document.getElementById("rsvpModal");
const closeRsvpModal = document.getElementById("closeRsvpModal");
const submitRsvp = document.getElementById("submitRsvp");

if (rsvpModal && closeRsvpModal && submitRsvp) {
  const rsvpButtons = document.querySelectorAll(".event-rsvp-btn");
  const rsvpEventName = document.getElementById("rsvpEventName");
  const rsvpEmail = document.getElementById("rsvpEmail");
  const rsvpUsername = document.getElementById("rsvpUsername");

  rsvpButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const session = (await supabaseClient.auth.getSession()).data.session;

      if (!session || !session.user) {
        window.location.href = "login.html";
        return;
      }

      const username = session.user.user_metadata?.username;

      rsvpEventName.textContent = btn.dataset.event;
      rsvpEmail.value = session.user.email;
      rsvpUsername.value = username || "";

      rsvpModal.style.display = "flex";
    });
  });

  closeRsvpModal.addEventListener("click", () => {
    rsvpModal.style.display = "none";
  });

  submitRsvp.addEventListener("click", async () => {
    const eventName = rsvpEventName.textContent;
    const email = rsvpEmail.value;
    const username = rsvpUsername.value;

    const { error } = await supabaseClient.from("rsvps").insert([
      {
        event_name: eventName,
        email,
        username
      }
    ]);

    if (error) {
      alert("Error saving RSVP.");
    } else {
      alert("You're signed up!");
      rsvpModal.style.display = "none";
    }
  });
}
