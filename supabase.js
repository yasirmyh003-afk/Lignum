const SUPABASE_URL = "https://ivbpamfwiwtbxdwzdudq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YnBhbWZ3aXd0Ynhkd3pkdWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODAxMzAsImV4cCI6MjA5MTI1NjEzMH0.v1TI8iuzZUCd3PvQMKh56PN4NtJ9IItwgb6Y4_k0ZFk";






const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

/* =========================================================
   PAGE VISIBILITY DURING AUTH CHECK
========================================================= */

const PUBLIC_PAGES = [
  "login.html",
  "update-password.html"
];

function getCurrentPageName() {
  const path = window.location.pathname;
  return path.split("/").pop() || "index.html";
}

function isPublicPage() {
  return PUBLIC_PAGES.includes(getCurrentPageName());
}

function addAuthCheckingStyle() {
  if (isPublicPage()) return;

  document.documentElement.classList.add("auth-checking");

  if (!document.getElementById("auth-checking-style")) {
    const authStyle = document.createElement("style");
    authStyle.id = "auth-checking-style";
    authStyle.textContent = `
      html.auth-checking body {
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(authStyle);
  }
}

function showProtectedPage() {
  document.documentElement.classList.remove("auth-checking");
}

addAuthCheckingStyle();

function getBasePath() {
  const path = window.location.pathname;
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function getLoginUrl(reason = "") {
  const url = `${window.location.origin}${getBasePath()}login.html`;
  return reason ? `${url}?${reason}=1` : url;
}

/* =========================================================
   AUTH HELPERS
========================================================= */

async function getCurrentSessionUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}

async function getCurrentAppUser() {
  const user = await getCurrentSessionUser();

  if (!user?.email) {
    return null;
  }

  const normalizedEmail = String(user.email || "").trim().toLowerCase();

  const { data, error } = await supabaseClient
    .from("app_users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("getCurrentAppUser error:", error);
    return null;
  }

  return data || null;
}

async function requireLogin() {
  if (isPublicPage()) {
    showProtectedPage();
    return null;
  }

  const user = await getCurrentSessionUser();

  if (!user) {
    window.location.replace(getLoginUrl("loggedout"));
    return null;
  }

  const appUser = await getCurrentAppUser();

  if (!appUser || appUser.status !== "Active") {
    await supabaseClient.auth.signOut();

    const reason = !appUser ? "deleted" : "inactive";
    window.location.replace(getLoginUrl(reason));

    return null;
  }

  showProtectedPage();
  return appUser;
}

/*
  Safety fallback:
  If any page forgets to call requireLogin(), or page JS breaks before showing,
  this still checks auth and shows the page for active users.
*/
async function autoReleaseProtectedPage() {
  if (isPublicPage()) return;

  if (!document.documentElement.classList.contains("auth-checking")) return;

  const user = await getCurrentSessionUser();

  if (!user) {
    window.location.replace(getLoginUrl("loggedout"));
    return;
  }

  const appUser = await getCurrentAppUser();

  if (!appUser || appUser.status !== "Active") {
    await supabaseClient.auth.signOut();

    const reason = !appUser ? "deleted" : "inactive";
    window.location.replace(getLoginUrl(reason));
    return;
  }

  showProtectedPage();
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(autoReleaseProtectedPage, 300);
});

/* =========================================================
   AUDIT / LOGOUT HELPERS
========================================================= */

async function getAuditUser() {
  const appUser = await getCurrentAppUser();

  if (appUser) {
    return {
      name: appUser.full_name || appUser.email || "Unknown User",
      email: appUser.email || ""
    };
  }

  const user = await getCurrentSessionUser();

  return {
    name: user?.user_metadata?.full_name || user?.email || "Unknown User",
    email: user?.email || ""
  };
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = getLoginUrl();
}
