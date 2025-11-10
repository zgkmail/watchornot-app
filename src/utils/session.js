/**
 * Session management utility for handling session IDs
 * This is a workaround for third-party cookie blocking in modern browsers
 *
 * Usage:
 * 1. Call setupSessionManagement() once at app startup
 * 2. Use fetch() normally - session ID is handled automatically
 */

const SESSION_ID_KEY = 'watchornot_session_id';

/**
 * Get the stored session ID from localStorage
 */
export function getSessionId() {
  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to read session ID from localStorage:', error);
    return null;
  }
}

/**
 * Store the session ID in localStorage
 */
export function setSessionId(sessionId) {
  try {
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log('[Session] Stored session ID:', sessionId.substring(0, 20) + '...');
    }
  } catch (error) {
    console.warn('Failed to store session ID in localStorage:', error);
  }
}

/**
 * Setup automatic session management by intercepting fetch calls
 * This should be called once when the app starts
 */
export function setupSessionManagement() {
  // Store the original fetch
  const originalFetch = window.fetch;

  // Override fetch to automatically handle session IDs
  window.fetch = async function(url, options = {}) {
    const sessionId = getSessionId();

    // Add X-Session-ID header if we have one
    const enhancedOptions = { ...options };
    if (sessionId && typeof url === 'string' && url.includes('/api/')) {
      enhancedOptions.headers = {
        ...enhancedOptions.headers,
        'X-Session-ID': sessionId,
      };
      console.log('[Session] Added X-Session-ID to request:', url);
    }

    // Make the original fetch call
    const response = await originalFetch(url, enhancedOptions);

    // Clone the response so we can read it
    const clonedResponse = response.clone();

    // Try to extract session ID from response
    if (response.ok && typeof url === 'string' && url.includes('/api/')) {
      try {
        const data = await clonedResponse.json();
        if (data._sessionId) {
          setSessionId(data._sessionId);
        }
      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    // Return the original response (not the cloned one)
    return response;
  };

  console.log('[Session] Session management initialized');
}
