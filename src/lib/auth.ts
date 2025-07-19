import api from "@/lib/axios";
import { toast } from "@/lib/hooks/use-toast";

/**
 * Logs the user out both client-side and server-side.
 * 1. Tell backend to invalidate refresh-token / session cookie.
 * 2. Clear localStorage so RoleGuard etc. pick up the change.
 * 3. Redirect to /login.
 */
export async function logout() {
  try {
    await api.post("/api/v1/logout", null, {
      validateStatus: (status) => status === 204 || status === 200,
    });
  } catch (err) {
    // ignore – maybe token already expired
  }

  // Ensure bearer header is cleared for this tab
  delete api.defaults.headers.common["Authorization"];

  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
  }

  toast({ title: "Logged out" });

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
