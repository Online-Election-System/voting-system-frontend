"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Unauthorized from "./Unauthorized";
import { useToast } from "@/src/lib/hooks/use-toast";
import { getUserType } from "@/src/lib/cookies";

interface RoleGuardProps {
  requiredRole: string;
  children: ReactNode;
}

/**
 * Client-side role guard that checks the userType from session cookie.
 */
export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<null | boolean>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedRole = getUserType();

    console.log("RoleGuard Debug:");
    console.log("Required role:", requiredRole);
    console.log("User type from session cookie:", storedRole);

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

  if (authorized === null) return null;

  return authorized ? <>{children}</> : <Unauthorized />;
}
