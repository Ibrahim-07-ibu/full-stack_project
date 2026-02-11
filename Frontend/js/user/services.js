document.addEventListener("DOMContentLoaded", async () => {
  const servicesGrid = document.getElementById("services-grid");
  if (!servicesGrid) return;
  try {
    const response = await makeRequest("/api/services");
    if (response.ok) {
      const services = await response.json();
      if (services.length > 0) {
        servicesGrid.innerHTML = "";
        services.forEach((service) => {
          const card = document.createElement("div");
          card.className = "service-card";
          let icon = "fa-wrench";
          const name = service.name.toLowerCase();
          if (name.includes("clean")) icon = "fa-broom";
          else if (name.includes("plumb")) icon = "fa-faucet";
          else if (name.includes("elect")) icon = "fa-plug";
          else if (name.includes("garden")) icon = "fa-seedling";
          else if (name.includes("paint")) icon = "fa-paint-roller";
          else if (name.includes("appliance")) icon = "fa-screwdriver-wrench";
          else if (name.includes("window")) icon = "fa-window-maximize";
          else if (name.includes("move")) icon = "fa-truck-moving";
          card.innerHTML = `
                        <div class="service-icon">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-price">Starting at ₹${service.price}</div>
                        <a href="book-service.html?service_id=${service.id}" class="btn-book">Book Now</a>
                    `;
          servicesGrid.appendChild(card);
        });
      } else {
        servicesGrid.innerHTML =
          '<p class="no-services">No services available at the moment.</p>';
      }
    } else {
      servicesGrid.innerHTML =
        '<p class="error">Failed to load services. Please try again later.</p>';
    }
  } catch (error) {
    console.error("Error loading services:", error);
    servicesGrid.innerHTML =
      '<p class="error">An error occurred while loading services.</p>';
  }
});
