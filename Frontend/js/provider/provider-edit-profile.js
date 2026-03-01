document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const providerId = localStorage.getItem("provider_id");
  const userId = localStorage.getItem("user_id");
  if (!providerId) {
  }
  updateNavBar();
  try {
    const response = await makeRequest(`/api/providers/${providerId}`);
    if (response.ok) {
      const p = await response.json();

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
      };
      setVal("full_name", p.full_name);
      setVal("email", p.email);
      setVal("phone", p.phone);
      setVal("address", p.address);
      setVal("specialization", p.specialization);
      setVal("years_experience", p.years_experience);
      setVal("bio", p.bio);
    } else {
      console.error("API Error:", response.status);
      HB.showToast("Failed to load profile data", "error");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    HB.showToast("Failed to load profile data", "error");
  }
  const form = document.getElementById("edit-profile-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const getVal = (id) => document.getElementById(id)?.value || "";
      const emailInput = document.getElementById("email");
      const email = emailInput.value.trim();

      // Basic Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        window.HB.showError("email", "Please enter a valid email.");
        return;
      }

      const updatedData = {
        full_name: getVal("full_name"),
        email: email,
        phone: getVal("phone"),
        address: getVal("address"),
        specialization: getVal("specialization"),
        years_experience: parseInt(getVal("years_experience")) || 0,
        bio: getVal("bio"),
      };
      try {
        const response = await makeRequest(
          `/api/providers/update/${providerId}`,
          {
            method: "PUT",
            body: JSON.stringify(updatedData),
          }
        );
        if (response.ok) {
          window.HB.showToast("Profile updated successfully!");
          localStorage.setItem("provider_name", updatedData.full_name);
          setTimeout(() => {
            window.location.href = "provider-profile.html";
          }, 1500);
        } else {
          const error = await response.json();
          window.HB.showToast(error.detail || "Failed to update profile", "error");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        window.HB.showToast("An error occurred. Please try again.", "error");
      }
    });
  }
});
function updateNavBar() {
  const providerName = localStorage.getItem("provider_name");
  if (providerName) {
    const nameEl = document.getElementById("nav-provider-name");
    const avatarEl = document.getElementById("nav-provider-avatar");
    if (nameEl) nameEl.textContent = providerName;
    if (avatarEl) {
      const initials = providerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      avatarEl.textContent = initials;
    }
  }
}
