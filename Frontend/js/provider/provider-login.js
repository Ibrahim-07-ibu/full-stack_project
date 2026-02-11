document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
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

      localStorage.setItem("role", result.role);
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("provider_id", result.provider_id);
      localStorage.setItem("provider_name", result.name);
      localStorage.setItem("provider_email", result.email);

      alert(`Welcome back, ${result.name}!`);
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
