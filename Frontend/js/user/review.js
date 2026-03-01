document.addEventListener("DOMContentLoaded", async () => {
  if (!window.checkAuth()) return;
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking_id");
  const providerId = urlParams.get("provider_id");
  if (!bookingId || !providerId) {
    HB.showToast("Missing booking or provider information.", "error");
    setTimeout(() => {
      window.location.href = "my-bookings.html";
    }, 2000);
    return;
  }

  const fetchBookingDetails = async () => {
    try {
      const response = await makeRequest(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const booking = await response.json();
        document.getElementById("display-provider-name").innerHTML =
          `<i class="fa-solid fa-user"></i> Provider: ${booking.provider_name}`;
        const icon = window.getServiceIcon(booking.service_name);
        document.getElementById("display-service-name").innerHTML =
          `<i class="fa-solid ${icon}"></i> ${booking.service_name}`;
        document.getElementById("display-booking-date").innerHTML =
          `<i class="fa-regular fa-calendar-check"></i> ${booking.date} at ${booking.time}`;
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };
  fetchBookingDetails();
  const form = document.querySelector(".review-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rating = document.querySelector(
      'input[name="rating"]:checked',
    )?.value;
    const comment = document.getElementById("feedback").value;
    if (!rating) {
      HB.showToast("Please select a rating.", "warning");
      return;
    }
    const reviewData = {
      booking_id: parseInt(bookingId),
      provider_id: parseInt(providerId),
      service_id: 1,
      rating: parseInt(rating),
      comment: comment,
    };

    try {
      const bookingResponse = await makeRequest(`/api/bookings/${bookingId}`);
      if (bookingResponse.ok) {
        const booking = await bookingResponse.json();
        reviewData.service_id = booking.service_id;
      }

      const response = await makeRequest(`/api/reviews`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      });
      if (response.ok) {
        HB.showToast("Review submitted successfully!", "success");
        setTimeout(() => {
          window.location.href = "all-completed.html";
        }, 2000);
      } else {
        const error = await response.json();
        HB.showToast(error.detail || "Failed to submit review", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      HB.showToast("An error occurred. Please try again.", "error");
    }
  });
});
