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
      const response = await api.post("/voter-registration/api/v1/login", {
        nic,
        password,
      });

      const { token, userType: backendRole, userId, fullName, message } = response.data;

      // Map backend snake_case roles to frontend camelCase roles
      // UPDATED: Added mapping for verified roles
      const roleMap: Record<string, string> = {
        admin: "admin",
        government_official: "governmentOfficial",
        election_commission: "electionCommission",
        chief_occupant: "chiefOccupant",
        household_member: "householdMember",
        verified_chief_occupant: "verifiedChiefOccupant",
        verified_household_member: "verifiedHouseholdMember"
      };

      const userType = roleMap[backendRole] ?? backendRole;

      console.log("Login Response Debug:");
      console.log("Full response:", response.data);
      console.log("backendRole received:", backendRole);
      console.log("mapped userType:", userType);
      console.log("userType type:", typeof backendRole);
      console.log("token received:", !!token);

      if (!token) throw new Error("Token missing in response");

      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", userId);
      localStorage.setItem("fullName", fullName);

      // The `nic` variable is the one the user typed into the form.
      localStorage.setItem("userNic", nic);

      // DEBUG: Verify what was actually stored
      console.log("After storage - what's in localStorage:");
      console.log("userType:", localStorage.getItem("userType"));
      console.log("token:", !!localStorage.getItem("token"));
      console.log("userNic", localStorage.getItem("userNic"));

      // Set default authorization header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // UPDATED: Modified dashboard route mapping to handle verified users
      const roleToPath: Record<string, string> = {
        admin: "/admin/dashboard",
        governmentOfficial: "/government-official/dashboard",
        electionCommission: "/election-commission/dashboard",
        chiefOccupant: "/chief-Occupant/dashboard",
        householdMember: "/household-member/dashboard",
        verifiedChiefOccupant: "/enrollment/dashboard",  // Verified chief occupants go to enrollment
        verifiedHouseholdMember: "/enrollment/dashboard"  // Verified household members go to enrollment
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
    <Card className="w-full max-w-md mx-auto">
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