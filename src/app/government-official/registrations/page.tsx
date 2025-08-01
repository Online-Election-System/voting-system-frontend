"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter, AlertCircle } from "lucide-react"
import Link from "next/link"

// Define types inline
interface RegistrationApplication {
  fullName: string
  nic: string
  dob: string
  phone?: string
  address: string
  status: "pending" | "approved" | "rejected"
}

interface StatusCounts {
  pending: number
  approved: number
  rejected: number
  total: number
}

const API_BASE_URL = "http://localhost:8080/api/v1"

export default function Registrations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  // State to hold data from the API
  const [applications, setApplications] = useState<RegistrationApplication[]>([])
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Direct API functions - connecting to your existing backend endpoints
  const getApplications = async (searchTerm = "", statusFilter = "all") => {
    try {
      const params = new URLSearchParams()

      // Add search parameter if provided (maps to nameOrNic in backend)
      if (searchTerm && searchTerm.trim() !== "") {
        params.append("nameOrNic", searchTerm.trim())
      }

      // Add status filter if not 'all' (maps to statusFilter in backend)
      if (statusFilter && statusFilter !== "all") {
        params.append("statusFilter", statusFilter)
      }

      // Construct URL to match your backend endpoint: GET /registrations/applications
      const url = `${API_BASE_URL}/registrations/applications${params.toString() ? "?" + params.toString() : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText} - ${errorText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching applications:", error)
      throw error
    }
  }

  const getApplicationCounts = async () => {
    try {
      // Calls your backend endpoint: GET /registrations/counts
      const response = await fetch(`${API_BASE_URL}/registrations/counts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch counts: ${response.status} ${response.statusText} - ${errorText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching application counts:", error)
      throw error
    }
  }

  // Function to fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Make parallel API calls to both backend endpoints
      const [appsData, countsData] = await Promise.all([
        getApplications(searchTerm, statusFilter),
        getApplicationCounts(),
      ])
      setApplications(appsData)
      setCounts(countsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData()
  }, [searchTerm, statusFilter])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle /> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voter Registrations</h1>
          <p className="text-gray-600">Review and approve voter registration applications</p>
        </div>

        {/* Filters */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Filter className="w-4 h-4 text-gray-700" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or NIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-700">{counts.pending}</div> {/* Yellow for pending */}
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{counts.approved}</div> {/* Green for approved */}
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-700">{counts.rejected}</div> {/* Red for rejected */}
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{counts.total}</div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle>Registration Applications</CardTitle>
            <CardDescription className="text-gray-600">
              {isLoading ? "Loading..." : `${applications.length} applications found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-100">
                  <TableHead className="text-gray-700">Full Name</TableHead>
                  <TableHead className="text-gray-700">NIC</TableHead>
                  <TableHead className="text-gray-700">Phone</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-600">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-600">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((registration) => (
                    <TableRow key={registration.nic} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{registration.fullName}</TableCell>
                      <TableCell className="text-gray-700">{registration.nic}</TableCell>
                      <TableCell className="text-gray-700">{registration.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            registration.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : registration.status === "approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-100">
                            <Link href={`/government-official/registrations/${registration.nic}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
