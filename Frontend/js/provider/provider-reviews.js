document.addEventListener("DOMContentLoaded", async () => {
    if (!window.checkAuth()) return;

    const container = document.getElementById("reviews-list");
    const countDisplay = document.getElementById("total-reviews-count");

    try {
        const response = await makeRequest("/api/reviews/my/reviews");
        if (response.ok) {
            const reviews = await response.json();

            if (countDisplay) countDisplay.textContent = `${reviews.length} Reviews`;

            if (reviews.length === 0) {
                container.innerHTML = '<div class="no-reviews"><h3>No reviews yet</h3><p>Complete more jobs to get feedback from customers!</p></div>';
                return;
            }

            container.innerHTML = "";
            reviews.forEach(review => {
                const card = document.createElement("div");
                card.className = "review-card";

                const stars = '<i class="fa-solid fa-star"></i>'.repeat(review.rating) +
                    '<i class="fa-regular fa-star"></i>'.repeat(5 - review.rating);

                card.innerHTML = `
                    <div class="review-card-header">
                        <span class="reviewer-name">${review.user_name || "Anonymous"}</span>
                        <div class="review-stars">${stars}</div>
                    </div>
                    <div class="review-service-tag">
                        <i class="fa-solid ${window.getServiceIcon(review.service_name)}"></i> ${review.service_name}
                    </div>
                    <p class="review-content">"${review.comment}"</p>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
    }
});
