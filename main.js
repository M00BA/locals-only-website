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
// Safari Storage Test
// ===============================
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function storageBlocked() {
  try {
    localStorage.setItem("ls_test", "1");
    localStorage.removeItem("ls_test");
    return false;
  } catch (e) {
    return true;
  }
}

function showSafariPopup() {
  const popup = document.getElementById("safariStoragePopup");
  if (!popup) return;
  popup.classList.add("visible");
  popup.addEventListener("click", () => popup.classList.remove("visible"));
}

window.addEventListener("DOMContentLoaded", () => {
  if (isSafari() && storageBlocked()) showSafariPopup();
});

// ===============================
// Navbar Update
// ===============================
function updateNavbar(session) {
  const myMeetupsLink = document.getElementById("myMeetupsLink");
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const navbarUsername = document.getElementById("navbarUsername");

  if (!session || !session.user) return;

  const username = session.user.user_metadata?.username;

  if (loginLink) loginLink.style.display = "none";
  if (userDropdown) userDropdown.style.display = "inline-block";
  if (navbarUsername) navbarUsername.textContent = username || "User";
  if (myMeetupsLink) myMeetupsLink.style.display = "inline-block";
}

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

  // Close dropdown when clicking outside
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

  // Close nav when any link inside it is tapped
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
// Shooting Stars (capped at 2 on mobile)
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
// Toast Notification
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

    const { count, error } = await supabaseClient
      .from("rsvps")
      .select("*", { count: "exact", head: true })
      .eq("event_name", eventName);

    if (!error) el.textContent = `${count} attending`;
  }
}

if (!isMyMeetupsPage && !isLoginPage && !isSuggestPage) {
  loadAttendingCounts();
}

// ===============================
// RSVP Modal — all refs declared at top level
// ===============================
const rsvpModal = document.getElementById("rsvpModal");
const rsvpEventName = document.getElementById("rsvpEventName");
const rsvpEmail = document.getElementById("rsvpEmail");
const rsvpUsername = document.getElementById("rsvpUsername");
const closeRsvpModalBtn = document.getElementById("closeRsvpModal");
const submitRsvpBtn = document.getElementById("submitRsvp");

// Open modal
function openRsvpModal(eventName) {
  if (!rsvpModal || !rsvpEventName) return;
  rsvpEventName.textContent = eventName;
  rsvpModal.style.display = "flex";
}

// ===============================
// CANCEL RSVP
// ===============================
async function cancelRsvp(eventName) {
  const session = (await supabaseClient.auth.getSession()).data.session;
  if (!session) return;

  const { error } = await supabaseClient
    .from("rsvps")
    .delete()
    .eq("email", session.user.email)
    .eq("event_name", eventName);

  if (error) {
    showToast("Error canceling RSVP.");
  } else {
    showToast("RSVP canceled.");
    await loadAttendingCounts();
    await updateRsvpButtons();
  }
}

// ===============================
// UPDATE RSVP BUTTON STATES
// ===============================
async function updateRsvpButtons() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    const eventName = btn.dataset.event;

    // Not logged in → clicking sends to login
    if (!session) {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");
      btn.onclick = () => (window.location.href = "login.html");
      return;
    }

    // Logged in → check if user RSVP’d
    supabaseClient
      .from("rsvps")
      .select("event_name")
      .eq("email", session.user.email)
      .then(({ data }) => {
        const userEvents = data?.map((r) => r.event_name) || [];

        if (userEvents.includes(eventName)) {
          btn.textContent = "Cancel RSVP";
          btn.classList.add("cancel-btn");
          btn.onclick = () => cancelRsvp(eventName);
        } else {
          btn.textContent = "RSVP";
          btn.classList.remove("cancel-btn");
          btn.onclick = () => openRsvpModal(eventName);
        }
      });
  });
}

// ===============================
// CONFIRM RSVP
// ===============================
if (submitRsvpBtn) {
  submitRsvpBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // prevents weird reloads

    if (!rsvpEventName || !rsvpEmail || !rsvpUsername) return;

    const eventName = rsvpEventName.textContent;
    const email = rsvpEmail.value;
    const username = rsvpUsername.value;

    const { error } = await supabaseClient
      .from("rsvps")
      .insert([{ event_name: eventName, email, username }]);

    if (error) {
      console.error(error);
      showToast("Error saving RSVP.");
    } else {
      showToast("You're signed up!");
      rsvpModal.style.display = "none";
      await loadAttendingCounts();
      await updateRsvpButtons();
    }
  });
}

// ===============================
// Close any modal by clicking the dark backdrop
// ===============================
[rsvpModal, suggestModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
