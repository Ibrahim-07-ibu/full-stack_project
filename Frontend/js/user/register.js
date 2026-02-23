document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Get Form Data
    const name = document.getElementById("Name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // 2. Client-Side Validation
    let hasError = false;

    if (name.length < 2) {
      window.HB.showError("Name", "Name must be at least 2 characters.");
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      window.HB.showError("email", "Please enter a valid email address.");
      hasError = true;
    }

    if (phone.length < 10) {
      window.HB.showError("phone", "Please enter a valid phone number.");
      hasError = true;
    }

    if (password.length < 6) {
      window.HB.showError(
        "password",
        "Password must be at least 6 characters.",
      );
      hasError = true;
    }

    if (password !== confirmPassword) {
      window.HB.showError("confirmPassword", "Passwords do not match.");
      hasError = true;
    }

    if (hasError) return;

    // 3. UI State: Loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';

    try {
      const response = await makeRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          password,
        }),
      });

      // ✅ Check if the server responded with an error (like 405 or 500) FIRST
      if (!response.ok) {
        // Read as text so we don't trigger the JSON crash if it's an HTML error page
        const errorText = await response.text();
        console.error(`Server Error ${response.status}:`, errorText);

        let errorMsg = "Registration failed. Please try again.";
        try {
          // Try to parse the error text as JSON if the backend sent a structured error
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.detail || errorMsg;
        } catch (e) {
          // If parsing fails, it's likely an HTML error or plain text
        }

        window.HB.showToast(errorMsg, "error");

        // Field specific highlights
        if (errorMsg.toLowerCase().includes("email")) {
          window.HB.showError("email", errorMsg);
        } else if (errorMsg.toLowerCase().includes("phone")) {
          window.HB.showError("phone", errorMsg);
        }

        return; // Stop execution here since it failed
      }

      // ✅ If we get here, response.ok is true, so it is safe to parse the JSON
      const result = await response.json();

      window.HB.showToast(
        result.message || "Registration successful!",
        "success",
      );

      // Auto-login or redirect
      setTimeout(() => {
        window.location.href = "login.html?registered=true";
      }, 2000);
    } catch (error) {
      console.error("Registration Error:", error);
      window.HB.showToast(
        "Server connection failed. Please check your internet.",
        "error",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
