async function fetchTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    if (!tableBody) return;

    try {
        const response = await makeRequest('/api/supports/all');

        if (!response.ok) {
            throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();   // 🔥 THIS IS THE FIX

        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="7" style="text-align: center;">No support tickets found</td></tr>';
            return;
        }

        data.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${ticket.user_name} (ID: ${ticket.user_id})</td>
                <td><strong>${ticket.subject}</strong></td>
                <td>${ticket.message}</td>
                <td>
                    <span class="badge-status ${ticket.status === 'Resolved' ? 'verified' : 'pending'}">
                        ${ticket.status}
                    </span>
                </td>
                <td><small>${ticket.created_at || 'N/A'}</small></td>
                <td>
                    ${ticket.status === 'Open' ? `
                    <button class="action-btn btn-view"
                        style="background: var(--success-color); color: white;"
                        onclick="resolveTicket(${ticket.id})">
                        <i class="fa-solid fa-check"></i> Resolve
                    </button>
                    ` : '<span class="text-muted">No actions</span>'}
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching tickets:', error);
        tableBody.innerHTML =
            '<tr><td colspan="7" style="text-align: center; color: var(--danger-color);">Error loading tickets</td></tr>';
    }
}

async function resolveTicket(id) {
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) return;

    try {
        const response = await makeRequest(`/api/supports/${id}/resolve`, {
            method: 'PUT'
        });

        if (response.ok) {
            if (window.HB) window.HB.showToast('Ticket marked as resolved', 'success');
            else alert('Ticket marked as resolved');
            fetchTickets();
        } else {
            if (window.HB) window.HB.showToast('Failed to resolve ticket', 'error');
            else alert('Failed to resolve ticket');
        }
    } catch (error) {
        console.error('Error resolving ticket:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTickets();

    // Setup logout if needed (similar to other admin pages)
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.removeToken();
            window.location.href = 'admin-login.html';
        });
    }
});
