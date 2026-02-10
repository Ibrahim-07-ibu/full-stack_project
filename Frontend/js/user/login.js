document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/unified_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      // Clear previous session data
      localStorage.clear();

      // Store session data based on role
      localStorage.setItem("role", result.role);
      if (result.access_token) {
        localStorage.setItem("access_token", result.access_token);
      }

      if (result.role === "user") {
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("user_name", result.name);
      } else if (result.role === "provider") {
        localStorage.setItem("provider_id", result.provider_id);
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("provider_name", result.name);
      } else if (result.role === "admin") {
        localStorage.setItem("admin_logged_in", "true");
      }

      alert(`Welcome back! Logging in as ${result.role}...`);

      // Handle path correction for Vercel/Local
      // The backend sends absolute paths starting with /Frontend/...
      // We might need to adjust them relative to current location or root
      window.location.href = result.redirect;
    } else {
      const errorData = await response.json();
      alert(`Login failed: ${errorData.detail || "Invalid credentials"}`);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred. Please try again.");
  }
});
