// Environment configuration for production and development
export const environment = {
  production: false,
  apiUrl: getApiUrl()
};

/**
 * Dynamically determine the API URL based on the environment.
 * In Railway deployment, uses RAILWAY_PUBLIC_DOMAIN environment variable.
 * In local development, uses localhost:8080.
 */
function getApiUrl(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return 'http://localhost:8080/api';
  }

  // Check for Railway backend environment variable (can be set at build time)
  const railwayBackendUrl = (window as any).__RAILWAY_BACKEND_URL__;
  if (railwayBackendUrl) {
    return railwayBackendUrl;
  }

  // For production deployment, check hostname
  const hostname = window.location.hostname;

  // If running on Railway (*.up.railway.app), construct backend URL
  // You'll need to set this manually or via environment variable
  if (hostname.includes('railway.app')) {
    // Option 1: Use environment variable passed at runtime
    const backendUrl = (window as any).__API_URL__;
    if (backendUrl) {
      return backendUrl;
    }

    // Option 2: Default Railway backend URL (you can set this after deployment)
    // Replace with your actual Railway backend URL
    return 'https://your-backend-name.up.railway.app/api';
  }

  // Default to localhost for local development
  return `http://${hostname}:8080/api`;
}
