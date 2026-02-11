const API_BASE_URL = (() => {
    const hostname = window.location.hostname;

    // Check if running on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // For Vercel production
    return window.location.origin;
})();

console.log('API Base URL configured:', API_BASE_URL || '(relative)');
