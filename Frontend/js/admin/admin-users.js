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
            window.removeToken();
            window.location.href = '../../index.html';
        });
    }

    try {
        const response = await makeRequest('/api/auth/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#U-${user.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="admin-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">${getInitials(user.name)}</div>
                        <div>
                            <span style="font-weight: 600;">${user.name}</span>
                            <div class="text-muted" style="font-size: 0.75rem;">${user.role.toUpperCase()}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td><span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">${user.is_active ? 'Active' : 'Blocked'}</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        const tbody = document.getElementById('users-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading user data.</td></tr>';
    }
});

async function toggleUserStatus(id, currentStatus) {
    const confirmed = await showConfirm(`Are you sure you want to ${currentStatus ? 'block' : 'unblock'} this user?`, 'warning');
    if (!confirmed) return;
    try {
        const response = await makeRequest(`/api/auth/toggle-status/${id}`, { method: 'POST' });
        if (response.ok) {
            showModal(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully.`, 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteUser(id) {
    const confirmed = await showConfirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.', 'danger');
    if (!confirmed) return;
    try {
        const response = await makeRequest(`/api/auth/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showModal('User deleted successfully.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
