document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("Name").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          password,
        }),
      });
      if (response.ok) {
        alert("Registration successful! Redirecting to login...");
        window.location.href = "login.html";
      } else {
        let errorDetail = "Unknown error";
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          // If response is not JSON, use status text
          errorDetail = `Server Error: ${response.status} ${response.statusText}`;
        }
        alert(`Registration failed: ${errorDetail}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    }
  });
