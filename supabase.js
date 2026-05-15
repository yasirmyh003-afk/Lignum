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
   AUTH HELPERS
========================================================= */

function getLoginUrl() {
  return `${window.location.origin}/login.html`;
}

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

  const { data, error } = await supabaseClient
    .from("app_users")
    .select("*")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("getCurrentAppUser error:", error);
    return null;
  }

  return data || null;
}

async function requireLogin() {
  const user = await getCurrentSessionUser();

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const appUser = await getCurrentAppUser();

  /*
    Important:
    If app user is missing or inactive,
    immediately sign out and block access.
  */
  if (!appUser || appUser.status !== "Active") {
    await supabaseClient.auth.signOut();

    alert("Your account is inactive. Please contact an administrator.");
    window.location.href = getLoginUrl();

    return null;
  }

  return appUser;
}

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

/* =========================================================
   OPTIONAL LOGOUT HELPER
========================================================= */

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = getLoginUrl();
}
