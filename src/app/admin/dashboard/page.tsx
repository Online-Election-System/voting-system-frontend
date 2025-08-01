"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { getUserType, isAuthenticated } from "@/src/lib/cookies";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type RegistrationType = "government_official" | "election_commission" | "polling_station" | null;

interface RegistrationForm {
  fullName: string;
  nic: string;
  email: string;
  passwordHash: string;
}

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<RegistrationType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<RegistrationForm>({
    fullName: "",
    nic: "",
    email: "",
    passwordHash: ""
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated()) {
        console.log("User not authenticated, redirecting to login");
        router.push("/login");
        return;
      }

      const role = getUserType();
      console.log("User role from cookies:", role);
      
      if (!role) {
        console.log("No user role found, redirecting to login");
        router.push("/login");
        return;
      }

      setUserRole(role);
      setLoading(false);
    }
  }, [router]);

  const resetForm = () => {
    setFormData({
      fullName: "",
      nic: "",
      email: "",
      passwordHash: ""
    });
    setActiveForm(null);
    setMessage(null);
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEndpointUrl = (type: RegistrationType) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    switch (type) {
      case "government_official":
        return `${API_BASE_URL}/admin/api/v1/gov-official/register`;
      case "election_commission":
        return `${API_BASE_URL}/admin/api/v1/election-commission/register`;
      case "polling_station":
        return `${API_BASE_URL}/admin/api/v1/polling-station/register`;
      default:
        return "";
    }
  };

  const getRequestBody = (type: RegistrationType) => {
    switch (type) {
      case "government_official":
        return { official: formData };
      case "election_commission":
        return { commission: formData };
      case "polling_station":
        return { station: formData };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(getEndpointUrl(activeForm), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(getRequestBody(activeForm))
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setMessage({ type: 'success', text: result.message });
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getFormTitle = (type: RegistrationType) => {
    switch (type) {
      case "government_official":
        return "Register Government Official";
      case "election_commission":
        return "Register Election Commission User";
      case "polling_station":
        return "Register Polling Station User";
      default:
        return "";
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
            <p className="text-lg text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Admin Dashboard
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                Manage user registrations and system administration — all in one place.
              </p>
              {userRole && (
                <div className="mt-6 text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium capitalize">{userRole.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {!activeForm ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-center">Government Official</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Register new government officials who can manage elections
                    </p>
                    <Button 
                      onClick={() => setActiveForm("government_official")}
                      className="w-full"
                    >
                      Register Official
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-center">Election Commission</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Register election commission users for oversight and monitoring
                    </p>
                    <Button 
                      onClick={() => setActiveForm("election_commission")}
                      className="w-full"
                    >
                      Register Commission User
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-center">Polling Station</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Register polling station operators for election day management
                    </p>
                    <Button 
                      onClick={() => setActiveForm("polling_station")}
                      className="w-full"
                    >
                      Register Station User
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">{getFormTitle(activeForm)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {message && (
                    <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                      <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nic">NIC Number</Label>
                      <Input
                        id="nic"
                        type="text"
                        value={formData.nic}
                        onChange={(e) => handleInputChange('nic', e.target.value)}
                        required
                        placeholder="Enter NIC number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.passwordHash}
                        onChange={(e) => handleInputChange('passwordHash', e.target.value)}
                        required
                        placeholder="Enter password"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        className="flex-1"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={submitting}
                      >
                        {submitting ? 'Registering...' : 'Register User'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
