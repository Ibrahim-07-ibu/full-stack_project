document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();
  const password = document.getElementById("password").value;

  // Basic Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    window.HB.showError("email", "Please enter a valid email.");
    return;
  }

  try {
    const response = await makeRequest("/api/auth/provider/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.access_token) {
        window.setToken(result.access_token, "provider");
      }

      localStorage.setItem("role", "provider");
      localStorage.setItem("provider_id", result.provider_id);
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("provider_name", result.full_name);

      window.HB.showToast(`Welcome back, ${result.full_name}!`);
      setTimeout(() => {
        window.location.href = "provider-dashboard.html";
      }, 1000);

    } else {
      const errorData = await response.json();
      window.HB.showToast(errorData.detail || "Invalid credentials", "error");
    }

  } catch (error) {
    console.error("Error logging in:", error);
    window.HB.showToast("An error occurred. Please try again.", "error");
  }
});
