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

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Login attempt with NIC:", nic);
      const response = await api.post("/voter-registration/api/v1/login", {
        nic,
        password,
      });

      const {
        userType: backendRole,
        message,
      } = response.data;

      const userType = backendRole;

      console.log("Login Response Debug:");
      console.log("Full response:", response.data);
      console.log("backendRole received:", backendRole);
      console.log("mapped userType:", userType);

      // No need to store anything - cookies are set by the server
      // Session info will be available via getSessionInfo()

      // Choose dashboard route per role
      const roleToPath: Record<string, string> = {
        admin: "/admin/dashboard",
        government_official: "/government-official/dashboard",
        election_commission: "/election-commission/dashboard",
        chief_occupant: "/chief-occupant/dashboard",
        household_member: "/household-member/dashboard",
        polling_station: "/polling-station",
      };

      if (userType === "householdMember" && message.includes("First-time")) {
        router.push("/change-password");
      } else {
        router.push(roleToPath[userType] ?? "/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert("Login failed: Invalid NIC or password.");
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
          <a href="/register" className="text-blue-600 underline">
            Register
          </a>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nic">National Identity Card Number</Label>
            <Input
              id="nic"
              placeholder="Enter your NIC number"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
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
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
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
