document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const response = await makeRequest("/api/auth/unified_login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const result = await response.json();

      // Clear previous session data
      localStorage.clear();

      if (result.access_token) {
        window.setToken(result.access_token);
      }

      // Store session data based on role
      localStorage.setItem("role", result.role);

      if (result.role === "user") {
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("user_name", result.name);
        localStorage.setItem("user_email", result.email);
      } else if (result.role === "provider") {
        localStorage.setItem("provider_id", result.provider_id);
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("provider_name", result.name);
        localStorage.setItem("provider_email", result.email);
      } else if (result.role === "admin") {
        localStorage.setItem("admin_logged_in", "true");
      }

      alert(`Welcome back! Logging in as ${result.role}...`);
      window.location.href = result.redirect;
    } else {
      let errorDetail = "Invalid credentials";
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        // Since we changed backend to return access_token, check if we got one anyway (unlikely on error)
        errorDetail = errorData.detail || errorDetail;
      } else {
        // Likely a 405 or 404 HTML page from Vercel
        const text = await response.text();
        console.error("Non-JSON error response from server:", text);
        errorDetail = `Server Error: ${response.status} ${response.statusText}`;
      }
      alert(`Login failed: ${errorDetail}`);
    }
  } catch (error) {
    console.error("Login Fetch Error:", error);
    alert(`An error occurred: ${error.message}`);
  }
});
