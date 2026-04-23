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

if (!isMyMeetupsPage && !isLoginPage) {
  loadAttendingCounts();
}

// ===============================
// RSVP Modal Elements
// ===============================
const rsvpModal = document.getElementById("rsvpModal");
const rsvpEventName = document.getElementById("rsvpEventName");
const rsvpEmail = document.getElementById("rsvpEmail");
const rsvpUsername = document.getElementById("rsvpUsername");
const closeRsvpModalBtn = document.getElementById("closeRsvpModal");
const submitRsvpBtn = document.getElementById("submitRsvp");

// ===============================
// Cancel RSVP
// ===============================
async function cancelRsvp(eventName, btn) {
  btn.disabled = true;

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

  btn.disabled = false;
}

// ===============================
// Update RSVP Buttons (FIXED)
// ===============================
async function updateRsvpButtons() {
  const session = (await supabaseClient.auth.getSession()).data.session;

  document.querySelectorAll(".event-rsvp-btn").forEach((btn) => {
    const clone = btn.cloneNode(true);
    btn.replaceWith(clone);
  });

  const buttons = document.querySelectorAll(".event-rsvp-btn");

  if (!session || !session.user) {
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
      btn.classList.add("cancel-btn");

      btn.addEventListener("click", () => cancelRsvp(eventName, btn));
    } else {
      btn.textContent = "RSVP";
      btn.classList.remove("cancel-btn");

      btn.addEventListener("click", async () => {
        btn.disabled = true;

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

        btn.disabled = false;
      });
    }
  });
}

// ===============================
if (closeRsvpModalBtn) {
  closeRsvpModalBtn.addEventListener("click", () => {
    rsvpModal.style.display = "none";
  });
}

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

setTimeout(updateRsvpButtons, 300);

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

document.querySelectorAll(".openSuggest").forEach((el) => {
  el.addEventListener("click", openSuggestModal);
});

if (closeSuggestModalBtn) {
  closeSuggestModalBtn.addEventListener("click", () => {
    suggestModal.style.display = "none";
  });
}
