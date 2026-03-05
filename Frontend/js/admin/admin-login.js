document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    window.HB.setButtonLoading("#admin-login-form button", true, "Authenticating...");
    try {
        const response = await makeRequest('/api/auth/unified_login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.role !== 'admin') {
                showModal('Access denied: You are not an administrator.', 'error');
                return;
            }

            // Clear previous session data
            localStorage.clear();

            if (result.access_token) {
                window.setToken(result.access_token, 'admin');
            }

            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('role', 'admin');

            showModal('Admin login successful!', 'success');
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1200);
        } else {
            const errorData = await response.json();
            showModal(`Login failed: ${errorData.detail || 'Invalid credentials'}`, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        window.HB.showToast('Connection error. Please try again.', 'error');
    } finally {
        window.HB.setButtonLoading("#admin-login-form button", false);
    }
});
