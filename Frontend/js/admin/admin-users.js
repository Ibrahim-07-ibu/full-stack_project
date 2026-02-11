document.addEventListener('DOMContentLoaded', async () => {
    // Check local Auth
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await makeRequest('/api/auth/users');
        const users = await response.json();

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            // Assuming user has name, email, phone, address, id.
            // Some fields like joined date might be missing in simple schema, using placeholder.

            tr.innerHTML = `
                <td>#U${user.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${getInitials(user.name)}</div>
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${user.address || '-'}</td>
                <td>-</td> <!-- Bookings count not available in simple user obj -->
                <td>-</td> <!-- Joined date not available -->
                <td><span class="badge-status active">Active</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action" title="View">👁️</button>
                        <button class="btn-action" title="Edit">✏️</button>
                        <button class="btn-action" title="Block">🚫</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('users-table-body').innerHTML = '<tr><td colspan="9">Error loading data.</td></tr>';
    }
});

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
