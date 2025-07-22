"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>403 – Forbidden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You do not have permission to access this page.</p>
          <Button variant="outline" asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
