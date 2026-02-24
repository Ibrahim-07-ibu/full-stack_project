document.addEventListener("DOMContentLoaded", async () => {
    window.checkAuth();
    const container = document.getElementById("completed-history");

    try {
        const response = await makeRequest(`/api/bookings/my`);
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const bookings = await response.json();

        // Filter: ONLY completed AND have a review
        const history = bookings.filter(b => (b.status || "").toLowerCase() === "completed" && b.review);

        container.innerHTML = "";

        if (history.length === 0) {
            container.innerHTML = '<div class="no-bookings" style="text-align:center; padding: 2rem; color: var(--text-light);"><i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>You haven\'t rated any completed services yet.</p></div>';
            return;
        }

        history.forEach(booking => {
            const card = document.createElement("div");
            card.className = "booking-card completed";

            const icon = window.getServiceIcon(booking.service_name);
            const stars = Array(5).fill(0).map((_, i) =>
                `<i class="fa-${i < booking.review.rating ? 'solid' : 'regular'} fa-star" style="color: #ffc107;"></i>`
            ).join("");

            card.innerHTML = `
                <div class="booking-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="booking-info">
                    <h3>${booking.service_name}</h3>
                    <div class="rating-stars" style="margin: 0.5rem 0;">${stars}</div>
                    <p class="booking-date"><i class="fa-regular fa-calendar"></i> ${booking.date} at ${booking.time}</p>
                    <p class="review-comment" style="font-style: italic; color: var(--text-light); margin-top: 0.5rem;">"${booking.review.comment || 'No comment provided'}"</p>
                </div>
                <div class="booking-actions">
                    <span class="status-badge completed">Rated</span>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading history:", error);
        container.innerHTML = "<p>Error loading your history. Please try again.</p>";
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
