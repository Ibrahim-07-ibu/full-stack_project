document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const providerId = localStorage.getItem("provider_id");
  if (!providerId) {
  }
  updateNavBar();
  const container = document.getElementById("bookings-container");
  if (!container) return;
  try {
    const response = await makeRequest(`/api/bookings/provider/completed`);
    if (!response.ok) throw new Error("Failed to fetch completed bookings");
    const bookings = await response.json();
    updateSummary(bookings);
    if (bookings.length === 0) {
      container.innerHTML =
        '<div class="no-bookings"><p>No completed services yet.</p></div>';
      return;
    }
    container.innerHTML = "";
    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${booking.id}</span>
                    <span class="order-status status-completed">Completed</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span class="detail-label">Service</span>
                        <span class="detail-value"><i class="fa-solid ${window.getServiceIcon(booking.service_name)}"></i> ${booking.service_name}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Completed On</span>
                        <span class="detail-value">${booking.date}</span>
                    </div>
                </div>
            `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML =
      '<div class="no-bookings"><p>Error loading service history.</p></div>';
  }
});
function updateSummary(bookings) {
  const countEl = document.getElementById("summary-count");
  if (countEl) countEl.textContent = bookings.length;
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
