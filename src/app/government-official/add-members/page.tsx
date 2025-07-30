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

export default function AddMemberRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const addMemberRequests = [
    {
      addRequestId: "AMR-001",
      chiefOccupantId: "CO-001",
      nicNumber: "199801011234",
      fullName: "Kasun Bandara",
      dateOfBirth: "1998-01-01",
      gender: "Male",
      civilStatus: "Single",
      relationshipToChief: "Son",
      chiefOccupantApproval: "Approved",
      requestStatus: "pending",
      nicOrBirthCertificatePath: "/placeholder.svg?height=400&width=600&text=NIC+Document+PDF",
    },
    {
      addRequestId: "AMR-002",
      chiefOccupantId: "CO-002",
      nicNumber: "199505105678",
      fullName: "Piumi Perera",
      dateOfBirth: "1995-05-10",
      gender: "Female",
      civilStatus: "Married",
      relationshipToChief: "Daughter-in-law",
      chiefOccupantApproval: "Pending",
      requestStatus: "pending",
      nicOrBirthCertificatePath: "/placeholder.svg?height=400&width=600&text=NIC+Document+PDF",
    },
    {
      addRequestId: "AMR-003",
      chiefOccupantId: "CO-003",
      nicNumber: "197011209876",
      fullName: "Sunil Rajapakse",
      dateOfBirth: "1970-11-20",
      gender: "Male",
      civilStatus: "Widowed",
      relationshipToChief: "Father",
      chiefOccupantApproval: "Approved",
      requestStatus: "approved",
      nicOrBirthCertificatePath: "/placeholder.svg?height=400&width=600&text=NIC+Document+PDF",
    },
  ]

  const filteredRequests = addMemberRequests.filter((req) => {
    const matchesSearch =
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || req.nicNumber.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || req.requestStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Member Requests</h1>
        <p className="text-gray-600">Review and process new household member addition requests</p>
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
                  placeholder="Search by name or NIC..."
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
              {addMemberRequests.filter((r) => r.requestStatus === "pending").length}
            </div>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {addMemberRequests.filter((r) => r.requestStatus === "approved").length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {addMemberRequests.filter((r) => r.requestStatus === "rejected").length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{addMemberRequests.length}</div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Add Member Applications</CardTitle>
          <CardDescription>{filteredRequests.length} applications found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>NIC Number</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Relationship to Chief</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.addRequestId}>
                  <TableCell className="font-medium">{request.fullName}</TableCell>
                  <TableCell>{request.nicNumber}</TableCell>
                  <TableCell>{request.dateOfBirth}</TableCell>
                  <TableCell>{request.gender}</TableCell>
                  <TableCell>{request.relationshipToChief}</TableCell>
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
                        <Link href={`/add-members/${request.addRequestId}`}>
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
