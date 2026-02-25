document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const providerId = localStorage.getItem("provider_id");
  if (!providerId) {
  }
  updateNavBar();
  updateStatistics();
  const container = document.getElementById("bookings-container");
  try {
    const response = await makeRequest(`/api/bookings/provider/pending`);
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    const bookings = await response.json();
    if (bookings.length === 0) {
      container.innerHTML = `
                <div class="no-bookings">
                    <p>No new requests at the moment.</p>
                </div>`;
      return;
    }
    container.innerHTML = "";

    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "order-card";
      const serviceName = booking.service_id;
      card.innerHTML = `
                <div class="order-header">
                            <span class="order-id">Order #${booking.id}</span>
              <span class="order-status status-new">Request</span>
            </div>
            <div class="order-details">
              <div class="order-detail">
                <span class="detail-label">Service</span>
                <span class="detail-value"><i class="fa-solid ${window.getServiceIcon(booking.service_name)}"></i> ${booking.service_name}</span>
              </div>
              <div class="order-detail">
                <span class="detail-label">Customer</span>
                <span class="detail-value"><i class="fa-solid fa-user"></i> ${booking.user_name || "Unknown"}</span>
              </div>
              <div class="order-detail">
                <span class="detail-label">Mobile</span>
                <span class="detail-value"><i class="fa-solid fa-phone"></i> ${booking.user_phone || "N/A"}</span>
              </div>
              <div class="order-detail">
                <span class="detail-label">Date & Time</span>
                <span class="detail-value"><i class="fa-regular fa-calendar"></i> ${booking.date} - <i class="fa-regular fa-clock"></i> ${booking.time}</span>
              </div>
              <div class="order-detail">
                <span class="detail-label">Instructions</span>
                <span class="detail-value"><i class="fa-solid fa-circle-info"></i> ${booking.instructions || "No special instructions"}</span>
              </div>
                <div class="order-detail">
                  <span class="detail-label">Address</span>
                  <span class="detail-value"><i class="fa-solid fa-location-dot"></i> ${booking.address}, ${booking.city} - ${booking.pincode}</span>
                </div>
                ${booking.issue_image ? `
                <div class="order-detail issue-image-container" style="margin-top: 1rem;">
                  <span class="detail-label">Issue Image</span>
                  <div class="booking-img-wrapper" style="margin-top: 0.5rem; border-radius: 8px; overflow: hidden; max-width: 200px;">
                    <img src="${booking.issue_image}" alt="Issue" style="width: 100%; display: block; filter: brightness(0.9); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="window.open('${booking.issue_image}', '_blank')" />
                  </div>
                </div>
                ` : ''}
              </div>
              <div class="order-actions">
                <button class="btn-accept" onclick="acceptBooking(${booking.id})"><i class="fa-solid fa-check"></i> Accept Order</button>
                <button class="btn-reject" style="background: var(--danger-color); color: white;" onclick="rejectBooking(${booking.id})"><i class="fa-solid fa-xmark"></i> Reject Order</button>
              </div>`;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<div class="no-bookings"><p>Error loading requests.</p></div>`;
  }
});

async function updateStatistics() {
  try {
    const response = await makeRequest(`/api/bookings/provider/statistics`);
    if (response.ok) {
      const stats = await response.json();
      document.getElementById("stat-pending").textContent = stats.pending;
      document.getElementById("stat-accepted").textContent = stats.accepted;
      document.getElementById("stat-completed").textContent = stats.completed;
      document.getElementById("stat-rating").textContent = stats.rating;
      document.getElementById("stat-earnings").textContent =
        `₹${stats.earnings}`;
      document.getElementById("stat-completion-rate").textContent =
        `${stats.completion_rate}%`;
      const providerName = localStorage.getItem("provider_name");
      if (providerName) {
        document.getElementById("provider-name").textContent = providerName;
      }
    }
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

function updateNavBar() {
  const providerName = localStorage.getItem("provider_name");
  if (providerName) {
    const nameEl = document.getElementById("nav-provider-name");
    const avatarEl = document.getElementById("nav-provider-avatar");
    if (nameEl) nameEl.textContent = providerName;
    if (avatarEl) {
      const initials = providerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      avatarEl.textContent = initials;
    }
  }
}

async function acceptBooking(bookingId) {
  window.HB.confirm(
    "Accept Order",
    "Are you sure you want to accept this booking request?",
    async () => {
      try {
        const response = await makeRequest(
          `/api/bookings/provider/${bookingId}/confirm`,
          {
            method: "PUT",
          },
        );

        if (response.ok) {
          window.HB.showToast("Booking confirmed!");
          await updateStatistics();
          setTimeout(() => location.reload(), 1000);
        } else {
          const error = await response.json();
          window.HB.showToast(`Error: ${error.detail}`, "error");
        }
      } catch (error) {
        console.error("Error accepting:", error);
        window.HB.showToast("Failed to accept booking", "error");
      }
    },
  );
}
async function rejectBooking(bookingId) {
  window.HB.confirm(
    "Reject Order",
    "Are you sure you want to reject this booking request? This will remove it from your dashboard.",
    async () => {
      try {
        const response = await makeRequest(
          `/api/bookings/provider/${bookingId}/reject`,
          {
            method: "PUT",
          },
        );

        if (response.ok) {
          window.HB.showToast("Booking rejected", "info");
          await updateStatistics();
          setTimeout(() => location.reload(), 1000);
        } else {
          const error = await response.json();
          window.HB.showToast(`Error: ${error.detail}`, "error");
        }
      } catch (error) {
        console.error("Error rejecting:", error);
        window.HB.showToast("Failed to reject booking", "error");
      }
    },
  );
}
