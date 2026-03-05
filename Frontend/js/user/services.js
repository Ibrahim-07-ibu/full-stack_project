let allServices = [];

document.addEventListener("DOMContentLoaded", async () => {
  const servicesGrid = document.getElementById("services-grid");
  const searchInput = document.getElementById("search-input");

  if (!servicesGrid) return;

  await loadServices();

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterServices(searchTerm);
    });
  }
});

async function loadServices() {
  const servicesGrid = document.getElementById("services-grid");
  window.HB.showThemedLoading("#services-grid", "Fetching available services...");
  try {
    const response = await makeRequest("/api/services");
    if (response.ok) {
      allServices = await response.json();
      displayServices(allServices);
    } else {
      servicesGrid.innerHTML =
        '<p class="error">Failed to load services. Please try again later.</p>';
    }
  } catch (error) {
    console.error("Error loading services:", error);
    servicesGrid.innerHTML =
      '<p class="error">An error occurred while loading services.</p>';
  } finally {
    window.HB.hideThemedLoading("#services-grid");
  }
}

function displayServices(services) {
  const servicesGrid = document.getElementById("services-grid");

  if (services.length > 0) {
    servicesGrid.innerHTML = "";
    services.forEach((service) => {
      const card = document.createElement("div");
      card.className = "service-card";

      const icon = window.getServiceIcon(service.name);

      const finalPrice = Math.floor(service.price / 100) * 100 + 99;
      const mrpPrice = Math.ceil((finalPrice * 1.4) / 50) * 50 - 1;

      card.innerHTML = `
        <div class="service-icon">
          <i class="fa-solid ${icon}"></i>
        </div>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        
        <div class="pricing-wrapper">
          <span class="mrp-price">₹${mrpPrice}</span>
          <div class="final-price-container">
            <span class="final-price">₹${finalPrice}</span>
            <span class="offer-badge">Launch Offer</span>
          </div>
        </div>
        
        <a href="book-service.html?service_id=${service.id}" class="btn-book">Book Now</a>
      `;
      servicesGrid.appendChild(card);
    });
  } else {
    servicesGrid.innerHTML =
      '<p class="no-services">No services found matching your search.</p>';
  }
}

function filterServices(searchTerm) {
  if (!searchTerm) {
    displayServices(allServices);
    return;
  }

  const filteredServices = allServices.filter((service) => {
    const nameMatch = service.name.toLowerCase().includes(searchTerm);
    const descriptionMatch = service.description.toLowerCase().includes(searchTerm);
    return nameMatch || descriptionMatch;
  });

  displayServices(filteredServices);
}
