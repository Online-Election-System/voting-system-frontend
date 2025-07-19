import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import api from "@/lib/axios";

// Mock lucide-react to avoid ES module issues
jest.mock('lucide-react', () => ({
  Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }),
  EyeOff: () => React.createElement('div', { 'data-testid': 'eye-off-icon' }),
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
  const roles = ["admin", "governmentOfficial", "electionCommission", "chiefOccupant", "householdMember"] as const;

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
    const { default: LoginForm } = await import("@/app/login/page");
    render(React.createElement(LoginForm));

    fireEvent.change(screen.getByLabelText(/National Identity Card Number/i), { target: { value: "123" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(window.localStorage.setItem).toHaveBeenCalledWith("token", "tok");
    expect(window.localStorage.setItem).toHaveBeenCalledWith("userType", role);
    expect(push).toHaveBeenCalled();
  });
});