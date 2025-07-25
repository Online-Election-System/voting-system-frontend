// src/services/authService.ts

import { toast } from "@/src/lib/hooks/use-toast";
import api from "../axios";
import { getSessionInfo, isAuthenticated } from "../cookies";

// Type definitions
export interface Voter {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth: string;
}

export interface VoterLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  userType: string;
  fullName: string;
  message: string;
}

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Register a new voter
export const registerVoter = async (voterData: Voter): Promise<Voter> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/voter-registration/api/v1/voters/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(voterData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Registration failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred during registration");
  }
};

// Login a voter
export const loginVoter = async (
  credentials: VoterLogin
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/voter-registration/api/v1/voters/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Login failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred during login");
  }
};

// Check if user is authenticated using cookies
export { isAuthenticated };

// Get session info from cookies
export { getSessionInfo };

/**
 * Immediately clear all auth-related cookies on the frontend
 */
function clearAuthCookiesImmediately() {
  if (typeof window === "undefined") return;
  
  // Clear cookies by setting them to expire
  const cookiesToClear = ['AUTH_TOKEN', 'SESSION_INFO', 'SESSION'];
  
  cookiesToClear.forEach(cookieName => {
    // Clear for current path
    document.cookie = `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
    // Clear for root domain (in case of subdomain issues)
    document.cookie = `${cookieName}=; Path=/; Max-Age=0; Domain=localhost; SameSite=Lax`;
  });
  
  console.log("Frontend cookies cleared immediately");
}

/**
 * Logs the user out both client-side and server-side.
 * 1. Tell backend to clear auth cookies
 * 2. Redirect to /login
 */
export async function logout() {
  clearAuthCookiesImmediately();
  
  try {
    await api.post("/voter-registration/api/v1/logout", null, {
      validateStatus: (status) => status === 204 || status === 200,
    });
  } catch (err) {
    console.warn("Logout request failed:", err);
    // Continue with logout even if request fails
  }

  toast({ title: "Logged out" });

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
