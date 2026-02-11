document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking_id");
  const providerId = urlParams.get("provider_id");
  if (!bookingId || !providerId) {
    alert("Missing booking or provider information.");
    window.location.href = "my-bookings.html";
    return;
  }

  const fetchBookingDetails = async () => {
    try {
      const response = await makeRequest(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const booking = await response.json();
        document.getElementById("display-provider-name").innerHTML =
          `<i class="fa-solid fa-user"></i> Provider: ${booking.provider_name}`;
        document.getElementById("display-service-name").innerHTML =
          `<i class="fa-solid fa-wrench"></i> ${booking.service_name}`;
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
      alert("Please select a rating.");
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
        alert("Review submitted successfully!");
        window.location.href = "my-bookings.html";
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to submit review"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
