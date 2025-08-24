// src/lib/cookies.ts

interface SessionInfo {
  userId: string;
  userType: string;
  fullName: string;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
  } catch (error) {
    console.error(`Error reading cookie ${name}:`, error);
  }
  return null;
}

/**
 * Get session info from cookie
 */
export function getSessionInfo(): SessionInfo | null {
  try {
    const sessionCookie = getCookie('SESSION_INFO');
    if (!sessionCookie) {
      return null;
    }
    
    const decoded = decodeURIComponent(sessionCookie);
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (has session cookie)
 */
export function isAuthenticated(): boolean {
  const sessionInfo = getSessionInfo();
  const result = !!sessionInfo;
  return result;
}

/**
 * Get current user type from session cookie
 */
export function getUserType(): string | null {
  const session = getSessionInfo();
  return session?.userType || null;
}

/**
 * Get current user ID from session cookie
 */
export function getUserId(): string | null {
  const session = getSessionInfo();
  return session?.userId || null;
}

/**
 * Get current user's full name from session cookie
 */
export function getFullName(): string | null {
  const session = getSessionInfo();
  return session?.fullName || null;
}