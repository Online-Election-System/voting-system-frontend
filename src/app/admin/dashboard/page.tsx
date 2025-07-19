"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ✅ You are seeing this page because RBAC allowed the <b>admin</b> role.
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
