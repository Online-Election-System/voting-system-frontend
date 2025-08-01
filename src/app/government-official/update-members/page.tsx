"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function UpdateMemberRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const updateMemberRequests = [
    {
      updateRequestId: "UMR-001",
      chiefOccupantId: "CO-001",
      householdMemberId: "VOT-005",
      newFullName: "Kasun Bandara Silva",
      newResidentArea: "New Address Line 1, New Address Line 2, Colombo",
      requestStatus: "pending",
      relevantCertificatePath: "/placeholder.svg?height=400&width=600&text=Certificate+PDF",
    },
    {
      updateRequestId: "UMR-002",
      chiefOccupantId: "CO-002",
      householdMemberId: "VOT-006",
      newFullName: null,
      newResidentArea: "New Village, Kandy",
      requestStatus: "pending",
      relevantCertificatePath: "/placeholder.svg?height=400&width=600&text=Certificate+PDF",
    },
    {
      updateRequestId: "UMR-003",
      chiefOccupantId: "CO-003",
      householdMemberId: "VOT-007",
      newFullName: "Nimal Fernando Perera",
      newResidentArea: null,
      requestStatus: "approved",
      relevantCertificatePath: "/placeholder.svg?height=400&width=600&text=Certificate+PDF",
    },
  ]

  const filteredRequests = updateMemberRequests.filter((req) => {
    const matchesSearch =
      req.newFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      req.householdMemberId?.includes(searchTerm) ||
      ""
    const matchesStatus = statusFilter === "all" || req.requestStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Update Member Requests</h1>
        <p className="text-gray-600">Review and process household member update requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by new name or member ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
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
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {updateMemberRequests.filter((r) => r.requestStatus === "pending").length}
            </div>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {updateMemberRequests.filter((r) => r.requestStatus === "approved").length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {updateMemberRequests.filter((r) => r.requestStatus === "rejected").length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{updateMemberRequests.length}</div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Update Member Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Update Member Applications</CardTitle>
          <CardDescription>{filteredRequests.length} applications found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chief Occupant ID</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>New Full Name</TableHead>
                <TableHead>New Resident Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.updateRequestId}>
                  <TableCell className="font-medium">{request.chiefOccupantId}</TableCell>
                  <TableCell>{request.householdMemberId}</TableCell>
                  <TableCell>{request.newFullName || "N/A"}</TableCell>
                  <TableCell className="max-w-48 truncate">{request.newResidentArea || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.requestStatus === "pending"
                          ? "secondary"
                          : request.requestStatus === "approved"
                            ? "default"
                            : "destructive"
                      }
                      className={
                        request.requestStatus === "pending"
                          ? "bg-gray-100 text-gray-800"
                          : request.requestStatus === "approved"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {request.requestStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/update-members/${request.updateRequestId}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
