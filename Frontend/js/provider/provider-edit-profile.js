document.addEventListener("DOMContentLoaded", async () => {
  const providerId = localStorage.getItem("provider_id");
  const userId = localStorage.getItem("user_id");
  if (!providerId) {
    window.location.href = "provider-login.html";
    return;
  }
  updateNavBar();
  try {
    const response = await fetch(
      `http://localhost:8000/api/providers/${providerId}`,
      {
        headers: {
          "Provider-ID": providerId,
        },
      },
    );
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
      alert("Failed to load profile data");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("Failed to load profile data");
  }
  const form = document.getElementById("edit-profile-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const getVal = (id) => document.getElementById(id)?.value || "";
      const updatedData = {
        full_name: getVal("full_name"),
        email: getVal("email"),
        phone: getVal("phone"),
        address: getVal("address"),
        specialization: getVal("specialization"),
        years_experience: parseInt(getVal("years_experience")) || 0,
        bio: getVal("bio"),
      };
      try {
        const response = await fetch(
          `http://localhost:8000/api/providers/update/${providerId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Provider-ID": providerId,
            },
            body: JSON.stringify(updatedData),
          },
        );
        if (response.ok) {
          alert("Profile updated successfully!");
          localStorage.setItem("provider_name", updatedData.full_name);
          window.location.href = "provider-profile.html";
        } else {
          const error = await response.json();
          alert(`Error: ${error.detail || "Failed to update profile"}`);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred. Please try again.");
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
