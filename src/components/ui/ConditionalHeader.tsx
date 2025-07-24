"use client"

import { usePathname } from "next/navigation";
import Header from "@/components/ui/Header"; // Your common header (HOME, ABOUT, CONTACT)
import { Header as DashboardHeader } from "@/components/ui/DashboardHeader"; // Your dashboard header

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Check if current path is dashboard or any dashboard-related page
  const isDashboard = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/VoterDashboard') ||
                     pathname?.includes('dashboard');

  // Show ONLY dashboard header on dashboard pages (NO common header)
  if (isDashboard) {
    return <DashboardHeader />;
  }

  // Show ONLY common header on all other pages
  return <Header />;
}