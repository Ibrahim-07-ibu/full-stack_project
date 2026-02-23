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
        // Fetch Users Count
        const userRes = await makeRequest('/api/auth/users');
        if (userRes.ok) {
            const users = await userRes.json();
            const countElement = document.getElementById('users-count');
            if (countElement) countElement.textContent = users.length || 0;

            // New: Total Customers statistic (filtering role 'user')
            const customerCount = users.filter(u => u.role === 'user').length;
            const customerCountElement = document.getElementById('customers-count');
            if (customerCountElement) customerCountElement.textContent = customerCount;
        }

        // Fetch Providers Count
        const providerRes = await makeRequest('/api/providers/all');
        if (providerRes.ok) {
            const providers = await providerRes.json();
            const countElement = document.getElementById('providers-count');
            if (countElement) countElement.textContent = providers.length || 0;
        }

        // Fetch all bookings for total count
        const bookingRes = await makeRequest('/api/bookings/all');
        if (bookingRes.ok) {
            const bookings = await bookingRes.json();
            const countElement = document.getElementById('bookings-count');
            if (countElement) countElement.textContent = bookings.length || 0;

            // Update Total Revenue statistic
            const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
            const revenueElement = document.getElementById('revenue-amount');
            if (revenueElement) revenueElement.textContent = `₹${totalRevenue.toLocaleString()}`;

            // Render Recent Bookings Table (if exists on dashboard)
            renderRecentBookings(bookings.slice(0, 5));
        }

    } catch (error) {
        console.error('Error fetching stats:', error);
    }
});

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recent-bookings-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#BK-${b.id}</td>
            <td>${b.user_name}</td>
            <td>${b.provider_name || 'Not assigned'}</td>
            <td>${b.service_name}</td>
            <td>${b.date}</td>
            <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
