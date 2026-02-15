document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
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
      let reviewHtml = "";
      if (booking.review) {
        reviewHtml = `
                    <div class="order-review" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                        <div style="color: #ffcc00; font-size: 1.1rem; margin-bottom: 0.5rem;">
                            ${"★".repeat(booking.review.rating)}${"☆".repeat(5 - booking.review.rating)}
                        </div>
                        <p style="font-style: italic; color: #666; margin: 0;">"${booking.review.comment}"</p>
                    </div>
                `;
      }
      card.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${booking.id}</span>
                    <span class="order-status status-completed">Completed</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">${booking.service_name}</span>
                    </div>
                    <div class="order-detail">
                        <span class="detail-label">Completed On</span>
                        <span class="detail-value">${booking.date}</span>
                    </div>
                </div>
                ${reviewHtml}
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

  const ratingEl = document.getElementById("summary-rating");
  if (ratingEl) {
    const bookingsWithReviews = bookings.filter(
      (b) => b.review && b.review.rating,
    );
    if (bookingsWithReviews.length > 0) {
      const totalRating = bookingsWithReviews.reduce(
        (sum, b) => sum + b.review.rating,
        0,
      );
      const avgRating = totalRating / bookingsWithReviews.length;
      ratingEl.textContent = avgRating.toFixed(1);
    } else {
      ratingEl.textContent = "0.0";
    }
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
