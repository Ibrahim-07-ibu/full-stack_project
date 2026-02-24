document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
  try {
    const response = await makeRequest(`/api/bookings/my`);
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    const bookings = await response.json();
    window.allBookings = bookings;
    document.getElementById("pending").innerHTML = "";
    document.getElementById("confirmed").innerHTML = "";
    document.getElementById("completed").innerHTML = "";
    if (bookings.length === 0) {
      document.getElementById("pending").innerHTML =
        "<p>No bookings found.</p>";
      return;
    }
    console.log(`Loaded ${bookings.length} bookings`);

    window.bookingProviders = {};

    bookings.forEach((booking, index) => {
      let status = (booking.status || "pending").toLowerCase();
      if (status === "accepted") status = "confirmed";
      const container = document.getElementById(status);
      if (!container) {
        console.warn(
          `Unknown status '${status}' for booking #${booking.id}, skipping.`,
        );
        return;
      }

      if (booking.provider) {
        window.bookingProviders[booking.id] = booking.provider;
      }

      const card = document.createElement("div");
      card.className = `booking-card ${status}`;
      let actions = "";

      if (status === "pending") {
        actions = `<button class="btn-cancel" onclick="cancelBooking(${booking.id})">Cancel</button>`;
      } else if (status === "confirmed") {
        actions = `
                    <button class="btn-contact" onclick="window.showContact(${booking.id})">Contact</button>
                    <button class="btn-cancel" onclick="cancelBooking(${booking.id})">Cancel</button>
                `;
      } else if (status === "completed") {
        if (booking.review) {
          // Skip rated bookings on this page (they move to all-completed.html)
          return;
        } else {
          actions = `<a href="review.html?booking_id=${booking.id}&provider_id=${booking.provider_id}" class="a-review">Give Rating</a>`;
        }
      }
      const icon = window.getServiceIcon(booking.service_name);

      let ratingHtml = "";
      if (booking.review) {
        const stars = Array(5).fill(0).map((_, i) =>
          `<i class="fa-${i < booking.review.rating ? 'solid' : 'regular'} fa-star" style="color: #ffc107; font-size: 0.8rem;"></i>`
        ).join("");
        ratingHtml = `<div class="rating-display" style="margin-top: 0.5rem;">${stars}</div>`;
      }

      card.innerHTML = `
                <div class="booking-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="booking-info">
                    <h3>${booking.service_name}</h3> 
                    ${ratingHtml}
                    <p class="booking-date">
                        <i class="fa-regular fa-calendar"></i> ${booking.date} at ${booking.time}
                    </p>
                    <p class="booking-address">
                        <i class="fa-solid fa-location-dot"></i> ${booking.address}
                    </p>
                    ${booking.provider ? `<p class="provider-name"><i class="fa-solid fa-user"></i> Provider: ${booking.provider.full_name}</p>` : booking.provider_id ? `<p class="provider-name"><i class="fa-solid fa-user"></i> Provider ID: ${booking.provider_id}</p>` : ""}
                </div>
                <div class="booking-status">
                    <span class="status-badge ${status}">${status}</span>
                </div>
                <div class="booking-actions">
                    ${actions}
                </div>
            `;

      container.appendChild(card);
    });

    ["pending", "confirmed", "completed"].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.children.length === 0) {
        el.innerHTML =
          '<p style="padding: 1rem; color: var(--text-light);">No bookings in this category.</p>';
      }
    });
  } catch (error) {
    console.error("Error:", error);
    ["pending", "confirmed", "completed"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "<p>Error loading bookings.</p>";
    });
  }
});

window.showContact = function (bookingId) {
  const provider = window.bookingProviders[bookingId];
  if (!provider) {
    window.HB.showToast("Provider information not available.", "error");
    return;
  }

  const content = `
        <div class="contact-modal-content">
            <div class="contact-item">
                <i class="fa-solid fa-user"></i>
                <div>
                    <strong>Name</strong>
                    <p>${provider.full_name}</p>
                </div>
            </div>
            <div class="contact-item">
                <i class="fa-solid fa-envelope"></i>
                <div>
                    <strong>Email</strong>
                    <p>${provider.email}</p>
                </div>
            </div>
            <div class="contact-item">
                <i class="fa-solid fa-phone"></i>
                <div>
                    <strong>Phone</strong>
                    <p>${provider.phone}</p>
                </div>
            </div>
        </div>
    `;

  window.HB.info("Provider Contact Details", content);
};
window.viewRating = function (bookingId) {
  const booking = window.allBookings.find(b => b.id === bookingId);
  if (!booking || !booking.review) return;

  const stars = Array(5).fill(0).map((_, i) =>
    `<i class="fa-${i < booking.review.rating ? 'solid' : 'regular'} fa-star" style="color: #ffc107;"></i>`
  ).join("");

  const content = `
    <div style="text-align: center; padding: 1rem;">
      <div style="font-size: 1.5rem; margin-bottom: 1rem;">${stars}</div>
      <p style="font-style: italic; color: var(--text-light);">"${booking.review.comment || 'No comment provided'}"</p>
    </div>
  `;

  window.HB.info("Your Rating", content);
};

async function cancelBooking(bookingId) {
  window.HB.confirm(
    "Cancel Booking",
    "Are you sure you want to cancel this booking?",
    async () => {
      try {
        const response = await makeRequest(`/api/bookings/${bookingId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          window.HB.showToast("Booking cancelled.");
          setTimeout(() => location.reload(), 1000);
        } else {
          window.HB.showToast("Failed to cancel booking.", "error");
        }
      } catch (error) {
        console.error("Error cancelling:", error);
        window.HB.showToast("Error cancelling booking.", "error");
      }
    },
  );
}
