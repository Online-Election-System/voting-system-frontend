"use client"

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Users, Calendar, ArrowRight, Info } from "lucide-react"
import { toast } from "@/src/lib/hooks/use-toast"

type Election = {
  id: string
  title: string
  description: string
  startDate: {
    year: number
    month: number
    day: number
  }
  endDate: {
    year: number
    month: number
    day: number
  }
  enrollmentDeadline: {
    year: number
    month: number
    day: number
  }
  electionDate: {
    year: number
    month: number
    day: number
  }
  noOfCandidates: number
  electionType: string
  startTime: {
    hour: number
    minute: number
    second: number
  }
  endTime: {
    hour: number
    minute: number
    second: number
  }
  status: string
  enrolled: boolean
}

// Separate component that uses useSearchParams
function DashboardContent() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // UPDATED: Get voter information from logged-in user
  const getVoterInfo = () => {
    // Get userNic from localStorage (set during login)
    const userNic = localStorage.getItem("userNic")
    const userId = localStorage.getItem("userId")
    
    console.log("Getting voter info - userNic:", userNic, "userId:", userId) // Debug log
    
    return { userNic, userId }
  }

  // UPDATED: Fetch elections with proper voter identification
  const fetchElections = async () => {
    try {
      const { userNic, userId } = getVoterInfo()
      
      if (!userNic) {
        toast({
          title: "Authentication Error",
          description: "User NIC not found. Please login again.",
        })
        return
      }

      // UPDATED: Use userNic instead of hardcoded voterId
      const res = await fetch(`http://localhost:8080/api/v1/elections?voterNic=${userNic}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      // The API returns a direct array, not wrapped in ApiResponse
      const electionsData: Election[] = await res.json()
      setElections(electionsData)
    } catch (err: any) {
      console.error("Error fetching elections:", err)
      setError(err.message || "Unknown error")
      toast({
        title: "Error",
        description: "Failed to load elections data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchElections()

    // Check for enrollment success from URL and refresh data
    const enrolledId = searchParams.get("enrolled")
    if (enrolledId) {

      // Small delay to ensure backend has processed the enrollment
      setTimeout(() => {
        fetchElections()
      }, 1000)

      toast({
        title: "Enrollment Successful!",
        description: "Your dashboard has been updated with the latest information.",
        variant: "default",
      })
    }
  }, [searchParams])

  // Refresh data when component becomes visible (e.g., user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchElections()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="text-red-600 text-lg">Error loading elections: {error}</p>
          <Button
            onClick={fetchElections}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
          >
            Try Again
          </Button>
        </div>
      </div>
    )

  // Filter elections based on enrollment status
  const enrolledElections = elections.filter((e) => e.enrolled)
  const availableElections = elections.filter((e) => !e.enrolled && e.status === "Open for Enrollment")
  const totalElections = elections.length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome to Your Election Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your enrollments, view upcoming elections, and stay informed about your voting status — all in one
            place.
          </p>
        </div>
      </div>

      {/* Illustration */}
      <div className="w-full max-w-md mx-auto mt-10">
        <Image
          src="/election-illustration.svg"
          alt="Online Election Illustration"
          width={500}
          height={300}
          className="mx-auto"
        />
      </div>

      {/* View All Elections Button */}
      <div className="space-y-2 mt-10 text-center">
        {" "}

        {/* Added text-center here */}
        <Button variant="default" size="lg" asChild className="bg-black hover:bg-gray-800">
          <Link href="/enrollment/elections">View All Elections</Link>
        </Button>
        <p className="text-sm text-muted-foreground">Explore all available elections and enroll with a single click.</p>
      </div>
      
      {/* Dashboard Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Enrolled Elections</CardTitle>
            <Vote className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{enrolledElections.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              You are enrolled in {enrolledElections.length} upcoming election
              {enrolledElections.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Available Elections</CardTitle>
            <Calendar className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{availableElections.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              {availableElections.length} election{availableElections.length !== 1 ? "s" : ""} available for enrollment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Elections</CardTitle>
            <Users className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{totalElections}</div>
            <p className="text-sm text-gray-500 mt-1">
              Total of {totalElections} election{totalElections !== 1 ? "s" : ""} in the system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      {availableElections.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Ready to Participate?</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-base text-gray-600">
                You have {availableElections.length} election{availableElections.length !== 1 ? "s" : ""} waiting for
                your enrollment. Don't miss out!
              </p>
              <Button asChild className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6">
                <Link href="/enrollment/elections">
                  Enroll Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-6 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="h-12 w-96 bg-gray-200 rounded animate-pulse mb-4 mx-auto"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-10">
        <div className="w-full h-72 bg-gray-200 rounded animate-pulse mx-auto"></div>
      </div>

      <div className="space-y-2 mt-10 text-center">
        <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
        <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mx-auto"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
