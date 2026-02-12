document.addEventListener("DOMContentLoaded", async () => {
  window.checkAuth();
  const providerId = localStorage.getItem("provider_id");
  if (!providerId) {
    // handled by checkAuth
  }
  updateNavBar();
  const userId = localStorage.getItem("user_id");
  try {
    const response = await makeRequest(`/api/reviews/my/profile`);
    if (response.ok) {
      const data = await response.json();
      const p = data.profile;
      const m = data.metrics;

      const safeSetText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      const safeSetHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };
      safeSetText("profile-name", p.full_name);
      safeSetText("detail-fullname", p.full_name);
      safeSetText("detail-email", p.email);
      safeSetText("detail-phone", p.phone || "N/A");
      safeSetText("detail-address", p.address);
      safeSetText("detail-service", p.service_name);
      safeSetText("detail-experience", `${p.years_experience} years`);
      safeSetText("detail-specialization", p.specialization);
      safeSetText("profile-bio", p.bio);

      const avatarEl = document.getElementById("profile-avatar");
      if (avatarEl) {
        avatarEl.textContent = p.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
      }
      safeSetText(
        "profile-rating-text",
        `${m.average_rating} (${m.total_reviews} reviews)`,
      );
      safeSetHtml(
        "metric-rating",
        `<i class="fa-solid fa-star"></i> ${m.average_rating}`,
      );
      // safeSetText('metric-completed', `${m.completed_orders} orders`);
      // safeSetText('metric-completion-rate', `${m.completion_rate}%`);
      // safeSetText('metric-satisfaction-rate', `${m.satisfaction_rate}%`);
      // safeSetText('metric-earnings', `₹${m.total_earnings}`);
      const starsEl = document.getElementById("profile-stars");
      if (starsEl) {
        const filledRequest = Math.round(m.average_rating);
        starsEl.innerHTML =
          '<i class="fa-solid fa-star"></i>'.repeat(filledRequest) +
          '<i class="fa-regular fa-star"></i>'.repeat(5 - filledRequest);
      }
      const verifiedBadge = document.getElementById("profile-verified");
      const verifyIdVal = document.getElementById("verify-id");
      if (verifiedBadge) {
        verifiedBadge.classList.toggle("d-none", !p.is_verified);
        if (p.is_verified)
          verifiedBadge.innerHTML =
            '<i class="fa-solid fa-certificate"></i> Verified Helper';
      }
      if (verifyIdVal) {
        verifyIdVal.innerHTML = p.is_verified
          ? '<i class="fa-solid fa-check-circle"></i> Verified'
          : '<i class="fa-regular fa-clock"></i> Pending';
        verifyIdVal.classList.toggle("text-success", p.is_verified);
        verifyIdVal.classList.toggle("verified", p.is_verified);
      }

      localStorage.setItem("provider_name", p.full_name);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  try {
    const response = await makeRequest(`/api/reviews/my/reviews`);
    if (response.ok) {
      const reviews = await response.json();
      const container = document.getElementById("reviews-container");

      if (reviews.length === 0) {
        container.innerHTML = '<div class="no-reviews">No reviews yet.</div>';
        return;
      }

      container.innerHTML = "";
      reviews.forEach((r) => {
        const div = document.createElement("div");
        div.className = "review";
        const stars =
          '<i class="fa-solid fa-star"></i>'.repeat(r.rating) +
          '<i class="fa-regular fa-star"></i>'.repeat(5 - r.rating);
        div.innerHTML = `
                    <div class="review-header">
                        <strong>${r.user_name}</strong>
                        <span>${stars} ${r.rating}.0</span>
                    </div>
                    <p>"${r.comment}"</p>
                    <span class="review-date">Recent</span>
                `;
        container.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
});

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
