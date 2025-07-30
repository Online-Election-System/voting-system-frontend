// src/lib/axios.ts
import axios from "axios";
import { toast } from "@/src/lib/hooks/use-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  withCredentials: true, // Enable cookies
});

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// --------------------------------------------------
// Centralised error handler for RBAC-related errors.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      toast({
        title: status === 401 ? "Unauthenticated" : "Forbidden",
        description:
          status === 401
            ? "Please log in again."
            : "You lack permission to perform this action.",
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

export default api;
