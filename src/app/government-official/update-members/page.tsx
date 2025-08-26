"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter } from "lucide-react"
import Link from "next/link"

interface UpdateMemberRequest {
  updateRequestId: string;
  chiefOccupantId: string;
  householdMemberId: string;
  nic: string;
  newFullName: string | null;
  newCivilStatus: string | null;
  relevantCertificatePath: string;
  requestStatus: string;
  reason: string | null;
}

interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function UpdateMemberRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updateMemberRequests, setUpdateMemberRequests] = useState<UpdateMemberRequest[]>([])
  const [stats, setStats] = useState<RequestStats>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpdateMemberRequests()
    fetchStats()
  }, [])

  const fetchUpdateMemberRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/v1/update-member-requests')
      if (response.ok) {
        const data = await response.json()
        setUpdateMemberRequests(data)
      }
    } catch (error) {
      console.error('Error fetching update member requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/update-member-requests/counts')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const filteredRequests = updateMemberRequests.filter((req) => {
    const matchesSearch = 
      req.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.newFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.updateRequestId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || req.requestStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Update stats when requests change (for real-time updates after approval/rejection)
  useEffect(() => {
    const pending = updateMemberRequests.filter(r => r.requestStatus === "pending").length
    const approved = updateMemberRequests.filter(r => r.requestStatus === "approved").length
    const rejected = updateMemberRequests.filter(r => r.requestStatus === "rejected").length
    
    setStats({
      pending,
      approved,
      rejected,
      total: updateMemberRequests.length
    })
  }, [updateMemberRequests])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Member Requests</h1>
          <p className="text-gray-600">Review and process household member update requests</p>
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
                    placeholder="Search by NIC, new name or request ID..."
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
              <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Update Member Requests Table */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle>Update Member Applications</CardTitle>
            <CardDescription className="text-gray-600">{filteredRequests.length} applications found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-yellow-50 hover:bg-yellow-100">
                  <TableHead className="text-gray-700">NIC Number</TableHead>
                  <TableHead className="text-gray-700">New Full Name</TableHead>
                  <TableHead className="text-gray-700">New Civil Status</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-600">
                      No update requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.updateRequestId} className="hover:bg-yellow-50">
                      <TableCell className="font-medium text-gray-900">{request.nic}</TableCell>
                      <TableCell className="text-gray-700">{request.newFullName || "No change"}</TableCell>
                      <TableCell className="text-gray-700">{request.newCivilStatus || "No change"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(request.requestStatus)}>
                          {request.requestStatus.charAt(0).toUpperCase() + request.requestStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-100">
                            <Link href={`/government-official/update-members/${request.updateRequestId}`}>
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