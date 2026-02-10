// API Configuration
// This file centralizes the backend API URL configuration
// It automatically detects the environment and sets the appropriate base URL

const API_BASE_URL = (() => {
    // Check if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // For production (Vercel or other hosting), use relative paths
    // The vercel.json rewrites will handle routing /api/* to the backend
    return '';
})();

console.log('API Base URL:', API_BASE_URL);
