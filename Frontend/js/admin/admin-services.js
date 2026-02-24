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

    // Service icon mapping
    const serviceIcons = {
        'cooking': 'fa-utensils',
        'cleaning': 'fa-broom',
        'laundry': 'fa-shirt',
        'babysitting': 'fa-baby',
        'elder care': 'fa-person-cane',
        'tutoring': 'fa-book',
        'electrician': 'fa-bolt',
        'plumber': 'fa-faucet',
        'carpenter': 'fa-hammer',
        'ac repair': 'fa-snowflake',
        'pet care': 'fa-dog',
        'errands': 'fa-cart-shopping',
        'painting': 'fa-paint-roller',
        'gardening': 'fa-seedling',
        'moving': 'fa-truck',
        'photography': 'fa-camera',
    };

    function getServiceIcon(name) {
        const key = name.toLowerCase().trim();
        return serviceIcons[key] || 'fa-wrench';
    }

    // Fetch and render services
    async function fetchServices() {
        const container = document.getElementById('services-list-container');
        try {
            const response = await makeRequest('/api/services');
            if (response.ok) {
                const services = await response.json();
                renderServices(services);
            } else {
                container.innerHTML = '<p class="text-danger">Failed to load services.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<p class="text-danger">Error connecting to server.</p>';
        }
    }

    function renderServices(services) {
        const container = document.getElementById('services-list-container');
        if (!container) return;

        if (services.length === 0) {
            container.innerHTML = '<p class="text-muted text-center p-2">No services found.</p>';
            return;
        }

        container.innerHTML = '';
        services.forEach(service => {
            const icon = getServiceIcon(service.name);
            const item = document.createElement('div');
            item.className = 'service-item';
            item.innerHTML = `
                <div class="service-icon-box"><i class="fa-solid ${icon}"></i></div>
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                </div>
                <div class="service-actions">
                    <div class="price-input-group">
                        <span>₹</span>
                        <input type="number" value="${service.price}" id="price-${service.id}" class="form-input">
                    </div>
                    <button class="btn-update" onclick="updateService(${service.id}, '${service.name}', '${service.description}')">
                        Update
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // Add Service Handler
    const addForm = document.getElementById('add-service-form');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-service-name').value;
            const price = parseInt(document.getElementById('new-service-price').value);
            const description = document.getElementById('new-service-desc').value;

            try {
                const response = await makeRequest('/api/services', {
                    method: 'POST',
                    body: JSON.stringify({ name, price, description })
                });

                if (response.ok) {
                    showModal('Service added successfully!', 'success');
                    addForm.reset();
                    fetchServices();
                } else {
                    showModal('Failed to add service.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showModal('Server error occurred.', 'error');
            }
        });
    }

    // Initial load
    fetchServices();

    // Export update function to window
    window.updateService = async (id, name, description) => {
        const price = parseInt(document.getElementById(`price-${id}`).value);

        try {
            const response = await makeRequest(`/api/services/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, price, description })
            });

            if (response.ok) {
                showModal('Price updated successfully!', 'success');
                fetchServices();
            } else {
                showModal('Failed to update price.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Server error occurred.', 'error');
        }
    };
});
