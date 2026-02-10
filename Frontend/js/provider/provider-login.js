document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/provider/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );
    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("provider_id", result.provider_id);
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("provider_name", result.full_name);
      alert("Login successful!");
      window.location.href = "provider-dashboard.html";
    } else {
      const errorData = await response.json();
      alert(`Login failed: ${errorData.detail || "Invalid credentials"}`);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred. Please try again.");
  }
});
