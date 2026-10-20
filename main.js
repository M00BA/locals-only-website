// ===============================
// Supabase Initialization
// ===============================
const SUPABASE_URL = "https://wezzokxbwzocgeawzrsp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlenpva3hid3pvY2dlYXd6cnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTA1NTIsImV4cCI6MjA5MDg4NjU1Mn0.wzKk6-EAgCjJIkiGTpM0G44veLaNTxmtNd-GnHEO61s";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ===============================
// Page Detection
// ===============================
const isLoginPage = window.location.pathname.includes("login.html");
const isMyMeetupsPage = window.location.pathname.includes("my-meetups.html");

// ===============================
// DOM Refs
// ===============================
const suggestModal = document.getElementById("suggestModal");
const closeSuggestModalBtn = document.getElementById("closeSuggestModal");
const fabSuggest = document.getElementById("fabSuggest");

// ===============================
// Navbar Update
// ===============================
function updateNavbar(session) {
  const myMeetupsLink = document.getElementById("myMeetupsLink");
  const loginLink = document.getElementById("loginLink");
  const userDropdown = document.getElementById("userDropdown");
  const navbarUsername = document.getElementById("navbarUsername");

  if (loginLink) loginLink.style.display = "inline-block";
  if (userDropdown) userDropdown.style.display = "none";
  if (myMeetupsLink) myMeetupsLink.style.display = "none";

  document.querySelectorAll(".main-nav .openSuggest").forEach(el => {
    el.style.display = "inline-block";
  });

  if (!session || !session.user) return;

  const username = session.user.user_metadata?.username;

  if (loginLink) loginLink.style.display = "none";
  if (userDropdown) userDropdown.style.display = "inline-block";
  if (navbarUsername) navbarUsername.textContent = username || "User";
  if (myMeetupsLink) myMeetupsLink.style.display = "inline-block";

  document.querySelectorAll(".main-nav .openSuggest").forEach(el => {
    el.style.display = "none";
  });
}

// ===============================
// SESSION INIT (No forced redirects)
// ===============================
(async () => {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) console.warn("Session error:", error.message);

  updateNavbar(data?.session ?? null);

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const { error: exchErr } = await supabaseClient.auth.exchangeCodeForSession(
      window.location.href
    );
    if (exchErr) {
      console.warn("Code exchange error:", exchErr.message);
    } else {
      window.history.replaceState({}, document.title, "/");
      const { data: fresh } = await supabaseClient.auth.getSession();
      updateNavbar(fresh?.session ?? null);
    }
  }

  if (window.location.hash.includes("access_token")) {
    window.history.replaceState({}, document.title, "/");
  }
})();

supabaseClient.auth.onAuthStateChange((event, session) => {
  updateNavbar(session);
});

// ===============================
// Dropdown Toggle
// ===============================
const userDropdownButton = document.getElementById("userDropdownButton");
const userDropdownMenu = document.getElementById("userDropdownMenu");

if (userDropdownButton && userDropdownMenu) {
  userDropdownButton.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdownMenu.style.display =
      userDropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (
      !userDropdownButton.contains(e.target) &&
      !userDropdownMenu.contains(e.target)
    ) {
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
  }, 2500);
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
// 1-CLICK INSTANT RSVP SYSTEM
// ===============================
async function handleRsvpClick(eventName, btn) {
  const session = (await supabaseClient.auth.getSession()).data.session;
  
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const email = session.user.email;
  const username = session.user.user_metadata?.username || "Local";

  btn.disabled = true;

  if (btn.classList.contains("cancel-btn")) {
    btn.textContent = "Canceling…";
    const { error } = await supabaseClient
      .from("rsvps")
      .delete()
      .eq("email", email)
      .eq("event_name", eventName);

    if (error) {
      showToast("Could not cancel. Try again.");
    } else {
      showToast("RSVP canceled.");
    }
  } else {
    btn.textContent = "Joining…";
    const { error } = await supabaseClient.from("rsvps").upsert(
      { email, event_name: eventName, username },
      { onConflict: "email,event_name" }
    );

    if (error) {
      showToast("Something went wrong. Please try again.");
    } else {
      showToast("You're in! 🎉");
    }
  }

  btn.disabled = false;
  await loadAttendingCounts();
  await updateRsvpButtons();
}

async function updateRsvpButtons() {
  const session = (await supabaseClient.auth.getSession()).data.session;
  const buttons = document.querySelectorAll(".event-rsvp-btn");

  if (!session) {
    buttons.forEach((btn) => {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");
      btn.onclick = () => { window.location.href = "login.html"; };
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
      btn.classList.add("cancel-btn");
    } else {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");
    }

    btn.onclick = () => handleRsvpClick(eventName, btn);
  });
}

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

    const { data: rsvps } = await supabaseClient
      .from("rsvps")
      .select("*")
      .eq("email", session.user.email);

    if (!rsvps || rsvps.length === 0) {
      if (emptyMessage) emptyMessage.style.display = "block";
      return;
    }

    if (!container) return;

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
      fadeObserver.observe(card);
    });
  });
}

// ===============================
// Suggest Event Modal
// ===============================
async function openSuggestModal() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const emailInput = document.getElementById("suggestEmail");
  if (emailInput) emailInput.value = session.user.email;

  const nameInput = document.getElementById("suggestName");
  if (nameInput && !nameInput.value) {
    nameInput.value = session.user.user_metadata?.username || "";
  }

  if (suggestModal) suggestModal.style.display = "flex";
}

document.querySelectorAll(".openSuggest").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openSuggestModal();
  });
});

if (fabSuggest) {
  fabSuggest.addEventListener("click", openSuggestModal);
}

if (closeSuggestModalBtn && suggestModal) {
  closeSuggestModalBtn.addEventListener("click", () => {
    suggestModal.style.display = "none";
  });
}

// ===============================
// Submit Suggestion
// ===============================
const submitSuggestion = document.getElementById("submitSuggestion");

if (submitSuggestion && suggestModal) {
  submitSuggestion.addEventListener("click", async () => {
    const username    = document.getElementById("suggestName")?.value.trim();
    const email       = document.getElementById("suggestEmail")?.value.trim();
    const title       = document.getElementById("suggestTitle")?.value.trim();
    const description = document.getElementById("suggestDescription")?.value.trim();

    if (!username || !email || !title || !description) {
      showToast("Please fill out all fields.");
      return;
    }

    submitSuggestion.textContent = "Sending…";
    submitSuggestion.disabled = true;

    const { error } = await supabaseClient.from("suggestions").insert({
      email,
      username,
      title,
      description,
      city: "Hamburg"
    });

    submitSuggestion.textContent = "Send Suggestion";
    submitSuggestion.disabled = false;

    if (error) {
      showToast("Error sending suggestion. Please try again.");
    } else {
      showToast("Suggestion sent! Thank you ✨");
      suggestModal.style.display = "none";

      ["suggestName", "suggestTitle", "suggestDescription"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    }
  });
}

[suggestModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
