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
        if (response.ok) {
            const providers = await response.json();
            // Show all pending providers by default
            const container = document.getElementById('verification-cards-container');
            if (container) {
                renderVerifications(providers.filter(p => !p.is_verified));
            }
        }
    } catch (error) {
        console.error('Error fetching providers:', error);
    }
});

function renderVerifications(providers) {
    const container = document.getElementById('verification-cards-container');
    if (!container) return;

    container.innerHTML = '';

    if (providers.length === 0) {
        container.innerHTML = '<div class="verification-card p-2 text-center">No pending verifications found.</div>';
        return;
    }

    providers.forEach(provider => {
        const card = document.createElement('div');
        card.className = 'verification-card';
        card.innerHTML = `
            <div class="provider-info">
                <div class="provider-avatar">${provider.full_name.substring(0, 2).toUpperCase()}</div>
                <div class="provider-details">
                    <h3>${provider.full_name}</h3>
                    <div class="text-center mt-05">
                        <span class="badge-status pending">Pending</span>
                    </div>
                </div>
            </div>

            <div class="d-grid grid-cols-auto gap-1 mb-15">
                <div>
                    <div class="text-muted text-sm">Service</div>
                    <div class="fw-600"><i class="fa-solid ${window.getServiceIcon ? window.getServiceIcon(provider.specialization) : 'fa-wrench'}"></i> ${provider.specialization || 'General'}</div>
                </div>
                <div>
                    <div class="text-muted text-sm">Experience</div>
                    <div class="fw-600">${provider.years_experience || 0} years</div>
                </div>
            </div>

            <div class="bg-mist p-1 rounded-8 mb-15">
                <div class="fw-600 mb-05 text-dark">Contact Information</div>
                <div class="text-muted text-sm lh-16">
                    <i class="fa-solid fa-envelope w-20"></i> ${provider.email}<br>
                    <i class="fa-solid fa-phone w-20"></i> ${provider.phone}<br>
                    <i class="fa-solid fa-location-dot w-20"></i> ${provider.address || 'N/A'}
                </div>
            </div>

            <div class="document-list">
                <a href="${provider.id_proof.startsWith('http') ? provider.id_proof : window.API_BASE_URL + provider.id_proof}" target="_blank" class="doc-item link-premium">
                    <i class="fa-solid fa-file-invoice"></i> View ID Proof
                </a>
                <a href="${provider.certificate.startsWith('http') ? provider.certificate : window.API_BASE_URL + provider.certificate}" target="_blank" class="doc-item link-premium">
                    <i class="fa-solid fa-certificate"></i> View Certificate
                </a>
            </div>

            <div class="verification-actions">
                <button class="btn-approve" onclick="verifyProvider(${provider.id})">Approve & Verify</button>
                <button class="btn-reject" onclick="rejectProvider(${provider.id})">Reject Application</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function verifyProvider(providerId) {
    const confirmed = await showConfirm('Are you sure you want to verify this provider?', 'info');
    if (!confirmed) return;

    try {
        const response = await makeRequest(`/api/providers/verify/${providerId}`, {
            method: 'POST'
        });

        if (response.ok) {
            showModal('Provider verified successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showModal('Failed to verify provider.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function rejectProvider(providerId) {
    const confirmed = await showConfirm('Are you sure you want to REJECT and REMOVE this provider application?', 'error');
    if (!confirmed) return;

    try {
        const response = await makeRequest(`/api/providers/reject/${providerId}`, {
            method: 'POST'
        });

        if (response.ok) {
            showModal('Provider application rejected.', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showModal('Failed to reject provider.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
