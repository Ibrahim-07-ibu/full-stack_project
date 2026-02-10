const API_BASE_URL = (() => {
    const hostname = window.location.hostname;

    // Check if running on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // For Vercel deployment, use relative paths
    // This is most reliable when using vercel.json rewrites
    return '';
})();

console.log('API Base URL:', API_BASE_URL);
