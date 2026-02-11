document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("user_id");
  const welcomeName = document.getElementById("welcome-name");
  if (!userId) {
    window.location.href = "login.html";
    return;
  }
  const savedName = localStorage.getItem("user_name");
  if (savedName) {
    welcomeName.textContent = savedName;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        "X-User-ID": localStorage.getItem("user_id"),
      },
    });
    if (response.ok) {
      const user = await response.json();
      welcomeName.textContent = user.name;
      if (user.name !== savedName) {
        localStorage.setItem("user_name", user.name);
      }
    }
  } catch (error) {
    console.error("Error syncing dashboard profile:", error);
  }
  const activityContainer = document.querySelector(".activity-list");
  if (!activityContainer) return;
  try {
    const bookingsResponse = await fetch(
      `${API_BASE_URL}/api/bookings/my`,
      {
        headers: {
          "X-User-ID": localStorage.getItem("user_id"),
        },
      },
    );
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
          let icon = "fa-wrench";
          const name = (booking.service_name || "Service").toLowerCase();
          if (name.includes("clean")) icon = "fa-broom";
          else if (name.includes("plumb")) icon = "fa-faucet";
          else if (name.includes("elect")) icon = "fa-plug";
          else if (name.includes("garden")) icon = "fa-seedling";
          else if (name.includes("paint")) icon = "fa-paint-roller";
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
        activityContainer.innerHTML =
          '<p class="no-activity">No recent activity found.</p>';
      }
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error);
  }

  // Handle Logout
  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      localStorage.clear();
      // Let the natural href "login.html" handle the navigation
    });
  }
});
