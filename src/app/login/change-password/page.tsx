"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/src/lib/axios";
import { isAuthenticated, getUserId, getUserType } from "@/src/lib/cookies";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getUserId());
      setUserType(getUserType());
    }
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[@$!%*?&]/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&)";
    }
    return null;
  };

  const getDashboardPath = (userType: string | null) => {
    const roleToPath: Record<string, string> = {
      admin: "/admin/dashboard",
      government_official: "/government-official/dashboard",
      election_commission: "/election-commission/dashboard",
      chief_occupant: "/chief-occupant/dashboard",
      household_member: "/household-member/dashboard",
      householdMember: "/household-member/dashboard",
      polling_station: "/polling-station",
      verified_chief_occupant: "/enrollment/dashboard",
      verified_household_member: "/enrollment/dashboard",
    };

    return userType ? roleToPath[userType] ?? "/dashboard" : "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!isAuthenticated()) {
      setError("You must be logged in to change your password");
      return;
    }

    if (!userId || !userType) {
      setError("Unable to verify user information");
      return;
    }

    setLoading(true);
    setError(null);
    setPasswordError(null);

    try {
      const response = await api.put(
        "/voter-registration/api/v1/change-password",
        {
          userId,
          userType,
          oldPassword: currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        alert("Password changed successfully!");
        router.push(getDashboardPath(userType));
      } else {
        setError(
          response.data?.message || "Password change failed. Please try again."
        );
      }
    } catch (err: any) {
      console.error("Password change error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Current password is incorrect or session expired");
        } else if (err.response.data?.code === "INVALID_PASSWORD") {
          setError(err.response.data.message);
        } else {
          setError(
            err.response.data?.message ||
              "Password change failed. Please try again."
          );
        }
      } else {
        setError("Password change failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Change Password
          </CardTitle>
          <CardDescription className="text-center">
            Create a new secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                required
                minLength={8}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Password must contain:
                <ul className="list-disc pl-5">
                  <li
                    className={newPassword.length >= 8 ? "text-green-500" : ""}
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(newPassword) ? "text-green-500" : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[a-z]/.test(newPassword) ? "text-green-500" : ""
                    }
                  >
                    One lowercase letter
                  </li>
                  <li
                    className={/\d/.test(newPassword) ? "text-green-500" : ""}
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[@$!%*?&]/.test(newPassword) ? "text-green-500" : ""
                    }
                  >
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !userId || !userType}
            >
              {loading ? "Processing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
