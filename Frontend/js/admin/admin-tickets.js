async function fetchTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    if (!tableBody) return;

    try {
        const data = await makeRequest('/api/supports/all');
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No support tickets found</td></tr>';
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
                    <button class="action-btn btn-view" onclick="viewTicket(${ticket.id})">
                        <i class="fa-solid fa-eye"></i> View
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-color);">Error loading tickets</td></tr>';
    }
}

function viewTicket(id) {
    // For now, just alert or show in a modal if needed. 
    // Since we're keeping it simple, let's just alert the details for now.
    alert('Viewing ticket details for ID: ' + id + '\n\nFull message handling can be implemented here.');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTickets();

    // Setup logout if needed (similar to other admin pages)
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_token');
            window.location.href = 'admin-login.html';
        });
    }
});
