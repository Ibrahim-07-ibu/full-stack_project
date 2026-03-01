const HB = {
    showToast: (message, type = 'success', duration = 3000) => {
        let container = document.querySelector('.hb-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'hb-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `hb-toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        const icon = icons[type] || icons.info;
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => toast.remove(), 500);
        }, duration);
    },

    confirm: (title, message, onConfirm, type = 'warning') => {
        const overlay = document.createElement('div');
        overlay.className = 'hb-modal-overlay';

        const icons = {
            warning: 'fa-triangle-exclamation',
            danger: 'fa-circle-exclamation',
            info: 'fa-circle-question'
        };
        const icon = icons[type] || icons.info;

        overlay.innerHTML = `
            <div class="hb-modal">
                <div class="hb-modal-icon ${type}" style="font-size: 3rem; margin-bottom: 1rem; color: #f6ad55">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="hb-modal-actions">
                    <button class="hb-btn hb-btn-cancel">Cancel</button>
                    <button class="hb-btn hb-btn-confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cancelBtn = overlay.querySelector('.hb-btn-cancel');
        const confirmBtn = overlay.querySelector('.hb-btn-confirm');

        cancelBtn.onclick = () => overlay.remove();
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            overlay.remove();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    },

    showError: (inputId, message) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.classList.add('hb-input-error');

        const next = input.nextElementSibling;
        if (next && next.classList.contains('hb-error-message')) {
            next.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'hb-error-message';
        errorDiv.textContent = message;
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    },

    clearError: (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.classList.remove('hb-input-error');
        const next = input.nextElementSibling;
        if (next && next.classList.contains('hb-error-message')) {
            next.remove();
        }
    }
};

window.HB = HB;
