"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import { getUserType, isAuthenticated } from "@/src/lib/cookies";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/src/lib/hooks/use-toast";
import {
  useTableSearch,
  SearchInput,
  FilterControls,
  FilterSelect,
  SortableHeader,
  ResultsSummary,
  TablePagination,
  FilterOption,
} from "@/components/shared/table";

type RegistrationType =
  | "government_official"
  | "election_commission"
  | "polling_station"
  | null;

interface RegistrationForm {
  userId: string;
  passwordHash: string;
  confirmPassword: string;
  division?: string; // Optional field for government officials
}

interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: [number, number]; // [seconds, fractional_seconds]
  isActive: boolean;
}

// Utility function to convert Ballerina time:Utc to JavaScript Date
const utcTimeToDate = (utcTime: [number, number]): Date => {
  try {
    const [seconds, fractionalSeconds] = utcTime;
    return new Date(seconds * 1000 + fractionalSeconds * 1000);
  } catch (error) {
    console.error("Error converting UTC time:", error);
    return new Date(); // Return current date as fallback
  }
};

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<RegistrationType>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const router = useRouter();

  const [formData, setFormData] = useState<RegistrationForm>({
    userId: "",
    passwordHash: "",
    confirmPassword: "",
    division: "",
  });

  const [passwordError, setPasswordError] = useState<string>("");

  // Table search and filter functionality with custom date sorting
  const {
    searchQuery,
    filters,
    sortConfig,
    currentPage,
    filteredData: baseFilteredData,
    hasActiveFilters,
    setSearchQuery,
    setCurrentPage,
    updateFilter,
    updateSort,
    clearFilters,
  } = useTableSearch(adminUsers, ["username", "role"], 10);

  // Custom sorting for dates - the hook now handles status filtering correctly
  const filteredData = useMemo(() => {
    if (sortConfig.field === "createdAt") {
      const sorted = [...baseFilteredData].sort((a, b) => {
        const dateA = utcTimeToDate(a.createdAt);
        const dateB = utcTimeToDate(b.createdAt);
        const comparison = dateA.getTime() - dateB.getTime();
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
      return sorted;
    }
    return baseFilteredData;
  }, [baseFilteredData, sortConfig]);

  // Recalculate pagination based on custom filtered data
  const startIndex = (currentPage - 1) * 10;
  const paginatedData = filteredData.slice(startIndex, startIndex + 10);
  const customTotalPages = Math.ceil(filteredData.length / 10);

  useEffect(() => {
    if (typeof window !== "undefined") {
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

  // Fetch admin users
  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      const response = await fetch(`${API_BASE_URL}/admin/api/v1/admins`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admin users: ${response.statusText}`);
      }

      const users = await response.json();
      setAdminUsers(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setUsersError(
        error instanceof Error ? error.message : "Failed to fetch admin users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update user active status
  const updateUserActiveStatus = async (userId: string, newStatus: boolean) => {
    setUpdatingUsers((prev) => new Set([...prev, userId]));

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

      const response = await fetch(
        `${API_BASE_URL}/admin/api/v1/user/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isActive: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Update local state optimistically
        setAdminUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isActive: newStatus } : user
          )
        );

        toast({
          title: "Status Updated",
          description: `User ${
            newStatus ? "activated" : "deactivated"
          } successfully`,
        });
      } else {
        // Handle specific error cases
        const errorMessage = result.message || "Failed to update user status";

        if (
          response.status === 404 ||
          errorMessage.toLowerCase().includes("not found")
        ) {
          toast({
            title: "User Not Found",
            description:
              "The user could not be found. Please refresh and try again.",
            variant: "destructive",
          });
          // Refresh the users list
          fetchAdminUsers();
        } else if (
          response.status === 401 ||
          errorMessage.toLowerCase().includes("unauthorized")
        ) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to update user status.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  };

  // Handle toggle switch change
  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateUserActiveStatus(userId, newStatus);
  };

  // Fetch admin users on component mount
  useEffect(() => {
    if (!loading && userRole) {
      fetchAdminUsers();
    }
  }, [loading, userRole]);

  const resetForm = () => {
    setFormData({
      userId: "",
      passwordHash: "",
      confirmPassword: "",
      division: "",
    });
    setActiveForm(null);
    setPasswordError("");
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    return (
      hasMinLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "passwordHash") {
      setPasswordError("");
    }
  };

  const getEndpointUrl = (type: RegistrationType) => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
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
    let requestData;

    switch (type) {
      case "government_official":
        // For government officials, send userId as nic and include optional division
        requestData = {
          nic: formData.userId,
          passwordHash: formData.passwordHash,
          division: formData.division || null,
        };
        return { official: requestData };

      case "election_commission":
        // For election commission, send userId as nic
        requestData = {
          nic: formData.userId,
          passwordHash: formData.passwordHash,
        };
        return { commission: requestData };

      case "polling_station":
        // For polling station, send userId as nic
        requestData = {
          nic: formData.userId,
          passwordHash: formData.passwordHash,
          division: formData.division || null,
        };
        return { station: requestData };

      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) return;

    if (!validatePassword(formData.passwordHash)) {
      setPasswordError("Password does not meet requirements");
      toast({
        title: "Validation Error",
        description: "Password does not meet requirements",
        variant: "destructive",
      });
      return;
    }

    if (formData.passwordHash !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setPasswordError("");

    try {
      const response = await fetch(getEndpointUrl(activeForm), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(getRequestBody(activeForm)),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({
          title: "Registration Successful",
          description: result.message || "User registered successfully",
        });
        resetForm();
        // Refresh the admin users list after successful registration
        fetchAdminUsers();
      } else {
        // Enhanced error handling for specific error cases
        const errorMessage = result.message || "Registration failed";

        // Check for duplicate username/user ID errors
        if (
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("already taken") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("user already registered") ||
          response.status === 409
        ) {
          // 409 Conflict status code
          toast({
            title: "Username Already Taken",
            description: `The User ID "${formData.userId}" is already registered. Please choose a different User ID.`,
            variant: "destructive",
          });
        } else if (
          errorMessage.toLowerCase().includes("invalid") &&
          errorMessage.toLowerCase().includes("password")
        ) {
          toast({
            title: "Invalid Password",
            description:
              "The password format is invalid. Please check the requirements.",
            variant: "destructive",
          });
        } else if (
          errorMessage.toLowerCase().includes("unauthorized") ||
          response.status === 401
        ) {
          toast({
            title: "Unauthorized",
            description:
              "You don't have permission to register users. Please contact your administrator.",
            variant: "destructive",
          });
        } else if (
          errorMessage.toLowerCase().includes("invalid") &&
          errorMessage.toLowerCase().includes("division")
        ) {
          toast({
            title: "Invalid Division",
            description:
              "The specified division is not valid. Please check and try again.",
            variant: "destructive",
          });
        } else {
          // Generic error fallback
          toast({
            title: "Registration Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
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

  const formatDate = (createdAt: [number, number]) => {
    // Convert Ballerina time:Utc to JavaScript Date
    const date = utcTimeToDate(createdAt);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleOptions: FilterOption[] = [
    { label: "Admin", value: "admin" },
    { label: "Government Official", value: "government_official" },
    { label: "Election Commission", value: "election_commission" },
    { label: "Polling Station", value: "polling_station" },
  ];

  const statusOptions: FilterOption[] = [
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const renderFormFields = () => {
    const password = formData.passwordHash;

    return (
      <>
        <div>
          <Label htmlFor="userId">
            User ID<span className="text-red-500">*</span>
          </Label>
          <Input
            id="userId"
            type="text"
            value={formData.userId}
            onChange={(e) => handleInputChange("userId", e.target.value)}
            required
            placeholder="Enter user ID"
          />
        </div>

        {(activeForm === "government_official" ||
          activeForm === "polling_station") && (
          <div>
            <Label htmlFor="division">Division (Optional)</Label>
            <Input
              id="division"
              type="text"
              value={formData.division || ""}
              onChange={(e) => handleInputChange("division", e.target.value)}
              placeholder="Enter division"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">
            Password<span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.passwordHash}
            onChange={(e) => handleInputChange("passwordHash", e.target.value)}
            required
            placeholder="Enter password"
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Password must contain:
            <ul className="list-disc pl-5">
              <li className={password.length >= 8 ? "text-green-500" : ""}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                One lowercase letter
              </li>
              <li className={/\d/.test(password) ? "text-green-500" : ""}>
                One number
              </li>
              <li
                className={/[@$!%*?&]/.test(password) ? "text-green-500" : ""}
              >
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password<span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            placeholder="Confirm password"
            required
          />
          {formData.confirmPassword &&
            password !== formData.confirmPassword && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="max-w-7xl w-full mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Admin Dashboard
              </h1>
            </div>

            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Manage Users</TabsTrigger>
                <TabsTrigger value="register">Register New Users</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <SearchInput
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search by username or role..."
                        />

                        <FilterControls
                          hasActiveFilters={hasActiveFilters}
                          onClearFilters={clearFilters}
                        >
                          <FilterSelect
                            label="Role"
                            value={filters.role || "all"}
                            options={roleOptions}
                            onChange={(value) => updateFilter("role", value)}
                          />
                          <FilterSelect
                            label="Status"
                            value={filters.isActive || "all"}
                            options={statusOptions}
                            onChange={(value) =>
                              updateFilter("isActive", value)
                            }
                          />
                        </FilterControls>
                      </div>

                      <ResultsSummary
                        hasActiveFilters={hasActiveFilters}
                        filteredCount={filteredData.length}
                        totalCount={adminUsers.length}
                        itemName="users"
                      />

                      {/* Table */}
                      {loadingUsers ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                      ) : usersError ? (
                        <Alert className="border-red-500">
                          <AlertDescription className="text-red-700">
                            {usersError}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>
                                    <SortableHeader
                                      field="username"
                                      currentSort={sortConfig}
                                      onSort={updateSort}
                                    >
                                      Username
                                    </SortableHeader>
                                  </TableHead>
                                  <TableHead>
                                    <SortableHeader
                                      field="role"
                                      currentSort={sortConfig}
                                      onSort={updateSort}
                                    >
                                      Role
                                    </SortableHeader>
                                  </TableHead>
                                  <TableHead>
                                    <SortableHeader
                                      field="createdAt"
                                      currentSort={sortConfig}
                                      onSort={updateSort}
                                    >
                                      Created At
                                    </SortableHeader>
                                  </TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginatedData.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      {hasActiveFilters
                                        ? "No users found matching your criteria"
                                        : "No admin users found"}
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  paginatedData.map((user) => (
                                    <TableRow
                                      key={user.id}
                                      className={
                                        !user.isActive
                                          ? "opacity-50 bg-muted/30"
                                          : ""
                                      }
                                    >
                                      <TableCell className="font-medium">
                                        {user.username}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="secondary">
                                          {user.role.replace("_", " ")}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {formatDate(user.createdAt)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={user.isActive}
                                            onCheckedChange={() =>
                                              handleStatusToggle(
                                                user.id,
                                                user.isActive
                                              )
                                            }
                                            disabled={updatingUsers.has(
                                              user.id
                                            )}
                                            aria-label={`Toggle ${user.username} status`}
                                            className="data-[state=checked]:bg-green-500"
                                          />
                                          <span className="text-sm text-muted-foreground">
                                            {updatingUsers.has(user.id)
                                              ? "Updating..."
                                              : user.isActive
                                              ? "Active"
                                              : "Inactive"}
                                          </span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>

                          <TablePagination
                            currentPage={currentPage}
                            totalPages={customTotalPages}
                            totalItems={filteredData.length}
                            itemsPerPage={10}
                            onPageChange={setCurrentPage}
                            itemName="users"
                          />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                {!activeForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-center">
                          Government Official
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Register new government officials for oversight and
                          monitoring
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
                        <CardTitle className="text-center">
                          Election Commission
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Register election commission users who can manage
                          elections
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
                        <CardTitle className="text-center">
                          Polling Station
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Register polling station operators for election day
                          management
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
                      <CardTitle className="text-center">
                        {getFormTitle(activeForm)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {renderFormFields()}

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
                            {submitting ? "Registering..." : "Register User"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
