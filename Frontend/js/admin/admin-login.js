document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await makeRequest('/api/auth/unified_login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.role !== 'admin') {
                alert('Access denied: You are not an administrator.');
                return;
            }

            // Clear previous session data
            localStorage.clear();

            if (result.access_token) {
                window.setToken(result.access_token);
            }

            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('role', 'admin');

            alert('Admin login successful!');
            window.location.href = result.redirect;
        } else {
            const errorData = await response.json();
            alert(`Login failed: ${errorData.detail || 'Invalid credentials'}`);
        }
    } catch (error) {
        console.error('Admin Login Error:', error);
        alert('An error occurred. Please try again.');
    }
});
