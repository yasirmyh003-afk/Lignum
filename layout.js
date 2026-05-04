function getSidebar(activeKey = "") {
  return `
    <aside class="app-sidebar">
      <div class="sidebar-logo">
        <h1>Lignum Operations</h1>
        <p>Inventory & Release System</p>
      </div>

      <div class="sidebar-nav">
        <a href="dashboard.html" class="sidebar-link ${activeKey === "dashboard" ? "active" : ""}">
          <span class="sidebar-left"><span>📊</span><span>Dashboard</span></span>
        </a>

        <a href="inventory.html" class="sidebar-link ${activeKey === "inventory" ? "active" : ""}">
          <span class="sidebar-left"><span>📦</span><span>Inventory</span></span>
        </a>

        <a href="new-po.html" class="sidebar-link ${activeKey === "new-po" ? "active" : ""}">
          <span class="sidebar-left"><span>🛒</span><span>New Purchase Order</span></span>
        </a>
		
		<a href="reload.html" class="sidebar-link ${activeKey === "reload" ? "active" : ""}">
		  <span class="sidebar-left"><span>🔄</span><span>Reload</span></span>
		</a>
		
		<a href="truck-release.html" class="sidebar-link ${activeKey === "truck-release" ? "active" : ""}">
		  <span class="sidebar-left"><span>🚚</span><span>Truck Release</span></span>
		</a>

        <a href="matts.html" class="sidebar-link ${activeKey === "matts" ? "active" : ""}">
          <span class="sidebar-left"><span>🏭</span><span>Matt’s Inventory</span></span>
        </a>
		
		<a href="quality.html" class="sidebar-link ${activeKey === "quality" ? "active" : ""}">
		  <span class="sidebar-left"><span>✅</span><span>Quality Inventory</span></span>
		</a>
		
		<a href="quotation.html" class="sidebar-link ${activeKey === "quotation" ? "active" : ""}">
		  <span class="sidebar-left"><span>🧾</span><span>Quotation</span></span>
		</a>
		
		<a href="active-orders.html" class="sidebar-link ${activeKey === "active-orders" ? "active" : ""}">
		  <span class="sidebar-left"><span>📋</span><span>Active Orders</span></span>
		</a>

        <button class="sidebar-group-button" onclick="toggleSidebarGroup('logs-submenu')" type="button">
          <span class="sidebar-left"><span>🕘</span><span>Logs</span></span>
          <span>▾</span>
        </button>
        <div class="sidebar-submenu" id="logs-submenu">
		  <a href="truck-release-logs.html" class="sidebar-sublink ${activeKey === "truck-release-logs" ? "active" : ""}">Truck Release Logs</a>
          <a href="inv-logs.html" class="sidebar-sublink ${activeKey === "inv-logs" ? "active" : ""}">INV Logs</a>
          <a href="new-purchases-logs.html" class="sidebar-sublink ${activeKey === "new-purchases-logs" ? "active" : ""}">New Purchases Logs</a>
		  <a href="quotation-logs.html" class="sidebar-sublink ${activeKey === "quotation-logs" ? "active" : ""}">Quotation Logs</a>
		  <a href="reload-logs.html" class="sidebar-sublink ${activeKey === "reload-logs" ? "active" : ""}">Reload Logs</a>
        </div>

        <button class="sidebar-group-button" onclick="toggleSidebarGroup('config-submenu')" type="button">
          <span class="sidebar-left"><span>⚙️</span><span>Configuration</span></span>
          <span>▾</span>
        </button>
		
		<div class="sidebar-submenu" id="config-submenu">
		  <a href="dropdown-config.html" class="sidebar-sublink ${activeKey === "dropdown-config" ? "active" : ""}">Dropdown Master</a>
		  <a href="carrier.html" class="sidebar-sublink ${activeKey === "carrier" ? "active" : ""}">Carriers</a>
		  <a href="origin.html" class="sidebar-sublink ${activeKey === "origin" ? "active" : ""}">Origin</a>
		  <a href="customer.html" class="sidebar-sublink ${activeKey === "customer" ? "active" : ""}">Customers</a>
		</div>
		
		<a href="users.html" class="sidebar-link ${activeKey === "users" ? "active" : ""}">
          <span class="sidebar-left"><span>👨🏻‍💼</span><span>Users</span></span>
        </a>

		
      </div>

      <div class="sidebar-footer">
		
		<div class="user-card">
		  <div class="user-avatar" id="sidebar-user-avatar">U</div>
		  <div>
			<div class="user-name" id="sidebar-user-name">Loading...</div>
			<div class="user-role" id="sidebar-user-role">User</div>
		 </div>
		</div>
		
		<a href="#" onclick="logoutUser()" class="sidebar-link">
		  <span class="sidebar-left"><span>↪</span><span>Logout</span></span>
		</a>
		
      </div>
    </aside>
  `;
}

function loadSidebar(activeKey) {
  const mount = document.getElementById("sidebar-mount");
  if (!mount) {
    console.error("sidebar-mount not found");
    return;
  }
  mount.innerHTML = getSidebar(activeKey);
  loadSidebarUser();
  if (["new-purchases-logs", "quotation-logs", "truck-release-logs", "reload-logs","inv-logs"].includes(activeKey)) {
    const logs = document.getElementById("logs-submenu");
    if (logs) logs.classList.add("open");
  }
  
  
  if (["dropdown-config", "carrier", "origin", "customer"].includes(activeKey)) {
    const config = document.getElementById("config-submenu");
    if (config) config.classList.add("open");
  }
}

function toggleSidebarGroup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("open");
}

function openDrawer(drawerId, overlayId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  if (drawer) drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
}

function closeDrawer(drawerId, overlayId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

function showAppModal({ type = "success", title = "Done", message = "" }) {
  const existing = document.getElementById("app-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "app-modal-overlay";
  overlay.className = "app-modal-overlay open";

  const icon = type === "error" ? "✕" : "✓";
  const iconClass = type === "error" ? "error" : "success";

  overlay.innerHTML = `
    <div class="app-modal">
      <div class="app-modal-header">
        <div class="app-modal-icon ${iconClass}">${icon}</div>
        <div class="app-modal-title">${title}</div>
      </div>
      <div class="app-modal-body">
        ${message}
      </div>
      <div class="app-modal-footer">
        <button class="btn btn-primary" onclick="closeAppModal()">OK</button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeAppModal();
  });

  document.body.appendChild(overlay);
}

function closeAppModal() {
  const overlay = document.getElementById("app-modal-overlay");
  if (overlay) overlay.remove();
}

async function requireLogin() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session || !data.session.user) {
    window.location.href = "login.html";
    return null;
  }

  const email = data.session.user.email;

  const { data: appUser, error } = await supabaseClient
    .from("app_users")
    .select("*")
    .eq("email", email)
    .eq("status", "Active")
    .single();

  if (error || !appUser) {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "login.html";
    return null;
  }

  window.currentAppUser = appUser;
  return data.session.user;
}


async function logoutUser() {
  await supabaseClient.auth.signOut();

  localStorage.removeItem("lignum_access_token");
  localStorage.removeItem("lignum_refresh_token");
  localStorage.removeItem("lignum_user");

  window.location.href = "login.html";
}

async function getCurrentAppUser() {
  if (window.currentAppUser) return window.currentAppUser;

  const { data } = await supabaseClient.auth.getSession();
  const email = data?.session?.user?.email;

  if (!email) return null;

  const { data: appUser } = await supabaseClient
    .from("app_users")
    .select("*")
    .eq("email", email)
    .single();

  window.currentAppUser = appUser;
  return appUser;
}


async function loadSidebarUser() {
  const appUser = await getCurrentAppUser();

  if (!appUser) return;

  const nameEl = document.getElementById("sidebar-user-name");
  const roleEl = document.getElementById("sidebar-user-role");
  const avatarEl = document.getElementById("sidebar-user-avatar");

  if (nameEl) nameEl.textContent = appUser.full_name || appUser.email || "User";
  if (roleEl) roleEl.textContent = appUser.role || "User";

  if (avatarEl) {
    const name = appUser.full_name || appUser.email || "User";
    avatarEl.textContent = name
      .split(" ")
      .map(x => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }
}


async function getAuditUser() {
  const appUser = await getCurrentAppUser();

  return {
    name: appUser?.full_name || appUser?.email || "Unknown User",
    email: appUser?.email || ""
  };
}