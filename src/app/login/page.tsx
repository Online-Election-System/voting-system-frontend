"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/axios";
import { isAuthenticated } from "@/src/lib/cookies";
import Link from "next/link";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/voter-registration/api/v1/login", {
        nic,
        password,
      });

      const { userType: backendRole, message } = response.data;

      const roleToPath: Record<string, string> = {
        admin: "/admin/dashboard",
        government_official: "/government-official/dashboard",
        election_commission: "/election-commission/dashboard",
        chief_occupant: "/chief-occupant/dashboard",
        household_member: "/household-member/dashboard",
        polling_station: "/polling-station",
        verified_chief_occupant: "/enrollment/dashboard",  
        verified_household_member: "/enrollment/dashboard"
      };

      // First-time login for household members
      if (backendRole === "household_member" && message.includes("First-time")) {
        router.push("/login/change-password");
        return;
      }

      router.push(roleToPath[backendRole] ?? "/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-[5vw]">
      <CardHeader>
        <CardTitle className="text-xl font-black mx-auto">Login</CardTitle>
        <CardDescription className="mx-auto">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nic">National Identity Card Number / User ID</Label>
            <Input
              id="nic"
              placeholder="Enter your NIC number or user ID"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}