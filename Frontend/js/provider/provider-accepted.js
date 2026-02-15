document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
  const providerId = localStorage.getItem("provider_id");
  if (!providerId) {
  }
  updateNavBar();
  const container = document.getElementById("bookings-container");
  if (!container) return;
  try {
    const response = await makeRequest(`/api/bookings/provider/confirmed`);
    if (!response.ok) throw new Error("Failed to fetch confirmed bookings");

    const bookings = await response.json();
    if (bookings.length === 0) {
      container.innerHTML =
        '<div class="no-bookings"><p>No accepted orders yet.</p></div>';
      return;
    }
    container.innerHTML = "";
    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${booking.id}</span>
                    <span class="order-status status-accepted">Accepted</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">${booking.service_name}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Customer</span>
                        <span class="detail-value">${booking.user_name}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Mobile</span>
                        <span class="detail-value">${booking.user_phone}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Date & Time</span>
                        <span class="detail-value">${booking.date} - ${booking.time}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">${booking.address}, ${booking.city} - ${booking.pincode}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-complete" onclick="completeBooking(${booking.id})"><i class="fa-solid fa-check-double"></i> Mark as Completed</button>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML =
      '<div class="no-bookings"><p>Error loading accepted orders.</p></div>';
  }
});
async function completeBooking(bookingId) {
  if (!confirm("Mark this service as completed?")) return;
  try {
    const response = await makeRequest(
      `/api/bookings/provider/${bookingId}/complete`,
      {
        method: "PUT",
      },
    );
    if (response.ok) {
      alert("Booking completed!");
      location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("Error completing:", error);
    alert("Failed to complete booking");
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
