document.addEventListener('DOMContentLoaded', async () => {
    // Check local Auth
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await makeRequest('/api/providers/all');
        const providers = await response.json();

        const tbody = document.getElementById('helpers-table-body');
        tbody.innerHTML = '';

        if (providers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No helpers found.</td></tr>';
            return;
        }

        providers.forEach(provider => {
            const tr = document.createElement('tr');
            // Mapping fields:
            // full_name -> Name
            // specialization -> Service
            // years_experience -> Experience
            // No direct rate/rating in easy provider schema yet, usage placeholders.

            tr.innerHTML = `
                <td>#H${provider.id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${getInitials(provider.full_name)}</div>
                        <div>
                            <div>${provider.full_name}</div>
                            <div class="user-subtitle">✓ Verified</div>
                        </div>
                    </div>
                </td>
                <td>${provider.specialization || 'Service'}</td>
                <td>${provider.years_experience || 0} years</td>
                <td>-</td> <!-- Rate not in schema -->
                <td>
                    <div class="rating-cell">
                        <span class="rating-stars">⭐⭐⭐⭐⭐</span>
                        <span class="rating-value">5.0 (New)</span>
                    </div>
                </td>
                <td>0</td> <!-- Bookings count not available -->
                <td><span class="badge-status verified">Verified</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action" title="View">👁️</button>
                        <button class="btn-action" title="Edit">✏️</button>
                        <button class="btn-action" title="Suspend">🚫</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching helpers:', error);
        document.getElementById('helpers-table-body').innerHTML = '<tr><td colspan="9">Error loading data.</td></tr>';
    }
});

function getInitials(name) {
    if (!name) return 'H';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}
