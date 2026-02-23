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
            window.location.href = '../../../index.html';
        });
    }

    try {
        const response = await makeRequest('/api/bookings/all');
        if (response.ok) {
            const bookings = await response.json();
            renderBookings(bookings);
            updateStats(bookings);
        } else {
            console.error('Failed to fetch bookings');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

function updateStats(bookings) {
    const activeCount = bookings.filter(b => b.status === 'accepted').length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter(b => b.booking_date === today).length;
    const totalValue = bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);

    document.getElementById('active-bookings-count').textContent = activeCount;
    document.getElementById('today-bookings-count').textContent = todayCount;
    document.getElementById('total-bookings-count').textContent = bookings.length;
    document.getElementById('total-value-amount').textContent = `₹${totalValue.toLocaleString()}`;
}

function renderBookings(bookings) {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#BK-${booking.id}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${booking.user_name ? booking.user_name.substring(0, 2).toUpperCase() : 'CU'}</div>
                    <span>${booking.user_name || 'Anonymous'}</span>
                </div>
            </td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar" style="background: var(--light-steel); color: var(--text-dark);">${booking.provider_name !== 'Not assigned' ? booking.provider_name.substring(0, 2).toUpperCase() : '??'}</div>
                    <span>${booking.provider_name}</span>
                </div>
            </td>
            <td>${booking.service_name}</td>
            <td>
                <div>${booking.date}</div>
                <div class="user-subtitle">${booking.time}</div>
            </td>
            <td>
                <div class="text-xs text-muted" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${booking.address}
                </div>
            </td>
            <td>₹${parseFloat(booking.amount || 0).toLocaleString()}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}
