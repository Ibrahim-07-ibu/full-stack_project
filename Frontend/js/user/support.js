document.addEventListener("DOMContentLoaded", () => {
    if (!window.checkAuth()) return;

    const form = document.querySelector(".support-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const subject = form.querySelector('input[type="text"]').value.trim();
        const message = form.querySelector("textarea").value.trim();

        if (!subject || !message) {
            HB.showToast("Please fill in all fields", "warning");
            return;
        }

        const supportData = {
            subject: subject,
            message: message,
        };

        try {
            const response = await makeRequest("/api/supports", {
                method: "POST",
                body: JSON.stringify(supportData),
            });

            if (response.ok) {
                HB.showToast("Support ticket submitted successfully! We'll get back to you soon.", "success");
                form.reset();
            } else {
                const error = await response.json();
                HB.showToast(error.detail || "Failed to submit ticket", "error");
            }

        } catch (error) {
            console.error("Error submitting support ticket:", error);
            HB.showToast("An error occurred. Please try again later.", "error");
        }
    });

    const logoutBtn = document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.removeToken) {
                window.removeToken();
            }
            window.location.href = "login.html";
        });
    }

});
