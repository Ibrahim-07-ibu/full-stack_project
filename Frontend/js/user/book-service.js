document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get("service_id") || 1;

  document.getElementById("service_id").value = serviceId;
  try {
    const response = await makeRequest(`/api/services/${serviceId}`);
    if (response.ok) {
      const service = await response.json();
      const finalPrice = Math.floor(service.price / 100) * 100 + 99;
      document.getElementById("display-service-name").textContent =
        service.name;
      document.getElementById("display-service-price").textContent =
        `Starting at ₹${finalPrice}`;
      const icon = window.getServiceIcon(service.name);
      document.querySelector(
        "#selected-service-display .service-icon",
      ).innerHTML = `<i class="fa-solid ${icon}"></i>`;
    }
  } catch (e) {
    console.log("Could not fetch service details");
  }
  // Set minimum date to today
  const dateInput = document.getElementById("date");
  const today = new Date().toISOString().split("T")[0];
  if (dateInput) {
    dateInput.setAttribute("min", today);
  }

  // Image Upload Logic
  const uploadWrapper = document.querySelector('.file-upload-wrapper');
  const fileInput = document.getElementById('issue_image');
  const placeholder = document.getElementById('upload-placeholder');
  const previewContainer = document.getElementById('image-preview');
  const previewImg = previewContainer.querySelector('img');
  const removeBtn = document.getElementById('remove-img');

  if (uploadWrapper && fileInput) {
    uploadWrapper.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          placeholder.style.display = 'none';
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      previewImg.src = '';
      placeholder.style.display = 'block';
      previewContainer.style.display = 'none';
    });
  }

  document
    .getElementById("booking-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const bookingDate = document.getElementById("date").value;

      // Validation check
      if (bookingDate < today) {
        window.HB.showError("date", "Please select a date from today onwards.");
        return;
      }

      const formData = new FormData();
      formData.append("service_id", document.getElementById("service_id").value);
      formData.append("address", document.getElementById("address").value);
      formData.append("city", document.getElementById("city").value);
      formData.append("pincode", document.getElementById("zipcode").value);
      formData.append("date", bookingDate);
      formData.append("time", document.getElementById("time").value);
      formData.append("instructions", document.getElementById("notes").value);

      const imageFile = document.getElementById("issue_image").files[0];
      if (imageFile) {
        formData.append("issue_image", imageFile);
      }

      try {
        const response = await fetch(`${window.API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${window.getToken()}`
          },
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          window.HB.showToast("Booking created successfully!");
          setTimeout(() => {
            window.location.href = "my-bookings.html";
          }, 1500);
        } else {
          const errorData = await response.json();
          window.HB.showToast(errorData.detail || "Booking failed", "error");
        }
      } catch (error) {
        console.error("Error booking:", error);
        window.HB.showToast("An error occurred. Please try again.", "error");
      }
    });
});
