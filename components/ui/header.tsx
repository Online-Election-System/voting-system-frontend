"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Vote,
  User,
  LogOut,
  Users,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/src/lib/auth";

type UserRole =
  | "admin"
  | "governmentOfficial"
  | "electionCommission"
  | "chiefOccupant"
  | "householdMember"
  | null;

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
  roles?: UserRole[]; // If undefined, shows for all roles
  requiresAuth?: boolean; // If true, only shows when logged in
  loggedOutOnly?: boolean; // If true, only shows when logged out
};

const navigationData: NavigationItem[] = [
  // Public navigation (shows for everyone)
  {
    label: "About",
    href: "/about",
    icon: FileText,
  },
  // Authentication-specific items
  // {
  //   label: "Sign In",
  //   href: "/signin",
  //   icon: User,
  //   loggedOutOnly: true,
  //   requiresAuth: false,
  // },
  // Election Commission specific navigation
  {
    label: "Dashboard",
    href: "/election-commission/dashboard",
    icon: Home,
    roles: ["electionCommission"],
    requiresAuth: true,
  },
  {
    label: "Elections",
    href: "/election-commission/elections",
    icon: Vote,
    roles: ["electionCommission"],
    requiresAuth: true,
  },
  {
    label: "Candidates",
    href: "/election-commission/candidates",
    icon: Users,
    roles: ["electionCommission"],
    requiresAuth: true,
  },
  // Admin specific items
  {
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: Settings,
    roles: ["admin"],
    requiresAuth: true,
  },
  // Government Official items
  {
    label: "Gov Dashboard",
    href: "/government-official/dashboard",
    icon: Home,
    roles: ["governmentOfficial"],
    requiresAuth: true,
  },
  // Chief Occupant items
  {
    label: "Household Dashboard",
    href: "/chief-occupant/dashboard",
    icon: Home,
    roles: ["chiefOccupant"],
    requiresAuth: true,
  },
  // Household Member items
  {
    label: "My Dashboard",
    href: "/household-member/dashboard",
    icon: Home,
    roles: ["householdMember"],
    requiresAuth: true,
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType") as UserRole;

      setIsLoggedIn(!!token);
      setUserRole(token ? userType : null);
      setIsLoading(false);

      console.log("Header Auth Status:", {
        token: !!token,
        userType,
        isLoggedIn: !!token,
      });
    };

    // Initial check
    checkAuthStatus();

    // Listen for storage changes (login/logout events)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Filter navigation items based on user role and auth status
  const getVisibleNavItems = () => {
    if (isLoading) return [];

    return navigationData.filter((item) => {
      // If item is for logged out users only
      if (item.loggedOutOnly && isLoggedIn) {
        return false;
      }

      // If item requires auth but user is not logged in
      if (item.requiresAuth && !isLoggedIn) {
        return false;
      }

      // If item is role-specific
      if (item.roles && item.roles.length > 0) {
        // User must be logged in and have the required role
        return isLoggedIn && item.roles.includes(userRole);
      }

      // Show public items
      return true;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <header className="bg-white dark:bg-gray-800 border-b p-4 text-black">
      <nav className="mx-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">
              {userRole === "electionCommission"
                ? "Election Admin"
                : "Election"}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <>
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-black dark:hover:text-white",
                    pathname === item.href
                      ? "text-black dark:text-white"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="gap-2 text-muted-foreground hover:text-black dark:hover:text-white"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ):(
                <Button
                  variant="outline"
                  className="gap-2 text-muted-foreground hover:text-black dark:hover:text-white"
                  onClick={() => router.push('/signin')}
                >
                  <LogOut className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="sm">
            Menu
          </Button>
        </div>
      </nav>
    </header>
  );
}
