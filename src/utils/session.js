/**
 * Session management utility for handling session IDs
 * This is a workaround for third-party cookie blocking in modern browsers
 *
 * Usage:
 * 1. Call setupSessionManagement() once at app startup
 * 2. Use fetch() normally - session ID is handled automatically
 */

const SESSION_ID_KEY = 'watchornot_session_id';

// Track if we've shown localStorage warning
let localStorageWarningShown = false;

/**
 * Test if localStorage is available (fails in Safari Private Browsing)
 */
function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get the stored session ID from localStorage
 */
export function getSessionId() {
  try {
    if (!isLocalStorageAvailable()) {
      if (!localStorageWarningShown) {
        console.error('[Session] localStorage not available - session will not persist across page refreshes');
        console.error('[Session] If using Safari: Disable Private Browsing or enable "Prevent Cross-Site Tracking" in Settings');
        alert('⚠️ Session persistence disabled. Please disable Private Browsing mode or check your browser settings.');
        localStorageWarningShown = true;
      }
      return null;
    }
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (sessionId) {
      console.log('[Session] Retrieved session ID:', sessionId.substring(0, 20) + '...');
    }
    return sessionId;
  } catch (error) {
    console.error('[Session] Failed to read session ID:', error);
    return null;
  }
}

/**
 * Store the session ID in localStorage
 */
export function setSessionId(sessionId) {
  try {
    if (!isLocalStorageAvailable()) {
      console.error('[Session] Cannot store session ID - localStorage not available');
      return false;
    }
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log('[Session] ✅ Stored session ID:', sessionId.substring(0, 20) + '...');
      return true;
    }
  } catch (error) {
    console.error('[Session] Failed to store session ID:', error);
    return false;
  }
  return false;
}

/**
 * Setup automatic session management by intercepting fetch calls
 * This should be called once when the app starts
 */
export function setupSessionManagement() {
  // Detect browser
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isIOS = /iPhone|iPad|iPod/.test(ua);

  console.log('[Session] Browser detection:', {
    isSafari,
    isIOS,
    localStorageAvailable: isLocalStorageAvailable()
  });

  // Store the original fetch
  const originalFetch = window.fetch;

  // Override fetch to automatically handle session IDs
  window.fetch = async function(url, options = {}) {
    const sessionId = getSessionId();

    // Add X-Session-ID header if we have one
    const enhancedOptions = { ...options };
    if (sessionId && typeof url === 'string' && url.includes('/api/')) {
      // Ensure headers object exists
      if (!enhancedOptions.headers) {
        enhancedOptions.headers = {};
      }

      // Handle Headers object vs plain object
      if (enhancedOptions.headers instanceof Headers) {
        enhancedOptions.headers.set('X-Session-ID', sessionId);
      } else {
        enhancedOptions.headers['X-Session-ID'] = sessionId;
      }

      console.log('[Session] ✅ Added X-Session-ID to request:', url);
    } else if (typeof url === 'string' && url.includes('/api/')) {
      console.warn('[Session] ⚠️ No session ID available for request:', url);
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
          const stored = setSessionId(data._sessionId);
          if (!stored) {
            console.error('[Session] ❌ Failed to store session ID from response');
          }
        } else {
          console.warn('[Session] ⚠️ Response does not contain _sessionId:', url);
        }
      } catch (error) {
        // Ignore JSON parse errors for non-JSON responses
        console.debug('[Session] Response is not JSON (this is ok):', url);
      }
    }

    // Return the original response (not the cloned one)
    return response;
  };

  console.log('[Session] ✅ Session management initialized');

  // Show current session state
  const currentSessionId = getSessionId();
  if (currentSessionId) {
    console.log('[Session] 📌 Current session:', currentSessionId.substring(0, 20) + '...');
  } else {
    console.log('[Session] 📌 No existing session - will create on first API call');
  }
}
