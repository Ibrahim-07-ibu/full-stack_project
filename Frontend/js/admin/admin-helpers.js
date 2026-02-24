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
        const response = await makeRequest('/api/providers/all');
        if (!response.ok) throw new Error('Failed to fetch providers');
        const providers = await response.json();

        const tbody = document.getElementById('helpers-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (providers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No providers found.</td></tr>';
            return;
        }

        providers.forEach(provider => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#P-${provider.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="admin-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">${getInitials(provider.full_name)}</div>
                        <span style="font-weight: 600;">${provider.full_name}</span>
                    </div>
                </td>
                <td>${provider.specialization || 'General Service'}</td>
                <td>${provider.years_experience || 0} Years</td>
                <td>
                    <div style="color: #f1c40f; font-size: 0.85rem;">
                        <i class="fa-solid fa-star"></i> 5.0
                    </div>
                </td>
                <td>
                    <span class="status-badge ${provider.is_verified ? 'status-verified' : 'status-pending'}">
                        ${provider.is_verified ? 'Verified' : 'Pending'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching providers:', error);
        const tbody = document.getElementById('helpers-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7">Error loading provider data.</td></tr>';
    }
});

async function deleteProvider(id) {
    const confirmed = await showConfirm('Are you sure you want to delete this provider?', 'danger');
    if (!confirmed) return;
    try {
        const response = await makeRequest(`/api/providers/delete/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showModal('Provider deleted successfully.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function getInitials(name) {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
