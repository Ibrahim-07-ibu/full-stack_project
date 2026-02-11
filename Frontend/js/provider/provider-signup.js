document.addEventListener("DOMContentLoaded", async () => {
  const serviceSelect = document.getElementById("service");
  const form = document.getElementById("signup-form");

  try {
    const response = await makeRequest("/api/services");
    if (response.ok) {
      const services = await response.json();
      serviceSelect.innerHTML = '<option value="">Select Service</option>';
      services.forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
      });
    } else {
      console.error("Failed to fetch services");
      serviceSelect.innerHTML =
        '<option value="">Error loading services</option>';
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    serviceSelect.innerHTML =
      '<option value="">Error loading services</option>';
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const formData = {
      full_name: document.getElementById("fullname").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      dob: document.getElementById("dob").value,
      address: document.getElementById("address").value,
      service_id: parseInt(document.getElementById("service").value),
      years_experience: parseInt(document.getElementById("experience").value),
      specialization: document.getElementById("specialization").value,
      bio: document.getElementById("bio").value,
      password: password,

      id_proof: "pending_upload",
      certificate: "pending_upload",
    };
    try {
      const response = await makeRequest("/api/providers/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        alert("Registration successful! Redirecting to login...");
        window.location.href = "provider-login.html";
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
