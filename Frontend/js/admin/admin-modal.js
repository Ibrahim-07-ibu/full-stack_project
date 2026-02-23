/* =============================================
   Admin Modal System
   A shared, premium modal utility for all admin pages.
   Replaces native alert() and confirm() with styled modals.
   ============================================= */

/**
 * Show a notification/alert modal.
 * @param {string} message - The message to display.
 * @param {'success'|'error'|'warning'|'info'} type - The type of notification.
 */
function showModal(message, type = 'info') {
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info',
    };
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
    };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box modal-${type}">
            <div class="modal-icon-wrapper modal-icon-${type}">
                <i class="fa-solid ${icons[type] || icons.info}"></i>
            </div>
            <h3 class="modal-title">${titles[type] || titles.info}</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-primary modal-btn-${type}" onclick="this.closest('.modal-overlay').remove()">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-visible'));

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Show a confirmation modal. Returns a Promise that resolves to true/false.
 * @param {string} message - The confirmation message.
 * @param {'danger'|'warning'|'info'} type - Visual style of modal.
 * @returns {Promise<boolean>}
 */
function showConfirm(message, type = 'warning') {
    const icons = {
        danger: 'fa-triangle-exclamation',
        warning: 'fa-circle-exclamation',
        info: 'fa-circle-question',
    };

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-box modal-confirm">
                <div class="modal-icon-wrapper modal-icon-${type}">
                    <i class="fa-solid ${icons[type] || icons.warning}"></i>
                </div>
                <h3 class="modal-title">Confirm Action</h3>
                <p class="modal-message">${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel" data-action="cancel">Cancel</button>
                    <button class="modal-btn modal-btn-primary modal-btn-${type}" data-action="confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('modal-visible'));

        const cleanup = (result) => {
            overlay.classList.remove('modal-visible');
            setTimeout(() => overlay.remove(), 200);
            document.removeEventListener('keydown', escHandler);
            resolve(result);
        };

        overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => cleanup(true));
        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => cleanup(false));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });

        const escHandler = (e) => {
            if (e.key === 'Escape') cleanup(false);
        };
        document.addEventListener('keydown', escHandler);
    });
}
