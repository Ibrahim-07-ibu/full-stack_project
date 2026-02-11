document.addEventListener('DOMContentLoaded', async () => {
    // Check local Auth
    if (localStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        // Fetch Users Count
        const userRes = await makeRequest('/api/auth/users');
        if (userRes.ok) {
            const users = await userRes.json();
            document.getElementById('users-count').textContent = users.length || 0;
        }

        // Fetch Providers Count
        const providerRes = await makeRequest('/api/providers/all');
        if (providerRes.ok) {
            const providers = await providerRes.json();
            document.getElementById('providers-count').textContent = providers.length || 0;
        }

        // Fetch all bookings for total count
        const bookingRes = await makeRequest('/api/bookings/all');
        if (bookingRes.ok) {
            const bookings = await bookingRes.json();
            document.getElementById('bookings-count').textContent = bookings.length || 0;
        }

    } catch (error) {
        console.error('Error fetching stats:', error);
    }
});
