"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Home,
  Vote,
  User,
  LogOut,
  Users,
  FileText,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { logout } from "@/src/lib/services/authService";
import { getUserType, isAuthenticated } from "@/src/lib/cookies";

type UserRole =
  | "admin"
  | "government_official"
  | "election_commission"
  | "chief_occupant"
  | "household_member"
  | "verified_chief_occupant"
  | "verified_household_member"
  | "polling_station"
  | null;

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
  roles?: UserRole[];
  requiresAuth?: boolean;
  loggedOutOnly?: boolean;
};

const navigationData: NavigationItem[] = [
  {
    label: "About",
    href: "/about",
    icon: FileText,
  },
  {
    label: "Dashboard",
    href: "/election-commission/dashboard",
    icon: Home,
    roles: ["election_commission"],
    requiresAuth: true,
  },
  {
    label: "Home",
    href: "/enrollment/dashboard",
    icon: Home,
    roles: ["verified_chief_occupant","verified_household_member"],
    requiresAuth: true,
  },
  {
    label: "Elections",
    href: "/enrollment/elections",
    icon: Vote,
    roles: ["election_commission","verified_chief_occupant","verified_household_member"],
    requiresAuth: true,
  },
  {
    label: "Profile",
    href: "/enrollment/profile",
    icon: Home,
    roles: ["verified_chief_occupant","verified_household_member"],
    requiresAuth: true,
  },
  
  {
    label: "Candidates",
    href: "/election-commission/candidates",
    icon: Users,
    roles: ["election_commission"],
    requiresAuth: true,
  },
  {
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: Settings,
    roles: ["admin"],
    requiresAuth: true,
  },
  {
    label: "Gov Dashboard",
    href: "/government-official/dashboard",
    icon: Home,
    roles: ["government_official"],
    requiresAuth: true,
  },

  //Chief Occupant items
  {
    label: "Household Dashboard",
    href: "/chief-occupant/dashboard",
    icon: Home,
    roles: ["chief_occupant"],
    requiresAuth: true,
  },

  {
    label: "Manage Household",
    href: "/chief-occupant/household-management",
    icon: Users,
    roles: ["chief_occupant"],
    requiresAuth: true,
  },

  
  // Household Member items
  {
    label: "My Dashboard",
    href: "/household-member/dashboard",
    icon: Home,
    roles: ["household_member"],
    requiresAuth: true,
  },
  
  
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(() => {
    const authenticated = isAuthenticated();
    const userType = getUserType() as UserRole;

    console.log("Header Auth Check:", {
      authenticated,
      userType,
      timestamp: new Date().toISOString(),
    });

    setIsLoggedIn(authenticated);
    setUserRole(authenticated ? userType : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial check
    checkAuthStatus();

    // Check every 500ms instead of 1000ms for more responsive updates
    const interval = setInterval(checkAuthStatus, 500);

    return () => {
      clearInterval(interval);
    };
  }, [checkAuthStatus]);

  const handleLogout = useCallback(async () => {
    console.log("Logout button clicked");

    // Immediately update state to show logging out
    setIsLoggedIn(false);
    setUserRole(null);

    // Perform actual logout
    await logout();
  }, []);

  // Filter navigation items based on user role and auth status
  const getVisibleNavItems = () => {
    if (isLoading) return [];

    return navigationData.filter((item) => {
      if (item.loggedOutOnly && isLoggedIn) {
        return false;
      }

      if (item.requiresAuth && !isLoggedIn) {
        return false;
      }

      if (item.roles && item.roles.length > 0) {
        return isLoggedIn && item.roles.includes(userRole);
      }

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
              {userRole === "election_commission"
                ? "Election Admin"
                : "Election"}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isLoading ? (
            <div className="p-1">
              <Loader2 className="mr-2 h-7 w-7 animate-spin" />
            </div>
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
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2 text-muted-foreground hover:text-black dark:hover:text-white"
                  onClick={() => router.push("/signin")}
                >
                  <User className="h-4 w-4" />
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
