// Production environment configuration
export const environment = {
  production: true,
  apiUrl: getApiUrl()
};

/**
 * Dynamically determine the API URL for production.
 */
function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // Check for Railway backend URL set at runtime
  const railwayBackendUrl = (window as any).__API_URL__;
  if (railwayBackendUrl) {
    return railwayBackendUrl;
  }

  // If running on Railway, you'll need to manually set this
  // after both services are deployed
  const hostname = window.location.hostname;
  if (hostname.includes('railway.app')) {
    return 'https://your-backend-name.up.railway.app/api';
  }

  // Fallback
  return '/api';
}
