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
      const fullUrl = new URL(`${API_BASE_URL}/api/auth/register`, window.location.origin).href;
      console.log(`Attempting registration at: ${fullUrl}`);
      const response = await fetch(fullUrl, {
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
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            errorDetail = `Failed to parse error JSON: ${response.status} ${response.statusText}`;
          }
        } else {
          // Response is not JSON (likely HTML error from Vercel)
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          errorDetail = `Server Error: ${response.status} ${response.statusText}. Check console for details.`;
        }
        alert(`Registration failed: ${errorDetail}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert(`An error occurred: ${error.message}`);
    }
  });
