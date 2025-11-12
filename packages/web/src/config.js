/**
 * Application configuration
 */

/**
 * Get the backend API URL
 * In production, requires VITE_BACKEND_URL environment variable to be set
 * In development, automatically uses the same hostname as frontend with port 3001
 */
export const getBackendUrl = () => {
  // In production, require VITE_BACKEND_URL to be set explicitly
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_BACKEND_URL) {
      console.error('FATAL: VITE_BACKEND_URL environment variable is not set in production!');
      throw new Error('Backend URL not configured. Please set VITE_BACKEND_URL environment variable.');
    }
    return import.meta.env.VITE_BACKEND_URL;
  }

  // In development, use dynamic hostname with port 3001
  // This allows testing on local network (e.g., from iPhone)
  const hostname = window.location.hostname;
  const backendPort = '3001';
  return `http://${hostname}:${backendPort}`;
};

export const BACKEND_URL = getBackendUrl();
