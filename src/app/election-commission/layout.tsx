import type { Metadata } from "next";
import { AdminHeader } from "@/src/app/election-commission/elections/components/elec-com-header";
import Providers from "../providers";

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
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <AdminHeader />
      <Providers>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </Providers>
    </div>
  );
}
