"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/src/lib/axios";
import { getUserId, getUserType, isAuthenticated } from "@/src/lib/cookies";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check authentication first
      if (!isAuthenticated()) {
        console.log("User not authenticated, redirecting to login");
        setError("Authentication required. Please log in.");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const id = getUserId();
      const type = getUserType();

      console.log("Session data from cookies:", { userId: id, userType: type });

      if (!id || !type) {
        console.log("Session data incomplete, redirecting to login");
        setError("Invalid session. Please log in again.");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      setUserId(id);
      setUserType(type);
      setPageLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    // Validate password strength (optional - add your requirements)
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    // Double-check authentication before API call
    if (!isAuthenticated() || !userId || !userType) {
      setError("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.put("/voter-registration/api/v1/changepassword", {
        userId,
        userType,
        oldPassword,
        newPassword,
      });

      console.log("Password change response:", response.data);
      alert("Password changed successfully!");
      
      // Redirect based on user type
      const roleToPath: Record<string, string> = {
        admin: "/admin/dashboard",
        government_official: "/government-official/dashboard",
        election_commission: "/election-commission/dashboard",
        chief_occupant: "/chief-occupant/dashboard",
        household_member: "/household-member/dashboard",
        householdMember: "/household-member/dashboard",
        polling_station: "/polling-station",
      };

      router.push(roleToPath[userType] ?? "/dashboard");
    } catch (err: any) {
      console.error("Password change error:", err);
      
      // Handle specific error cases
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }
      
      if (err.response?.status === 400) {
        alert("Invalid old password or password requirements not met.");
      } else {
        alert("Password change failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Change Password</CardTitle>
          <CardDescription className="text-center">
            Update your password to keep your account secure
          </CardDescription>
          {userType && (
            <div className="text-sm text-center text-muted-foreground mt-2">
              Account type: <span className="font-medium capitalize">{userType.replace('_', ' ')}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
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
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !userId || !userType}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => {
                const roleToPath: Record<string, string> = {
                  admin: "/admin/dashboard",
                  government_official: "/government-official/dashboard", 
                  election_commission: "/election-commission/dashboard",
                  chief_occupant: "/chief-occupant/dashboard",
                  household_member: "/household-member/dashboard",
                  householdMember: "/household-member/dashboard",
                  polling_station: "/polling-station",
                };
                router.push(roleToPath[userType!] ?? "/dashboard");
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
