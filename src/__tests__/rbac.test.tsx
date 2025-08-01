import React from "react";
import { render, screen } from "@testing-library/react";
import RoleGuard from "@/components/auth/RoleGuard";
import { describe } from "node:test";

jest.mock("@/lib/hooks/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

// Mock cookie util
jest.mock("../lib/cookies", () => ({
  getUserType: jest.fn(),
}));

jest.mock("@/components/auth/Unauthorized", () => {
  return function Unauthorized() {
    return <div>Unauthorized</div>;
  };
});

import { getUserType } from "../lib/cookies";

const roles = [
  ["admin", "/admin/dashboard"],
  ["government_official", "/government-official/dashboard"],
  ["election_commission", "/election-commission/dashboard"],
] as const;

describe("RoleGuard component", () => {
  it.each(roles)("allows %s role", (role) => {
    (getUserType as jest.Mock).mockReturnValue(role);

    render(
      <RoleGuard requiredRole={role}>
        <div>Allowed</div>
      </RoleGuard>
    );

    expect(screen.getByText("Allowed")).toBeInTheDocument();
  });

  it.each(roles)("blocks other roles for %s", (role) => {
    (getUserType as jest.Mock).mockReturnValue("someOtherRole");

    render(
      <RoleGuard requiredRole={role}>
        <div>ShouldNotSee</div>
      </RoleGuard>
    );

    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });
});
