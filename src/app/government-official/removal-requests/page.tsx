"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Check, X, Search, Filter, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function RemovalRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null)

  const removalRequests = [
    {
      id: 1,
      memberName: "Kamala Silva",
      memberNic: "198712345679",
      requestedBy: "Saman Silva",
      requestedByNic: "197512345678",
      reason: "Death",
      proofDocument: "Death Certificate",
      submittedDate: "2024-01-15",
      status: "pending",
    },
    {
      id: 2,
      memberName: "Nimal Perera",
      memberNic: "199012345680",
      requestedBy: "Priya Perera",
      requestedByNic: "199212345681",
      reason: "Transfer to another district",
      proofDocument: "Transfer Letter",
      submittedDate: "2024-01-14",
      status: "pending",
    },
    {
      id: 3,
      memberName: "Sunil Fernando",
      memberNic: "198512345682",
      requestedBy: "Mala Fernando",
      requestedByNic: "198712345683",
      reason: "Migration abroad",
      proofDocument: "Passport & Visa",
      submittedDate: "2024-01-13",
      status: "approved",
    },
  ]

  const handleApprove = (id: number) => {
    console.log(`Approving removal request ${id}`)
    // Implementation for approval
  }

  const handleReject = (id: number) => {
    console.log(`Rejecting removal request ${id} with reason: ${rejectionReason}`)
    setSelectedRequest(null)
    setRejectionReason("")
    // Implementation for rejection
  }

  const filteredRequests = removalRequests.filter((req) => {
    const matchesSearch =
      req.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.memberNic.includes(searchTerm) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Member Removal Requests</h1>
        <p className="text-gray-600">Review and process household member removal requests</p>
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
                  placeholder="Search by member name, NIC, or requester..."
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
              {removalRequests.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {removalRequests.filter((r) => r.status === "approved").length}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">
              {removalRequests.filter((r) => r.status === "rejected").length}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{removalRequests.length}</div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Removal Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Removal Requests</CardTitle>
          <CardDescription>{filteredRequests.length} requests found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member to Remove</TableHead>
                <TableHead>Member NIC</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Proof Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.memberName}</TableCell>
                  <TableCell>{request.memberNic}</TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      {request.proofDocument}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "pending"
                          ? "secondary"
                          : request.status === "approved"
                            ? "default"
                            : "destructive"
                      }
                      className={
                        request.status === "pending"
                          ? "bg-gray-100 text-gray-800"
                          : request.status === "approved"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.submittedDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setSelectedRequest(request.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Removal Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this removal request for {request.memberName}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason">Rejection Reason</Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Enter the reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequest(null)
                                    setRejectionReason("")
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => selectedRequest && handleReject(selectedRequest)}
                                >
                                  Reject Request
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
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
