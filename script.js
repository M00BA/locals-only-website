console.log("SCRIPT LOADED!");
// -----------------------------
// Supabase Init
// -----------------------------
const SUPABASE_URL = "https://wezzokxbwzocgeawzrsp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QiilYh9S-TYQzc6Lh1Ixxw_zFb8ZNtM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// -----------------------------
// AUTH MODAL
// -----------------------------
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authButton = document.getElementById("authButton");
const sendMagicLink = document.getElementById("sendMagicLink");
const authEmail = document.getElementById("authEmail");
const myMeetupsLink = document.getElementById("myMeetupsLink");

// Open modal
authButton.addEventListener("click", (e) => {
  e.preventDefault();
  authModal.style.display = "flex";
});

// Close modal
closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.style.display = "none";
  }
});

// Send magic link
sendMagicLink.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  if (!email) return alert("Please enter an email.");

  const { error } = await supabaseClient.auth.signInWithOtp({ email });

  if (error) {
    console.error(error);
    alert("Error sending magic link.");
  } else {
    alert("Magic link sent! Check your inbox.");
    authModal.style.display = "none";
  }
});

// Check session on load
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

// -----------------------------
// RSVP MODAL
// -----------------------------
const rsvpModal = document.getElementById("rsvpModal");
const closeRsvpModal = document.getElementById("closeRsvpModal");
const rsvpEventName = document.getElementById("rsvpEventName");
const rsvpEmail = document.getElementById("rsvpEmail");
const rsvpUsername = document.getElementById("rsvpUsername");
const submitRsvp = document.getElementById("submitRsvp");

// Open RSVP modal
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
  });
});

// Close RSVP modal
closeRsvpModal.addEventListener("click", () => {
  rsvpModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === rsvpModal) {
    rsvpModal.style.display = "none";
  }
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
    console.error(error);
    alert("Error saving RSVP.");
  } else {
    alert("You're in!");
    rsvpModal.style.display = "none";
  }
});
