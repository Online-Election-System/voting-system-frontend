"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/src/lib/hooks/use-toast"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Calendar, Users, Clock, Vote, CheckCircle, AlertCircle, Eye } from "lucide-react"

interface Election {
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
function ElectionsContent() {
  const [elections, setElections] = useState<Election[]>([])
  const [enrolledElections, setEnrolledElections] = useState<Set<string>>(new Set())
  const searchParams = useSearchParams()
  const router = useRouter()

  // Helper function to convert date object to Date
  const convertToDate = (dateObj: { year: number; month: number; day: number }) => {
    return new Date(dateObj.year, dateObj.month - 1, dateObj.day)
  }

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
      
      console.log("Fetching elections for voter NIC:", userNic) // Debug log

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const result = await res.json()

      console.log("Elections API response:", result) // Debug log

      if (Array.isArray(result)) {
        setElections(result)

        // Update enrolled elections set based on the enrolled field from backend
        const enrolledIds = result.filter((e) => e.enrolled).map((e) => e.id)
        setEnrolledElections(new Set(enrolledIds))
        
        console.log("Enrolled elections for this voter:", enrolledIds) // Debug log
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load elections.",
        })
      }
    } catch (err) {
      console.error("Error fetching elections:", err)
      toast({
        title: "Network Error",
        description: "Unable to connect to the server.",
      })
    }
  }

  useEffect(() => {
    fetchElections()

    // Check for enrollment success from redirect and refresh data
    const enrolledId = searchParams.get("enrolled")
    if (enrolledId) {
      // Refresh the elections data to get updated enrollment status
      setTimeout(() => {
        fetchElections()
      }, 1000) // Small delay to ensure backend has processed the enrollment

      toast({
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in the election.",
        variant: "default",
      })
    }
  }, [searchParams])

  // Handle enrollment navigation
  const handleEnroll = (electionId: string) => {
    router.push(`/enrollment/elections/${electionId}/verify`)
  }

  // Handle navigation to candidate details page
  const handleViewCandidates = (electionId: string) => {
    router.push(`/enrollment/elections/${electionId}`)
  }

  // Handle navigation to election details page
  const handleViewDetails = (electionId: string) => {
    router.push(`/enrollment/elections/${electionId}`)
  }

  // Badge display based on enrollment status and election status
  const getStatusBadge = (election: Election) => {
    if (election.enrolled) {
      return (
        <Badge className="bg-black text-white hover:bg-gray-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Enrolled
        </Badge>
      )
    }
    if (election.status === "Open for Enrollment") {
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-700 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Open for Enrollment
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Coming Soon
      </Badge>
    )
  }

  // Check if enrollment is still open for this user
  const isEnrollmentOpen = (election: Election) => {
    if (election.enrolled) return false // Already enrolled
    if (election.status !== "Open for Enrollment") return false // Not open for enrollment

    const today = new Date()
    const enrollmentDeadline = convertToDate(election.enrollmentDeadline)
    return today <= enrollmentDeadline // Check if deadline hasn't passed
  }

  // Sort elections: enrolled first, then open for enrollment, then coming soon
  const sortedElections = [...elections].sort((a, b) => {
    const priority = (e: Election) => {
      if (e.enrolled) return 0 // Enrolled elections first
      if (e.status === "Open for Enrollment") return 1 // Open elections second
      return 2 // Coming soon elections last
    }
    return priority(a) - priority(b)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-lg">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Elections</h1>
              <p className="text-gray-600 mt-1">View all available elections and manage your enrollment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {elections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Elections Available</h3>
            <p className="text-gray-600">There are currently no elections to display.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Election</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Election Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Enrollment Deadline</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Candidates</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedElections.map((election) => (
                      <tr key={election.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{election.title}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{election.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {election.electionType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(convertToDate(election.electionDate), "PPP")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {format(convertToDate(election.enrollmentDeadline), "PPP")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Users className="w-4 h-4 text-gray-400" />
                            {election.noOfCandidates}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(election)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {election.enrolled ? (
                              <Button
                                size="sm"
                                onClick={() => handleViewCandidates(election.id)}
                                className="bg-black hover:bg-gray-800 text-white"
                              >
                                View Candidates
                              </Button>
                            ) : isEnrollmentOpen(election) ? (
                              <Button
                                size="sm"
                                onClick={() => handleEnroll(election.id)}
                                className="bg-black hover:bg-gray-800 text-white"
                              >
                                Enroll
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(election.id)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {sortedElections.map((election) => (
                <div key={election.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{election.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{election.description}</p>
                    </div>
                    <div className="ml-4">{getStatusBadge(election)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Election Date</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {format(convertToDate(election.electionDate), "PPP")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Enrollment Deadline</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {format(convertToDate(election.enrollmentDeadline), "PPP")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Candidates</span>
                      </div>
                      <div className="font-medium text-gray-900">{election.noOfCandidates}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-gray-600">Type</div>
                      <div className="font-medium text-gray-900">{election.electionType}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {election.enrolled ? (
                      <Button
                        size="sm"
                        onClick={() => handleViewCandidates(election.id)}
                        className="bg-black hover:bg-gray-800 text-white flex-1"
                      >
                        View Candidates
                      </Button>
                    ) : isEnrollmentOpen(election) ? (
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(election.id)}
                        className="bg-black hover:bg-gray-800 text-white flex-1"
                      >
                        Enroll
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(election.id)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading fallback component
function ElectionsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function ElectionsPage() {
  return (
    <Suspense fallback={<ElectionsLoading />}>
      <ElectionsContent />
    </Suspense>
  )
}
