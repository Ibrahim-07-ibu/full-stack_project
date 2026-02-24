// --- HomeBuddy API Config v1.0.2 [RECOVERY MODE] ---
console.log("🚀 HB API Config Loaded - v1.0.2");
const API_BASE = (function () {
  const host = window.location.hostname;

  // Production (Vercel/Netlify)
  // When deployed, we use relative paths (/api/...)
  if (host.includes("vercel.app")) {
    return "";
  }

  // Local Development (localhost, 127.0.0.1, or opening as a file)
  // If host is empty, it means user is opening the file directly (file:///)
  if (host === "localhost" || host === "127.0.0.1" || host === "") {
    return "http://127.0.0.1:8000";
  }

  // Fallback for any other local network IP
  return "http://127.0.0.1:8000";
})();

window.API_BASE_URL = API_BASE;

window.setToken = (token, role = "user") => {
  if (!token) {
    console.error("[setToken] Called with empty/null token! Token will NOT be stored.");
    return;
  }
  localStorage.setItem("auth_token", token);
  localStorage.setItem("role", role);
  if (role === "provider") {
    localStorage.setItem("provider_token", token);
  } else {
    localStorage.setItem("user_token", token);
  }
  console.log("[setToken] ✅ Token saved. role=" + role + " auth_token=" + !!localStorage.getItem("auth_token"));
};

window.getToken = () => {
  const isProviderPath = window.location.pathname.includes("/provider/");
  // Attempt to find any valid token in storage
  const tokens = [
    localStorage.getItem("auth_token"),
    localStorage.getItem("user_token"),
    localStorage.getItem("provider_token")
  ];

  // Specific preference for provider paths
  if (isProviderPath) {
    const pToken = localStorage.getItem("provider_token");
    if (pToken) return pToken;
  }

  // Return the first available token
  return tokens.find(t => t !== null && t !== undefined && t !== "") || null;
};

window.removeToken = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_token");
  localStorage.removeItem("provider_token");
  localStorage.removeItem("role");
  localStorage.removeItem("admin_logged_in");
};

window.checkAuth = () => {
  if (!window.getToken()) {
    console.warn("No token found, redirecting to login");

    if (window.location.pathname.includes("/provider/")) {
      window.location.href = "../provider/provider-login.html"
        ;
    } else if (window.location.pathname.includes("/admin/")) {
      window.location.href = "../admin/admin-login.html"
        ;
    } else {
      window.location.href = "../user/login.html";
    }
  }
};

async function makeRequest(endpoint, options = {}) {
  // Ensure endpoint starts with / and API_BASE doesn't end with / to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  console.log(`[API Request] ${options.method || "GET"} ${url}`);

  const token = window.getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: headers,
    });

    if (!response.ok) {
      // Try to get detailed error info
      let errorData = "No error body";
      try {
        // Clone the response so we can read it without consuming the original
        const clone = response.clone();
        errorData = await clone.text();
        // Try to parse as JSON for a cleaner log if possible
        try {
          const json = JSON.parse(errorData);
          errorData = json;
        } catch (e) { }
      } catch (e) {
        errorData = "Failed to read error body";
      }

      console.group(`[API Error] ${response.status} ${response.statusText}`);
      console.error(`URL: ${url}`);
      if (typeof errorData === 'object') {
        console.error("Error Detail:", errorData);
        // Also log as string for easy copy-paste
        console.log("Error JSON:", JSON.stringify(errorData, null, 2));
      } else {
        console.error(`Response Body:`, errorData);
      }
      console.groupEnd();

      if (response.status === 401) {
        const errorDetail = errorData.detail || errorData;
        console.warn(`[AUTH FAIL] 401 Unauthorized for ${endpoint}. Detail:`, errorDetail);

        // Critical Logic: Only redirect if on a dashboard page or making a profile call
        const dashboardPaths = ["dashboard.html", "profile.html", "my-bookings.html", "provider-accepted.html"];
        const isProtectedPage = dashboardPaths.some(p => window.location.pathname.includes(p));
        const isAuthProfileCall = endpoint.includes("/api/auth/profile");

        if (isProtectedPage || isAuthProfileCall) {
          console.error("Critical auth failure on protected resource. Redirecting to login...");
          // window.removeToken(); // Keep the token for manual inspection in console if needed, but redirect to re-auth
          window.checkAuth();
        }
      }
    }

    return response;
  } catch (error) {
    console.error(`[Network Error] Request failed for ${url}:`, error);
    throw error;
  }
}

window.getServiceIcon = (serviceName) => {
  if (!serviceName) return "fa-wrench";
  const name = serviceName.toLowerCase();

  if (name.includes("house cleaning")) return "fa-broom";
  if (name.includes("deep cleaning")) return "fa-hands-bubbles";
  if (name.includes("cleaning")) return "fa-broom";
  if (name.includes("plumb")) return "fa-faucet-drip";
  if (name.includes("elect")) return "fa-bolt";
  if (name.includes("ac repair") || name.includes("air cond"))
    return "fa-snowflake";
  if (name.includes("carpentry") || name.includes("carpenter"))
    return "fa-hammer";
  if (name.includes("paint")) return "fa-paint-roller";
  if (name.includes("cook")) return "fa-utensils";
  if (name.includes("laundry") || name.includes("wash")) return "fa-shirt";
  if (name.includes("garden")) return "fa-seedling";
  if (name.includes("appliance")) return "fa-screwdriver-wrench";
  if (name.includes("window")) return "fa-window-maximize";
  if (name.includes("move") || name.includes("shift")) return "fa-truck-moving";
  if (name.includes("salon") || name.includes("beauty")) return "fa-scissors";
  if (name.includes("pest")) return "fa-bug";
  if (name.includes("car wash") || name.includes("vehicle")) return "fa-car";
  if (name.includes("pet")) return "fa-paw";
  if (name.includes("tutor") || name.includes("lesson"))
    return "fa-book-open-reader";
  if (name.includes("sofa") || name.includes("upholstery")) return "fa-couch";
  if (name.includes("purifier") || name.includes("ro service"))
    return "fa-droplet";
  if (name.includes("cctv") || name.includes("security")) return "fa-video";
  if (name.includes("smart home") || name.includes("automation"))
    return "fa-microchip";
  if (name.includes("interior") || name.includes("decor"))
    return "fa-pen-ruler";

  return "fa-wrench";
};

console.log("API Routing configured:", API_BASE || "(relative paths)");

// --- UI Feedback Components (Toasts, Modals, Validation) ---

// Auto-inject UI CSS
(function injectUIStyles() {
  if (!document.getElementById("hb-ui-styles")) {
    const link = document.createElement("link");
    link.id = "hb-ui-styles";
    link.rel = "stylesheet";
    // Try both relative and absolute paths for robustness
    const cssPath = window.location.pathname.includes("/html/")
      ? "../../css/ui-components.css"
      : "./Frontend/css/ui-components.css";
    link.href = cssPath;
    document.head.appendChild(link);
  }
})();

window.HB = {
  // Toast Notification
  showToast: (message, type = "success", duration = 3000) => {
    let container = document.querySelector(".hb-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "hb-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `hb-toast ${type}`;

    const icon =
      type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "fadeOut 0.5s ease-out forwards";
      setTimeout(() => toast.remove(), 500);
    }, duration);
  },

  // Confirmation Modal
  confirm: (title, message, onConfirm) => {
    const overlay = document.createElement("div");
    overlay.className = "hb-modal-overlay";

    overlay.innerHTML = `
            <div class="hb-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="hb-modal-actions">
                    <button class="hb-btn hb-btn-cancel">Cancel</button>
                    <button class="hb-btn hb-btn-confirm">Confirm</button>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector(".hb-btn-cancel");
    const confirmBtn = overlay.querySelector(".hb-btn-confirm");

    cancelBtn.onclick = () => overlay.remove();
    confirmBtn.onclick = () => {
      onConfirm();
      overlay.remove();
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  },

  // Info Modal (for displaying data)
  info: (title, htmlContent) => {
    const overlay = document.createElement("div");
    overlay.className = "hb-modal-overlay";

    overlay.innerHTML = `
            <div class="hb-modal info-modal">
                <h3>${title}</h3>
                <div class="hb-modal-body">
                    ${htmlContent}
                </div>
                <div class="hb-modal-actions">
                    <button class="hb-btn hb-btn-confirm">Close</button>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".hb-btn-confirm");
    closeBtn.onclick = () => overlay.remove();

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  },

  // Form Validation Helpers
  showError: (inputId, message) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.add("hb-input-error");

    const next = input.nextElementSibling;
    if (next && next.classList.contains("hb-error-message")) {
      next.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "hb-error-message";
    errorDiv.textContent = message;
    input.parentNode.insertBefore(errorDiv, input.nextSibling);

    // Clear error on input
    input.oninput = () => window.HB.clearError(inputId);
  },

  clearError: (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.remove("hb-input-error");
    const next = input.nextElementSibling;
    if (next && next.classList.contains("hb-error-message")) {
      next.remove();
    }
  },
};
