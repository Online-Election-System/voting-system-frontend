import React from "react";
import { render, screen } from "@testing-library/react";
import RoleGuard from "@/components/auth/RoleGuard";

jest.mock("@/lib/hooks/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock("@/components/auth/Unauthorized", () => {
  return function Unauthorized() {
    return <div>Unauthorized</div>;
  };
});

const roles = [
  ["admin", "/admin/dashboard"],
  ["governmentOfficial", "/government-official/dashboard"],
  ["electionCommission", "/election-commission/dashboard"],
] as const;

describe("RoleGuard component", () => {
  it.each(roles)("allows %s role", (role) => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(role);
    
    render(
      <RoleGuard requiredRole={role}>
        <div>Allowed</div>
      </RoleGuard>
    );
    
    expect(screen.getByText("Allowed")).toBeInTheDocument();
  });

  it.each(roles)("blocks other roles for %s", (role) => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue("someOtherRole");
    
    render(
      <RoleGuard requiredRole={role}>
        <div>ShouldNotSee</div>
      </RoleGuard>
    );
    
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });
});