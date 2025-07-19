// src/lib/axios.ts
import axios from 'axios';
import { toast } from "@/lib/hooks/use-toast";

const api = axios.create({
  baseURL: "http://localhost:8080",
  // If backend ever sets auth cookies, enable the next line.
  // withCredentials: true,
})

/**
 * Helper to retrieve the latest auth token from localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// --------------------------------------------------
// REQUEST INTERCEPTOR
// --------------------------------------------------
// Always attach the most up-to-date bearer token before a request is sent.
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------
// Centralised error handler for RBAC-related errors.
// Shows toast then redirects.
// ‑ 401: Unauthenticated – redirect to login.
// ‑ 403: Forbidden – user lacks role/permission.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      // Clear stale auth details and redirect to login page.
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");

      toast({
        title: status === 401 ? "Unauthenticated" : "Forbidden",
        description: status === 401 ? "Please log in again." : "You lack permission to perform this action.",
        variant: "destructive",
      });

      // Prevent infinite redirect loops.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

if (typeof window !== "undefined") {
  const token = localStorage.getItem("token")
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }
}

export default api
