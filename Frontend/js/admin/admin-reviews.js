document.addEventListener('DOMContentLoaded', async () => {
    // Check local Auth
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Logout Functionality
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('role');
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
        });
    }

    try {
        const response = await makeRequest('/api/reviews/all');
        if (response.ok) {
            const reviews = await response.json();
            renderReviews(reviews);
            updateReviewStats(reviews);
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
});

function updateReviewStats(reviews) {
    if (reviews.length === 0) return;

    const total = reviews.length;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    // Update Rating Bars
    for (let i = 1; i <= 5; i++) {
        const count = reviews.filter(r => r.rating === i).length;
        const percent = Math.round((count / total) * 100);
        const bar = document.getElementById(`bar-${i}`);
        const label = document.getElementById(`label-${i}`);
        if (bar) bar.style.width = `${percent}%`;
        if (label) label.textContent = count;
    }

    document.getElementById('avg-rating-value').textContent = avg.toFixed(1);
    document.getElementById('total-reviews-count').textContent = total;

    // Update numeric stats in header if they exist
    const posPercentEl = document.getElementById('positive-reviews-percent');
    if (posPercentEl) {
        const positive = reviews.filter(r => r.rating >= 4).length;
        posPercentEl.textContent = `${Math.round((positive / total) * 100)}%`;
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (reviews.length === 0) {
        container.innerHTML = '<div class="content-card p-2 text-center">No reviews found.</div>';
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';

        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="${i <= review.rating ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
        }

        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${review.user_name.substring(0, 2).toUpperCase()}</div>
                    <div class="reviewer-details">
                        <div class="reviewer-name">${review.user_name}</div>
                        <div class="review-date">${review.created_at || 'Recently'}</div>
                    </div>
                </div>
                <div class="review-rating">${stars}</div>
            </div>
            <div class="review-content">
                "${review.comment || 'Safe and reliable service provided. Highly recommended!'}"
            </div>
            <div class="review-meta">
                <div class="meta-item"><i class="fa-solid fa-clipboard-check"></i> #BK-${review.booking_id}</div>
                <div class="meta-item"><i class="fa-solid fa-user-gear"></i> ${review.provider_name}</div>
                <div class="meta-item"><i class="fa-solid fa-tag"></i> ${review.service_name}</div>
            </div>
            <div class="review-actions">
                <button class="btn-action danger" onclick="deleteReview(${review.id})"><i class="fa-solid fa-trash-can"></i> Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function deleteReview(id) {
    const confirmed = await showConfirm('Are you sure you want to delete this review?', 'danger');
    if (!confirmed) return;
    try {
        const response = await makeRequest(`/api/reviews/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showModal('Review deleted successfully.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Error delete review:', error);
    }
}
