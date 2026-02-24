document.addEventListener("DOMContentLoaded", async () => {
  // --- Auth Check ---
  const currentToken = window.getToken();
  console.log("[Dashboard] Page loaded. Token check:", {
    auth_token: !!localStorage.getItem("auth_token"),
    user_token: !!localStorage.getItem("user_token"),
    role: localStorage.getItem("role"),
    path: window.location.pathname,
    token_found: !!currentToken
  });

  if (!currentToken) {
    console.warn("[Dashboard] No auth token found. Redirecting to login.");
    window.location.href = "../user/login.html";
    return;
  }

  const userId = localStorage.getItem("user_id");
  const welcomeName = document.getElementById("welcome-name");
  const savedName = localStorage.getItem("user_name") || localStorage.getItem("name");

  // Immediately show the cached name from login
  if (savedName && welcomeName) {
    welcomeName.textContent = savedName;
  }

  // Attempt to sync profile from server — but ONLY update the name,
  // do NOT redirect on failure (the token check above is the only gate).
  try {
    const response = await makeRequest(`/api/auth/profile`);
    if (response.ok) {
      const user = await response.json();
      if (welcomeName && user.name) {
        welcomeName.textContent = user.name;
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("name", user.name);
      }
    } else {
      console.warn("[Dashboard] Profile sync failed (status:", response.status, "). Using cached name.");
    }
  } catch (error) {
    console.warn("[Dashboard] Profile sync error:", error.message, "Using cached name.");
  }

  const activityContainer = document.querySelector(".activity-list");
  if (!activityContainer) return;

  try {
    const bookingsResponse = await makeRequest(`/api/bookings/my`);
    if (bookingsResponse.ok) {
      const bookings = await bookingsResponse.json();
      bookings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00:00"}`);
        const dateB = new Date(`${b.date}T${b.time || "00:00:00"}`);
        return dateB - dateA;
      });
      const recentBookings = bookings.slice(0, 2);
      if (recentBookings.length > 0) {
        activityContainer.innerHTML = "";
        recentBookings.forEach((booking) => {
          const activityItem = document.createElement("div");
          activityItem.className = "activity-item";
          const icon = window.getServiceIcon(booking.service_name);
          const statusLabels = {
            pending: "Pending",
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
          };
          activityItem.innerHTML = `
            <div class="activity-icon">
              <i class="fa-solid ${icon}"></i>
            </div>
            <div class="activity-details">
              <h4>${booking.service_name}</h4>
              <p>${booking.status === "completed" ? "Completed on" : "Scheduled for"} ${booking.date}</p>
            </div>
            <span class="status ${booking.status}">${statusLabels[booking.status] || booking.status}</span>
          `;
          activityContainer.appendChild(activityItem);
        });
      } else {
        activityContainer.innerHTML = '<p class="no-activity">No recent activity found.</p>';
      }
    }
  } catch (error) {
    console.warn("[Dashboard] Bookings fetch error:", error.message);
  }

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.removeToken();
      window.location.href = "/html/user/login.html";
    });
  }
});
