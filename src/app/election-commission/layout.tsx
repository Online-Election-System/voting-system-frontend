import type { Metadata } from "next";
import Providers from "../providers";
import RoleGuard from "@/components/auth/RoleGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard | E-Voting System",
  description: "Admin dashboard for managing the e-voting system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="electionCommission">
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 pb-8">
        <Providers>
          <main>{children}</main>
        </Providers>
      </div>
    </RoleGuard>
  );
}
