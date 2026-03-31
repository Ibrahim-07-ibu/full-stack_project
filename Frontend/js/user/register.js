document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("Name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

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

    window.HB.setButtonLoading("#register-form button[type='submit']", true, "Creating Account...");

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server Error ${response.status}:`, errorText);

        let errorMsg = "Registration failed. Please try again.";
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.detail || errorMsg;
        } catch (e) {
        }

        window.HB.showToast(errorMsg, "error");

        if (errorMsg.toLowerCase().includes("email")) {
          window.HB.showError("email", errorMsg);
        } else if (errorMsg.toLowerCase().includes("phone")) {
          window.HB.showError("phone", errorMsg);
        }

        return; 
      }

      const result = await response.json();

      window.HB.showToast(
        result.message || "Registration successful!",
        "success",
      );

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
      window.HB.setButtonLoading("#register-form button[type='submit']", false);
    }
  });
