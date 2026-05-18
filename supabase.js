const SUPABASE_URL = "https://ivbpamfwiwtbxdwzdudq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YnBhbWZ3aXd0Ynhkd3pkdWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODAxMzAsImV4cCI6MjA5MTI1NjEzMH0.v1TI8iuzZUCd3PvQMKh56PN4NtJ9IItwgb6Y4_k0ZFk";







const SUPABASE_URL = "https://ivbpamfwiwtbxdwzdudq.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_YOUR_EXISTING_ANON_KEY_HERE";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

const PUBLIC_PAGES = ["login.html", "update-password.html"];
let cachedSessionUser = null;
let cachedAppUser = null;

function getCurrentPageName() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function isPublicPage() {
  return PUBLIC_PAGES.includes(getCurrentPageName());
}

function getBasePath() {
  const path = window.location.pathname;
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function getLoginUrl(reason = "") {
  const url = `${window.location.origin}${getBasePath()}login.html`;
  return reason ? `${url}?${reason}=1` : url;
}

function hideProtectedPageUntilAuth() {
  if (isPublicPage()) return;

  document.documentElement.classList.add("auth-checking");

  if (!document.getElementById("auth-checking-style")) {
    const style = document.createElement("style");
    style.id = "auth-checking-style";
    style.textContent = `
      html.auth-checking body {
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }
}

function showProtectedPage() {
  document.documentElement.classList.remove("auth-checking");
}

hideProtectedPageUntilAuth();

async function getCurrentSessionUser() {
  if (cachedSessionUser) return cachedSessionUser;

  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data?.session?.user) {
    return null;
  }

  cachedSessionUser = data.session.user;
  return cachedSessionUser;
}

async function getCurrentAppUser(userArg = null) {
  if (cachedAppUser) return cachedAppUser;

  const user = userArg || await getCurrentSessionUser();

  if (!user?.email) return null;

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

  cachedAppUser = data || null;
  return cachedAppUser;
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

  const appUser = await getCurrentAppUser(user);

  if (!appUser || appUser.status !== "Active") {
    cachedSessionUser = null;
    cachedAppUser = null;

    await supabaseClient.auth.signOut();

    const reason = !appUser ? "deleted" : "inactive";
    window.location.replace(getLoginUrl(reason));
    return null;
  }

  showProtectedPage();
  return appUser;
}

async function getAuditUser() {
  const user = await getCurrentSessionUser();
  const appUser = await getCurrentAppUser(user);

  if (appUser) {
    return {
      name: appUser.full_name || appUser.email || "Unknown User",
      email: appUser.email || ""
    };
  }

  return {
    name: user?.user_metadata?.full_name || user?.email || "Unknown User",
    email: user?.email || ""
  };
}

async function logoutUser() {
  cachedSessionUser = null;
  cachedAppUser = null;

  await supabaseClient.auth.signOut();
  window.location.href = getLoginUrl();
}

/*
  Safety release:
  If a page forgets requireLogin(), active users will still see page quickly.
*/
document.addEventListener("DOMContentLoaded", function () {
  if (isPublicPage()) return;

  setTimeout(async function () {
    if (!document.documentElement.classList.contains("auth-checking")) return;

    const user = await getCurrentSessionUser();

    if (!user) {
      window.location.replace(getLoginUrl("loggedout"));
      return;
    }

    const appUser = await getCurrentAppUser(user);

    if (!appUser || appUser.status !== "Active") {
      await supabaseClient.auth.signOut();
      const reason = !appUser ? "deleted" : "inactive";
      window.location.replace(getLoginUrl(reason));
      return;
    }

    showProtectedPage();
  }, 80);
});
