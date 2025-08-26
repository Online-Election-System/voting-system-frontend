"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserMinus, UserPlus, UserCog, Loader2, BarChart3 } from "lucide-react"
import Link from "next/link"

// API base URL - adjust as needed
const API_BASE_URL = "http://localhost:8080/api/v1"

interface CountsData {
  pendingAddMemberRequests: number
  pendingUpdateMemberRequests: number
  pendingReviewRegistrations: number
  pendingRemovalRequests: number
  totalEligibleVoters: number
  totalHouseholds: number
}

export default function Dashboard() {
  const [counts, setCounts] = useState<CountsData>({
    pendingAddMemberRequests: 0,
    pendingUpdateMemberRequests: 0,
    pendingReviewRegistrations: 0,
    pendingRemovalRequests: 0,
    totalEligibleVoters: 0,
    totalHouseholds: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllCounts()
  }, [])

  const fetchAllCounts = async () => {
    try {
      setLoading(true)
      setError(null)
      // Make all API calls in parallel
      const [
        addMemberResponse,
        registrationResponse,
        removalResponse,
        updatememberResponse,
        eligibleVotersResponse,
        householdsResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/add-member-requests/counts`).catch((e) => ({ ok: false, error: e })),
        fetch(`${API_BASE_URL}/registrations/counts`).catch((e) => ({ ok: false, error: e })),
        fetch(`${API_BASE_URL}/removal-requests/counts`).catch((e) => ({ ok: false, error: e })),
        fetch(`${API_BASE_URL}/update-member-requests/counts`).catch((e) => ({ ok: false, error: e })),
        fetch(`${API_BASE_URL}/eligible-voters/count`).catch((e) => ({ ok: false, error: e })),
        fetch(`${API_BASE_URL}/households`).catch((e) => ({ ok: false, error: e })),
      ])

      const newCounts: CountsData = {
        pendingAddMemberRequests: 0,
        pendingUpdateMemberRequests: 0, // Keep as 0 since endpoint not provided
        pendingReviewRegistrations: 0,
        pendingRemovalRequests: 0,
        totalEligibleVoters: 0,
        totalHouseholds: 0
      }

      // Process add member requests counts
      if (addMemberResponse.ok) {
        try {
          const addMemberData = await (addMemberResponse as Response).json()
          newCounts.pendingAddMemberRequests = addMemberData.pending || 0
        } catch (e) {
          console.error("Error parsing add member counts:", e)
        }
      } else {
        console.error("Failed to fetch add member counts")
      }

      // Process registration counts
      if (registrationResponse.ok) {
        try {
          const registrationData = await (registrationResponse as Response).json()
          newCounts.pendingReviewRegistrations = registrationData.pending || 0
        } catch (e) {
          console.error("Error parsing registration counts:", e)
        }
      } else {
        console.error("Failed to fetch registration counts")
      }

      // Process removal requests counts
      if (removalResponse.ok) {
        try {
          const removalData = await (removalResponse as Response).json()
          newCounts.pendingRemovalRequests = removalData.pending || 0
        } catch (e) {
          console.error("Error parsing removal counts:", e)
        }
      } else {
        console.error("Failed to fetch removal counts")
      }

      // Process update member requests counts
      if (updatememberResponse.ok) {
        try {
          const updateMemberData = await (updatememberResponse as Response).json()
          newCounts.pendingUpdateMemberRequests = updateMemberData.pending || 0
        } catch (e) {
          console.error("Error parsing removal counts:", e)
        }
      } else {
        console.error("Failed to fetch removal counts")
      }

      if (eligibleVotersResponse.ok) {
        try {
          const eligibleVotersData = await (eligibleVotersResponse as Response).json()
          newCounts.totalEligibleVoters = eligibleVotersData.count || 0
        } catch (e) {
          console.error("Error parsing eligible voters count:", e)
        }
      } else {
        console.error("Failed to fetch eligible voters count")
      }

      // Process households count
      if (householdsResponse.ok) {
        try {
          const householdsData = await (householdsResponse as Response).json()
          newCounts.totalHouseholds = householdsData.length || 0
        } catch (e) {
          console.error("Error parsing households count:", e)
        }
      } else {
        console.error("Failed to fetch households count")
      }

      setCounts(newCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch counts")
      console.error("Error fetching counts:", err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate total pending requests
  const totalPendingRequests =
    counts.pendingAddMemberRequests +
    counts.pendingUpdateMemberRequests +
    counts.pendingReviewRegistrations +
    counts.pendingRemovalRequests

  const stats = [
    {
      title: "Total Eligible Voters",
      value: loading ? "..." : counts.totalEligibleVoters.toString(),
      description: "Active eligible voters in division",
      icon: Users,
    },
    {
      title: "Total Households",
      value: loading ? "..." : counts.totalHouseholds.toString(),
      description: "Registered households",
      icon: Users,
    },
    {
      title: "Total Pending Requests",
      value: loading ? "..." : totalPendingRequests.toString(),
      description: "Across all categories",
      icon: UserCog,
    },
    {
      title: "Analytics & Reports",
      value: loading ? "..." : "View",
      description: "Comprehensive insights & metrics",
      icon: BarChart3,
      isLink: true,
      href: "/government-official/analytics"
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      {" "}
      {/* Added gray background */}
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1> {/* Changed to gray-900 */}
          <p className="text-gray-600 mt-2">Monitor and manage voter registrations in your division</p>{" "}
          {/* Changed to gray-600 */}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Warning: Could not fetch some pending counts. Showing available data.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            stat.isLink ? (
              <Link key={index} href={stat.href || "#"}>
                <Card className="bg-white text-gray-900 shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card key={index} className="bg-white text-gray-900 shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <stat.icon className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          {" "}
          {/* Changed to bg-white, text-gray-900, border-gray-200, shadow-md */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold"> Actions</CardTitle>
            <CardDescription className="text-gray-600">Common tasks and shortcuts</CardDescription>{" "}
            {/* Changed to gray-600 */}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                href="/government-official/registrations"
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out" // Changed bg-white, text-gray-900, border-gray-200, hover:bg-gray-50
              >
                <UserCheck className="w-8 h-8 mb-2 text-primary group-hover:text-primary-foreground" />
                <span className="font-medium text-lg text-center">Review Registrations</span>
                {loading ? (
                  <div className="mt-2 flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-gray-500" /> {/* Changed to gray-500 */}
                    <span className="text-xs text-gray-500">Loading...</span> {/* Changed to gray-500 */}
                  </div>
                ) : counts.pendingReviewRegistrations > 0 ? (
                  <Badge className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {counts.pendingReviewRegistrations} Pending
                  </Badge>
                ) : null}
              </Link>
              <Link
                href="/government-official/removal-requests"
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out" // Changed bg-white, text-gray-900, border-gray-200, hover:bg-gray-50
              >
                <UserMinus className="w-8 h-8 mb-2 text-primary group-hover:text-primary-foreground" />
                <span className="font-medium text-lg text-center">Handle Removals</span>
                {loading ? (
                  <div className="mt-2 flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-gray-500" /> {/* Changed to gray-500 */}
                    <span className="text-xs text-gray-500">Loading...</span> {/* Changed to gray-500 */}
                  </div>
                ) : counts.pendingRemovalRequests > 0 ? (
                  <Badge className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {counts.pendingRemovalRequests} Pending
                  </Badge>
                ) : null}
              </Link>
              <Link
                href="/government-official/add-members"
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out" // Changed bg-white, text-gray-900, border-gray-200, hover:bg-gray-50
              >
                <UserPlus className="w-8 h-8 mb-2 text-primary group-hover:text-primary-foreground" />
                <span className="font-medium text-lg text-center">Add New Member</span>
                {loading ? (
                  <div className="mt-2 flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-gray-500" /> {/* Changed to gray-500 */}
                    <span className="text-xs text-gray-500">Loading...</span> {/* Changed to gray-500 */}
                  </div>
                ) : counts.pendingAddMemberRequests > 0 ? (
                  <Badge className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {counts.pendingAddMemberRequests} Pending
                  </Badge>
                ) : null}
              </Link>
              <Link
                href="/government-official/update-members"
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out" // Changed bg-white, text-gray-900, border-gray-200, hover:bg-gray-50
              >
                <UserCog className="w-8 h-8 mb-2 text-primary group-hover:text-primary-foreground" />
                <span className="font-medium text-lg text-center">Update Member</span>
                {loading ? (
                  <div className="mt-2 flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-gray-500" /> {/* Changed to gray-500 */}
                    <span className="text-xs text-gray-500">Loading...</span> {/* Changed to gray-500 */}
                  </div>
                ) : counts.pendingUpdateMemberRequests > 0 ? (
                  <Badge className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {counts.pendingUpdateMemberRequests} Pending
                  </Badge>
                ) : null}
              </Link>
              <Link
                href="/government-official/households"
                className="group flex flex-col items-center justify-center p-6 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out" // Changed bg-white, text-gray-900, border-gray-200, hover:bg-gray-50
              >
                <Users className="w-8 h-8 mb-2 text-primary group-hover:text-primary-foreground" />
                <span className="font-medium text-lg text-center">Manage Households</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}