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
const isMyMeetupsPage = window.location.pathname.includes("my-meetups.html");

// ===============================
// Navbar Update (FIXED CLEAN)
// ===============================
function updateNavbar(session) {
  const myMeetupsLink = document.getElementById("myMeetupsLink");
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const navbarUsername = document.getElementById("navbarUsername");

  // Default state (logged out)
  if (loginLink) loginLink.style.display = "inline-block";
  if (userDropdown) userDropdown.style.display = "none";
  if (myMeetupsLink) myMeetupsLink.style.display = "none";

  document.querySelectorAll(".main-nav .openSuggest").forEach(el => {
    el.style.display = "inline-block";
  });

  // If NOT logged in → stop here
  if (!session || !session.user) return;

  const username = session.user.user_metadata?.username;

  // Logged in state
  if (loginLink) loginLink.style.display = "none";
  if (userDropdown) userDropdown.style.display = "inline-block";
  if (navbarUsername) navbarUsername.textContent = username || "User";

  // 🔥 FIX: remove duplicate links
  if (myMeetupsLink) myMeetupsLink.style.display = "none";

  document.querySelectorAll(".main-nav .openSuggest").forEach(el => {
    el.style.display = "none";
  });
}

// Init navbar
setTimeout(() => {
  supabaseClient.auth.getSession().then(({ data }) => updateNavbar(data.session));
}, 200);

supabaseClient.auth.onAuthStateChange((event, session) => updateNavbar(session));

// ===============================
// Dropdown Toggle
// ===============================
const userDropdownButton = document.getElementById("userDropdownButton");
const userDropdownMenu = document.getElementById("userDropdownMenu");

if (userDropdownButton && userDropdownMenu) {
  userDropdownButton.addEventListener("click", () => {
    userDropdownMenu.style.display =
      userDropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!userDropdownButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
      userDropdownMenu.style.display = "none";
    }
  });
}

// ===============================
// Mobile Nav Toggle
// ===============================
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => {
      mainNav.classList.remove("open");
    });
  });
}

// ===============================
// Logout
// ===============================
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "/";
  });
}

// ===============================
// Fade-In Animation
// ===============================
const fadeElements = document.querySelectorAll(".fade-in");
const fadeObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    }),
  { threshold: 0.2 }
);
fadeElements.forEach((el) => fadeObserver.observe(el));

// ===============================
// Shooting Stars
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
  const isMobile = window.innerWidth < 720;
  const count = isMobile ? 1 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    setTimeout(spawnShootingStar, i * 250);
  }

  setTimeout(ambientStarsLoop, 6000 + Math.random() * 8000);
}
ambientStarsLoop();

// ===============================
// City Filters
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
// Toast
// ===============================
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ===============================
// Load Attendee Counts
// ===============================
async function loadAttendingCounts() {
  const countElements = document.querySelectorAll(".attending-count");

  for (const el of countElements) {
    const eventName = el.dataset.event;

    const { count } = await supabaseClient
      .from("rsvps")
      .select("*", { count: "exact", head: true })
      .eq("event_name", eventName);

    el.textContent = `${count || 0} attending`;
  }
}

if (!isMyMeetupsPage && !isLoginPage) {
  loadAttendingCounts();
}

// ===============================
// RSVP SYSTEM (UNCHANGED CORE)
// ===============================
async function cancelRsvp(eventName) {
  const session = (await supabaseClient.auth.getSession()).data.session;
  if (!session) return;

  await supabaseClient
    .from("rsvps")
    .delete()
    .eq("email", session.user.email)
    .eq("event_name", eventName);

  showToast("RSVP canceled.");
  loadAttendingCounts();
  updateRsvpButtons();
}

async function updateRsvpButtons() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    const clone = btn.cloneNode(true);
    btn.replaceWith(clone);
  });

  const buttons = document.querySelectorAll(".event-rsvp-btn");

  if (!session) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    });
    return;
  }

  const { data: rsvps } = await supabaseClient
    .from("rsvps")
    .select("event_name")
    .eq("email", session.user.email);

  const userEvents = rsvps?.map((r) => r.event_name) || [];

  buttons.forEach((btn) => {
    const eventName = btn.dataset.event;

    if (userEvents.includes(eventName)) {
      btn.textContent = "Cancel RSVP";
      btn.onclick = () => cancelRsvp(eventName);
    } else {
      btn.textContent = "RSVP";
      btn.onclick = () => {
        document.getElementById("rsvpEventName").textContent = eventName;
        document.getElementById("rsvpModal").style.display = "flex";
      };
    }
  });
}

setTimeout(updateRsvpButtons, 300);
