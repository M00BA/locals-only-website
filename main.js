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
// Calendar Export Helper
// ===============================
function getCalendarLinks(eventTitle) {
  const title = encodeURIComponent(eventTitle);
  const details = encodeURIComponent("Cozy community meetup with Locals Only in Hamburg.");
  const location = encodeURIComponent("Hamburg, Germany");
  
  // Google Calendar link
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;

  // Apple / Outlook .ics file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:Cozy community meetup with Locals Only in Hamburg.
LOCATION:Hamburg, Germany
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const icsUrl = window.URL.createObjectURL(blob);

  return { googleUrl, icsUrl };
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
// BULLETPROOF 1-CLICK RSVP SYSTEM
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

  try {
    if (btn.classList.contains("cancel-btn")) {
      btn.textContent = "Canceling…";
      const { error } = await supabaseClient
        .from("rsvps")
        .delete()
        .eq("email", email)
        .eq("event_name", eventName);

      if (error) throw error;
      
      // Remove any active calendar export helper box on cancel
      const card = btn.closest(".event-card");
      const exportBox = card?.querySelector(".calendar-export-box");
      if (exportBox) exportBox.remove();

      showToast("RSVP canceled.");
    } else {
      btn.textContent = "Joining…";
      const { error } = await supabaseClient
        .from("rsvps")
        .insert([{ email, event_name: eventName, username }]);

      if (error && error.code !== "23505") {
        throw error;
      }
      showToast("You're in! 🎉");

      // Inject Calendar Export options directly onto the event card upon successful RSVP
      const card = btn.closest(".event-card");
      if (card && !card.querySelector(".calendar-export-box")) {
        const links = getCalendarLinks(eventName);
        const exportDiv = document.createElement("div");
        exportDiv.className = "calendar-export-box";
        exportDiv.style.cssText = "margin-top: 12px; font-size: 0.85rem; display: flex; gap: 10px; align-items: center; color: var(--text-muted);";
        exportDiv.innerHTML = `
          <span>Add to calendar:</span>
          <a href="${links.googleUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">Google</a>
          <span>•</span>
          <a href="${links.icsUrl}" download="${eventName.replace(/\s+/g, '_')}.ics" style="color: var(--accent); text-decoration: underline;">Apple / Outlook</a>
        `;
        card.appendChild(exportDiv);
      }
    }
  } catch (err) {
    console.error("RSVP error:", err);
    showToast("Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    await loadAttendingCounts();
    await updateRsvpButtons();
  }
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
    const card = btn.closest(".event-card");

    if (userEvents.includes(eventName)) {
      btn.textContent = "Cancel RSVP";
      btn.classList.add("cancel-btn");

      // If already RSVP'd on page load, render the calendar export links automatically
      if (card && !card.querySelector(".calendar-export-box")) {
        const links = getCalendarLinks(eventName);
        const exportDiv = document.createElement("div");
        exportDiv.className = "calendar-export-box";
        exportDiv.style.cssText = "margin-top: 12px; font-size: 0.85rem; display: flex; gap: 10px; align-items: center; color: var(--text-muted);";
        exportDiv.innerHTML = `
          <span>Add to calendar:</span>
          <a href="${links.googleUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">Google</a>
          <span>•</span>
          <a href="${links.icsUrl}" download="${eventName.replace(/\s+/g, '_')}.ics" style="color: var(--accent); text-decoration: underline;">Apple / Outlook</a>
        `;
        card.appendChild(exportDiv);
      }
    } else {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");

      // Clean up calendar links if not attending
      const exportBox = card?.querySelector(".calendar-export-box");
      if (exportBox) exportBox.remove();
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
      const links = getCalendarLinks(rsvp.event_name);
      const card = document.createElement("div");
      card.className = "event-card fade-in";
      card.innerHTML = `
        <span class="event-tag">Joined</span>
        <h3 class="event-title">${rsvp.event_name}</h3>
        <p class="event-description">You're signed up for this meetup.</p>
        <div style="margin-top: 12px; font-size: 0.85rem; display: flex; gap: 10px; align-items: center; color: var(--text-muted);">
          <span>Add to calendar:</span>
          <a href="${links.googleUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">Google</a>
          <span>•</span>
          <a href="${links.icsUrl}" download="${rsvp.event_name.replace(/\s+/g, '_')}.ics" style="color: var(--accent); text-decoration: underline;">Apple / Outlook</a>
        </div>
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
