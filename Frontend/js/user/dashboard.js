document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
  const userId = localStorage.getItem("user_id");
  const welcomeName = document.getElementById("welcome-name");
  const savedName = localStorage.getItem("user_name");

  if (savedName && welcomeName) {
    welcomeName.textContent = savedName;
  }
  try {
    const response = await makeRequest(`/api/auth/profile`);
    if (response.ok) {
      const user = await response.json();
      if (welcomeName) welcomeName.textContent = user.name;
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
        activityContainer.innerHTML =
          '<p class="no-activity">No recent activity found.</p>';
      }
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error);
  }

  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      window.removeToken();
      e.preventDefault();
      window.location.href = "login.html";
    });
  }
});
