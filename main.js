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
// NAVBAR UPDATE FUNCTION
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

// ===============================
// Navbar Session Logic (hydration delay)
// ===============================
setTimeout(() => {
  supabaseClient.auth.getSession().then(({ data }) => {
    updateNavbar(data.session);
  });
}, 200);

// ===============================
// Navbar Update on Auth Change (second hydration pass)
// ===============================
supabaseClient.auth.onAuthStateChange((event, session) => {
  updateNavbar(session);
});

// ===============================
// Username Dropdown Toggle
// ===============================
const userDropdownButton = document.getElementById("userDropdownButton");
const userDropdownMenu = document.getElementById("userDropdownMenu");

if (userDropdownButton && userDropdownMenu) {
  userDropdownButton.addEventListener("click", () => {
    userDropdownMenu.style.display =
      userDropdownMenu.style.display === "block" ? "none" : "block";
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
// Ambient Shooting Stars
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
// ⭐ NEW: Load Attendee Counts
// ===============================
async function loadAttendingCounts() {
  const countElements = document.querySelectorAll(".attending-count");

  for (const el of countElements) {
    const eventName = el.dataset.event;

    const { count, error } = await supabaseClient
      .from("rsvps")
      .select("*", { count: "exact", head: true })
      .eq("event_name", eventName);

    if (!error) {
      el.textContent = `${count} attending`;
    }
  }
}

// Run on homepage load
if (!isMyMeetupsPage && !isLoginPage && !isSuggestPage) {
  loadAttendingCounts();
}

// ===============================
// RSVP Modal Logic
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

      // ⭐ NEW: Update attendee count immediately
      loadAttendingCounts();
    }
  });
}

// ===============================
// My Meetups Page Logic
// ===============================
if (isMyMeetupsPage) {
  supabaseClient.auth.getSession().then(async ({ data }) => {
    const session = data.session;

    if (!session || !session.user) {
      window.location.href = "login.html";
      return;
    }

    const email = session.user.email;
    const container = document.getElementById("meetupsContainer");
    const emptyMessage = document.getElementById("emptyMessage");

    const { data: rsvps, error } = await supabaseClient
      .from("rsvps")
      .select("*")
      .eq("email", email);

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
// Welcome Animation (Homepage)
// ===============================
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user) {
    const username = session.user.user_metadata?.username;
    const overlay = document.getElementById("welcomeOverlay");
    const msg = document.getElementById("welcomeMessage");

    if (overlay && msg) {
      msg.textContent = `Welcome back, ${username}!`;
      overlay.style.display = "flex";

      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 600);
      }, 1800);
    }
  }
});
