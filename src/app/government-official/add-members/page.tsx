"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface AddMemberRequest {
  addRequestId: string
  fullName: string
  nicNumber: string
  dateOfBirth: string
  gender: string
  relationshipToChief: string
  requestStatus: string
  reason?: string
}

interface RequestCounts {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function AddMemberRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [requests, setRequests] = useState<AddMemberRequest[]>([])
  const [counts, setCounts] = useState<RequestCounts>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAddMemberRequests()
  }, [])

  const fetchAddMemberRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch requests and counts separately
      const [requestsResponse, countsResponse] = await Promise.all([
        fetch("http://localhost:8080/api/v1/add-member-requests"),
        fetch("http://localhost:8080/api/v1/add-member-requests/counts"),
      ])

      if (!requestsResponse.ok) {
        throw new Error("Failed to fetch add member requests")
      }

      if (!countsResponse.ok) {
        throw new Error("Failed to fetch request counts")
      }
      const requestsData = await requestsResponse.json()
      const countsData = await countsResponse.json()

      // Backend returns array directly, not wrapped in object
      setRequests(Array.isArray(requestsData) ? requestsData : [])
      setCounts(countsData || { pending: 0, approved: 0, rejected: 0, total: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching add member requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || req.nicNumber.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || req.requestStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading add member requests...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-red-500 mt-2">{error}</p>
          <Button onClick={fetchAddMemberRequests} className="mt-6 bg-gray-800 hover:bg-gray-900 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Member Requests</h1>
          <p className="text-gray-600">Review and process new household member addition requests</p>
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
              <p className="text-sm text-gray-600">Total Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Member Requests Table */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle>Add Member Applications</CardTitle>
            <CardDescription className="text-gray-600">{filteredRequests.length} applications found</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No requests found matching your criteria.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 hover:bg-blue-100">
                    <TableHead className="text-gray-700">Full Name</TableHead>
                    <TableHead className="text-gray-700">NIC Number</TableHead>
                    <TableHead className="text-gray-700">Date of Birth</TableHead>
                    <TableHead className="text-gray-700">Gender</TableHead>
                    <TableHead className="text-gray-700">Relationship to Chief</TableHead>
                    <TableHead className="text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.addRequestId} className="hover:bg-blue-50">
                      <TableCell className="font-medium text-gray-900">{request.fullName}</TableCell>
                      <TableCell className="text-gray-700">{request.nicNumber}</TableCell>
                      <TableCell className="text-gray-700">{request.dateOfBirth}</TableCell>
                      <TableCell className="text-gray-700">{request.gender}</TableCell>
                      <TableCell className="text-gray-700">{request.relationshipToChief}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(request.requestStatus)}>
                          {request.requestStatus.charAt(0).toUpperCase() + request.requestStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-100">
                            <Link href={`/government-official/add-members/${request.addRequestId}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
