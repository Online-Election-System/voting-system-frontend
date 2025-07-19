"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ElectionCommissionDashboard() {
  return (
    <RoleGuard requiredRole="electionCommission">
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Election Commission Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ✅ RBAC allowed the <b>electionCommission</b> role.
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
