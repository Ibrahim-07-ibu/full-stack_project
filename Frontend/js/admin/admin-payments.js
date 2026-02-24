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
        const response = await makeRequest('/api/bookings/all');
        if (response.ok) {
            const bookings = await response.json();
            // Filter bookings that have a status implying payment (completed, or accepted)
            const payments = bookings.filter(b => b.status === 'completed' || b.status === 'accepted');
            renderPayments(payments);
            updateRevenueStats(payments);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function updateRevenueStats(payments) {
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = payments
        .filter(p => p.booking_date === today)
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const avgTransaction = payments.length > 0 ? totalRevenue / payments.length : 0;

    document.getElementById('total-revenue-value').textContent = `₹${totalRevenue.toLocaleString()}`;
    document.getElementById('today-revenue-value').textContent = `₹${todayRevenue.toLocaleString()}`;
    document.getElementById('avg-transaction-value').textContent = `₹${Math.round(avgTransaction).toLocaleString()}`;
    document.getElementById('total-transactions-count').textContent = payments.length;
}

function renderPayments(payments) {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (payments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">No payment transactions found.</td></tr>';
        return;
    }

    payments.forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#TXN${payment.id.toString().padStart(5, '0')}</td>
            <td>#HB${payment.id}</td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${payment.client_name ? payment.client_name.substring(0, 2).toUpperCase() : 'CU'}</div>
                    <span>${payment.client_name || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${payment.provider_name ? payment.provider_name.substring(0, 2).toUpperCase() : 'HE'}</div>
                    <span>${payment.provider_name || 'N/A'}</span>
                </div>
            </td>
            <td>${payment.service_name || 'N/A'}</td>
            <td class="fw-bold text-success">₹${payment.amount || 0}</td>
            <td>💵 Cash</td>
            <td>${payment.booking_date}</td>
            <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" title="View">👁️</button>
                    <button class="btn-action" title="Receipt">🧾</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}
