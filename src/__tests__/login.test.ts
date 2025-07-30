import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import api from "../lib/axios";

// Mock lucide-react to avoid ES module issues
jest.mock("lucide-react", () => ({
  Eye: () => React.createElement("div", { "data-testid": "eye-icon" }),
  EyeOff: () => React.createElement("div", { "data-testid": "eye-off-icon" }),
  // Add other icons used in your login component
}));

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

// Mock router
const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Login flow", () => {
  const roles = [
    "admin",
    "government_official",
    "election_commission",
    "chief_occupant",
    "household_member",
    "polling_station",
  ] as const;

  // Mapping from role to expected dashboard route (mirrors component)
  const roleToPath: Record<string, string> = {
    admin: "/admin/dashboard",
    government_official: "/government-official/dashboard",
    election_commission: "/election-commission/dashboard",
    chief_occupant: "/chief-occupant/dashboard",
    household_member: "/household-member/dashboard",
    polling_station: "/polling-station",
  };

  beforeEach(() => {
    push.mockClear();
    jest.clearAllMocks();
  });

  it.each(roles)("stores data and redirects for %s", async (role) => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        token: "tok",
        userType: role,
        userId: "u1",
        fullName: "Test User",
        message: "Welcome",
      },
    });

    // Import and render the component
    const { default: LoginForm } = await import("../app/login/page");
    render(React.createElement(LoginForm));

    fireEvent.change(screen.getByLabelText(/National Identity Card Number/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "pw" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());

    // Since cookies are set by the backend, the component only redirects
    expect(push).toHaveBeenCalledWith(roleToPath[role]);
  });
});
