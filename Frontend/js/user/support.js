document.addEventListener("DOMContentLoaded", () =\u003e {
    window.checkAuth();

    const form = document.querySelector(".support-form");
    if(!form) return;

    form.addEventListener("submit", async(e) =\u003e {
        e.preventDefault();

        const subject = form.querySelector('input[type="text"]').value;
        const message = form.querySelector("textarea").value;

        if(!subject || !message) {
    alert("Please fill in all fields");
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
        alert("Support ticket submitted successfully! We'll get back to you soon.");
        form.reset();
    } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to submit ticket"}`);
    }
} catch (error) {
    console.error("Error submitting support ticket:", error);
    alert("An error occurred. Please try again later.");
}
  });

// Handle logout
const logoutBtn = document.querySelector(".btn-logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) =\u003e {
        e.preventDefault();
        window.removeToken();
        window.location.href = "login.html";
    });
}
});
