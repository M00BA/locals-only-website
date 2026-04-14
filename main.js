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
// RSVP Modal
// ===============================
const rsvpModal = document.getElementById("rsvpModal");
const rsvpEventName = document.getElementById("rsvpEventName");
const rsvpEmail = document.getElementById("rsvpEmail");
const rsvpUsername = document.getElementById("rsvpUsername");
const closeRsvpModalBtn = document.getElementById("closeRsvpModal");
const submitRsvpBtn = document.getElementById("submitRsvp");

// ===============================
// RSVP + Cancel Logic (FINAL FIX)
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
    loadAttendingCounts();
    updateRsvpButtons();
  }
}

async function updateRsvpButtons() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  // Not logged in → redirect on click
  if (!session || !session.user) {
    document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.replaceWith(newBtn);
    });

    document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
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

  // Remove old listeners
  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn);
  });

  // Reattach correct behavior
  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    const eventName = btn.dataset.event;

    if (userEvents.includes(eventName)) {
      btn.textContent = "Cancel RSVP";
      btn.classList.add("cancel-btn");
      btn.addEventListener("click", () => cancelRsvp(eventName));
    } else {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");

      btn.addEventListener("click", async () => {
        const session = (await supabaseClient.auth.getSession()).data.session;

        if (!session || !session.user) {
          window.location.href = "login.html";
          return;
        }

        const username = session.user.user_metadata?.username;

        rsvpEventName.textContent = eventName;
        rsvpEmail.value = session.user.email;
        rsvpUsername.value = username || "";
        rsvpModal.style.display = "flex";
      });
    }
  });
}

// Close RSVP modal
if (closeRsvpModalBtn) {
  closeRsvpModalBtn.addEventListener("click", () => {
    rsvpModal.style.display = "none";
  });
}

// Submit RSVP
if (submitRsvpBtn) {
  submitRsvpBtn.addEventListener("click", async () => {
    const eventName = rsvpEventName.textContent;
    const email = rsvpEmail.value;
    const username = rsvpUsername.value;

    const { error } = await supabaseClient.from("rsvps").insert([
      { event_name: eventName, email, username }
    ]);

    if (error) {
      showToast("Error saving RSVP.");
    } else {
      showToast("You're signed up!");
      rsvpModal.style.display = "none";
      loadAttendingCounts();
      updateRsvpButtons();
    }
  });
}

// ===============================
// Initialize RSVP
// ===============================
setTimeout(updateRsvpButtons, 300);

// ===============================
// My Meetups Page
// ===============================
if (isMyMeetupsPage) {
  supabaseClient.auth.getSession().then(async ({ data }) => {
    const session = data.session;

    if (!session || !session.user) {
      window.location.href = "login.html";
      return;
    }

    const container = document.getElementById("meetupsContainer");
    const emptyMessage = document.getElementById("emptyMessage");

    const { data: rsvps, error } = await supabaseClient
      .from("rsvps")
      .select("*")
      .eq("email", session.user.email);

    if (error) {
      container.innerHTML = "<p class='about-text'>Error loading your meetups.</p>";
      return;
    }

    if (!rsvps || rsvps.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    container.innerHTML = "";
    rsvps.forEach((rsvp) => {
      const card = document.createElement("div");
      card.className = "event-card fade-in";
      card.innerHTML = `
        <span class="event-tag">Joined</span>
        <h3 class="event-title">${rsvp.event_name}</h3>
        <p class="event-description">You're signed up for this meetup.</p>
      `;
      container.appendChild(card);
    });
  });
}

// ===============================
// Welcome Animation
// ===============================
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user) {
    const username = session.user.user_metadata?.username;
    const overlay = document.getElementById("welcomeOverlay");
    const msg = document.getElementById("welcomeMessage");

    if (overlay && msg) {
      msg.textContent = `Welcome back, ${username || "friend"}!`;
      overlay.style.display = "flex";

      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 600);
      }, 1800);
    }
  }
});

// ===============================
// Suggest Event Modal
// ===============================
const suggestModal = document.getElementById("suggestModal");
const closeSuggestModalBtn = document.getElementById("closeSuggestModal");

async function openSuggestModal() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("suggestEmail").value = session.user.email;
  suggestModal.style.display = "flex";
}

// Open Suggest buttons
document.querySelectorAll("#openSuggest").forEach((el) => {
  el.addEventListener("click", openSuggestModal);
});

// FAB
const fabSuggest = document.getElementById("fabSuggest");
if (fabSuggest) fabSuggest.addEventListener("click", openSuggestModal);

// Close Suggest modal
if (closeSuggestModalBtn) {
  closeSuggestModalBtn.addEventListener("click", () => {
    suggestModal.style.display = "none";
  });
}

// ===============================
// Submit Suggestion (Supabase Only)
// ===============================
const submitSuggestion = document.getElementById("submitSuggestion");

if (submitSuggestion) {
  submitSuggestion.addEventListener("click", async () => {
    const name = document.getElementById("suggestName")?.value.trim();
    const email = document.getElementById("suggestEmail")?.value.trim();
    const title = document.getElementById("suggestTitle")?.value.trim();
    const description = document.getElementById("suggestDescription")?.value.trim();

    if (!name || !email || !title || !description) {
      showToast("Please fill out all fields.");
      return;
    }

    const { error } = await supabaseClient
      .from("suggestions")
      .insert([{ name, email, title, description }]);

    if (error) {
      showToast("Error saving suggestion.");
    } else {
      showToast("Suggestion saved!");
      suggestModal.style.display = "none";
    }
  });
}

// ===============================
// Close modal on backdrop
// ===============================
[rsvpModal, suggestModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
