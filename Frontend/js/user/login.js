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
    const response = await makeRequest("/api/auth/unified_login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      if (result.access_token) {
        // Store token FIRST
        window.setToken(result.access_token, result.role);

        // Store user info
        const displayName = result.user_name || result.name || result.full_name || "User";
        localStorage.setItem("role", result.role);
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("user_name", displayName);
        localStorage.setItem("name", displayName);
        localStorage.setItem("user_email", result.email);

        if (result.role === 'admin') {
          localStorage.setItem('admin_logged_in', 'true');
        }

        // Only redirect AFTER token is confirmed stored
        const redirectTarget = result.redirect || "/html/user/dashboard.html";
        console.log("[Login] Token stored, redirecting to:", redirectTarget,
          "| auth_token set:", !!localStorage.getItem("auth_token"));
        window.HB.showToast(`Welcome back, ${displayName}! Logging in...`);
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 1000);

      } else {
        // Backend responded OK but gave us no token — show error, don't redirect
        console.error("[Login] Backend returned 200 but no access_token:", result);
        window.HB.showToast("Login error: No session token received. Please try again.", "error");
      }

    } else {
      const errorData = await response.json();
      window.HB.showToast(errorData.detail || "Invalid credentials", "error");
    }

  } catch (error) {
    console.error("Login Fetch Error:", error);
    window.HB.showToast("An error occurred. Please try again.", "error");
  }
});
