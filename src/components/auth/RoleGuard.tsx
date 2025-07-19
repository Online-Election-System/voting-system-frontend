"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Unauthorized from "./Unauthorized";
import { useToast } from "@/lib/hooks/use-toast";

interface RoleGuardProps {
  requiredRole: string;
  children: ReactNode;
}

/**
 * Simple client-side role guard that checks the `userType` stored in
 * `localStorage`. If the stored role does not match `requiredRole`, the user
 * is shown a 403 screen. For production you may want to tighten this (SSR
 * checks, token claims, etc.) but it is sufficient to prove RBAC wiring.
 */
export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<null | boolean>(null);

  const { toast } = useToast();

  useEffect(() => {
    const storedRole =
      typeof window !== "undefined" ? localStorage.getItem("userType") : null;

    if (storedRole === requiredRole) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      toast({
        title: "Access denied",
        description: `Your role does not permit viewing this page.`,
        variant: "destructive",
      });
    }
  }, [requiredRole, router, toast]);

   console.log("🔍 RoleGuard Debug:");
  console.log("Required role:", requiredRole);
  console.log("User type from localStorage:", localStorage.getItem("userType"));

  // You could return a spinner here instead of null while deciding.
  if (authorized === null) return null;

  return authorized ? <>{children}</> : <Unauthorized />;
}
