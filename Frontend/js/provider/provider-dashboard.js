document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
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
                \u003cdiv class="order-header"\u003e
                  \u003cspan class="order-id"\u003eOrder #${booking.id}\u003c/span\u003e
                  \u003cspan class="order-status status-new"\u003eRequest\u003c/span\u003e
                \u003c/div\u003e
                \u003cdiv class="order-details"\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eService\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-solid fa-bell-concierge"\u003e\u003c/i\u003e ${booking.service_name}\u003c/span\u003e
                  \u003c/div\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eCustomer\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-solid fa-user"\u003e\u003c/i\u003e ${booking.user_name || "Unknown"}\u003c/span\u003e
                  \u003c/div\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eMobile\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-solid fa-phone"\u003e\u003c/i\u003e ${booking.user_phone || "N/A"}\u003c/span\u003e
                  \u003c/div\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eDate \u0026 Time\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-regular fa-calendar"\u003e\u003c/i\u003e ${booking.date} - \u003ci class="fa-regular fa-clock"\u003e\u003c/i\u003e ${booking.time}\u003c/span\u003e
                  \u003c/div\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eInstructions\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-solid fa-circle-info"\u003e\u003c/i\u003e ${booking.instructions || "No special instructions"}\u003c/span\u003e
                  \u003c/div\u003e
                  \u003cdiv class="order-detail"\u003e
                    \u003cspan class="detail-label"\u003eAddress\u003c/span\u003e
                    \u003cspan class="detail-value"\u003e\u003ci class="fa-solid fa-location-dot"\u003e\u003c/i\u003e ${booking.address}, ${booking.city} - ${booking.pincode}\u003c/span\u003e
                  \u003c/div\u003e
                \u003c/div\u003e
                \u003cdiv class="order-actions"\u003e
                    \u003cbutton class="btn-accept" onclick="acceptBooking(${booking.id})"\u003e\u003ci class="fa-solid fa-check"\u003e\u003c/i\u003e Accept Order\u003c/button\u003e
                    \u003c!-- Reject not implemented in backend yet --\u003e
                \u003c/div\u003e
            `;
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
  if (!confirm("Are you sure you want to accept this booking?")) return;

  try {
    const response = await makeRequest(
      `/api/bookings/provider/${bookingId}/confirm`,
      {
        method: "PUT",
      },
    );

    if (response.ok) {
      alert("Booking confirmed!");
      await updateStatistics();
      location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("Error accepting:", error);
    alert("Failed to accept booking");
  }
}
