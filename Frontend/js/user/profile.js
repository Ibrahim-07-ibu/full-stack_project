document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const userId = localStorage.getItem("user_id");
  if (!userId) {
  }
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const phoneInput = document.getElementById("profile-phone");
  const addressInput = document.getElementById("profile-address");
  const headerUserName = document.getElementById("header-user-name");
  const profileForm = document.querySelector(".profile-form");

  try {
    const response = await makeRequest(`/api/auth/profile`);
    if (response.ok) {
      const user = await response.json();
      nameInput.value = user.name;
      emailInput.value = user.email;
      phoneInput.value = user.phone;
      addressInput.value = user.address;
      headerUserName.textContent = user.name;
    } else {
      console.error("Failed to fetch profile");
      HB.showToast("Could not load profile details.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
  }

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {
      name: nameInput.value,
      email: emailInput.value.trim(),
      phone: phoneInput.value,
      address: addressInput.value,
    };
    try {
      const response = await makeRequest(`/api/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const user = await response.json();
        headerUserName.textContent = user.name;
        localStorage.setItem("user_name", user.name);
        HB.showToast("Profile updated successfully!", "success");
      } else {
        const error = await response.json();
        HB.showToast(error.detail || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      HB.showToast("An error occurred while updating profile.", "error");
    }
  });
  document.querySelector(".btn-secondary").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
});
