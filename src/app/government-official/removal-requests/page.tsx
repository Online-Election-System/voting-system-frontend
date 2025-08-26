"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Search, Filter, Download, Loader2, AlertCircle } from "lucide-react"
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

// Type definitions
interface RemovalRequest {
  deleteRequestId: string
  memberName: string
  memberNic: string
  requestedBy: string
  requestedByNic: string
  reason: string
  proofDocument: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
}

interface RemovalRequestCounts {
  pending: number
  approved: number
  rejected: number
  total: number
}

const API_BASE_URL = "http://localhost:8080/api/v1"

export default function RemovalRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // State management
  const [removalRequests, setRemovalRequests] = useState<RemovalRequest[]>([])
  const [counts, setCounts] = useState<RemovalRequestCounts>({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Optimized API functions with better error handling
  const fetchRemovalRequests = useCallback(async (searchTerm = "", statusFilter = "all") => {
    try {
      const params = new URLSearchParams()

      if (searchTerm && searchTerm.trim() !== "") {
        params.append("search", searchTerm.trim())
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const url = `${API_BASE_URL}/removal-requests${params.toString() ? "?" + params.toString() : ""}`

      console.log("Fetching removal requests from:", url) // Debug log

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      console.log("Removal requests response status:", response.status) // Debug log
      
      if (!response.ok) {
        let errorText = ""
        try {
          errorText = await response.text()
        } catch {
          errorText = "Unable to read error response"
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }
      
      const data = await response.json()
      console.log("Removal requests data received:", data) // Debug log
      return data
    } catch (error) {
      console.error("Error fetching removal requests:", error)
      throw error
    }
  }, [])

  const fetchRemovalRequestCounts = useCallback(async () => {
    try {
      console.log("Fetching removal request counts") // Debug log
      
      const response = await fetch(`${API_BASE_URL}/removal-requests/counts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      console.log("Counts response status:", response.status) // Debug log
      
      if (!response.ok) {
        let errorText = ""
        try {
          errorText = await response.text()
        } catch {
          errorText = "Unable to read error response"
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }
      
      const data = await response.json()
      console.log("Counts data received:", data) // Debug log
      return data
    } catch (error) {
      console.error("Error fetching removal request counts:", error)
      throw error
    }
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch both data sets in parallel for better performance
      const [requestsData, countsData] = await Promise.all([
        fetchRemovalRequests(searchTerm, statusFilter),
        fetchRemovalRequestCounts(),
      ])
      setRemovalRequests(requestsData)
      setCounts(countsData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, fetchRemovalRequests, fetchRemovalRequestCounts])

  // Optimized event handlers
  const handleApprove = async (deleteRequestId: string) => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setError(null)

      console.log("Approving removal request:", deleteRequestId) // Debug log

      const response = await fetch(`${API_BASE_URL}/removal-requests/${deleteRequestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Approve response status:", response.status) // Debug log

      if (!response.ok) {
        let errorText = ""
        try {
          errorText = await response.text()
        } catch {
          errorText = "Unable to read error response"
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }

      // Update local state instead of full refetch for better performance
      setRemovalRequests(prev => 
        prev.map(req => 
          req.deleteRequestId === deleteRequestId 
            ? { ...req, status: "approved" as const }
            : req
        )
      )
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }))

      console.log("Removal request approved successfully") // Debug log
      
    } catch (err: any) {
      console.error("Error approving removal request:", err)
      setError(err.message || "Failed to approve removal request")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim() || isProcessing) return

    try {
      setIsProcessing(true)
      setError(null)

      console.log("Rejecting removal request:", selectedRequest) // Debug log

      const response = await fetch(`${API_BASE_URL}/removal-requests/${selectedRequest}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      })

      console.log("Reject response status:", response.status) // Debug log

      if (!response.ok) {
        let errorText = ""
        try {
          errorText = await response.text()
        } catch {
          errorText = "Unable to read error response"
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`)
      }

      // Update local state instead of full refetch for better performance
      setRemovalRequests(prev => 
        prev.map(req => 
          req.deleteRequestId === selectedRequest 
            ? { ...req, status: "rejected" as const }
            : req
        )
      )
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }))

      // Close dialog and reset state
      setShowRejectDialog(false)
      setSelectedRequest(null)
      setRejectionReason("")

      console.log("Removal request rejected successfully") // Debug log

    } catch (err: any) {
      console.error("Error rejecting removal request:", err)
      setError(err.message || "Failed to reject removal request")
    } finally {
      setIsProcessing(false)
    }
  }

  // Effects
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter requests based on search and status (client-side filtering for better performance)
  const filteredRequests = removalRequests.filter((req) => {
    const matchesSearch =
      req.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.memberNic.includes(searchTerm) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <Button 
            onClick={() => fetchData()} 
            className="ml-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Removal Requests</h1>
          <p className="text-gray-600">Review and process household member removal requests</p>
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
                    placeholder="Search by member name, NIC, or requester..."
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
              <div className="text-2xl font-bold text-yellow-700">{counts.pending}</div>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{counts.approved}</div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-700">{counts.rejected}</div>
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

        {/* Removal Requests Table */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle>Removal Requests</CardTitle>
            <CardDescription className="text-gray-600">
              {isLoading ? "Loading..." : `${filteredRequests.length} requests found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50 hover:bg-red-100">
                  <TableHead className="text-gray-700">Member to Remove</TableHead>
                  <TableHead className="text-gray-700">Member NIC</TableHead>
                  <TableHead className="text-gray-700">Requested By</TableHead>
                  <TableHead className="text-gray-700">Reason</TableHead>
                  <TableHead className="text-gray-700">Proof Document</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading removal requests...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-600">
                      No removal requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.deleteRequestId} className="hover:bg-red-50">
                      <TableCell className="font-medium text-gray-900">{request.memberName}</TableCell>
                      <TableCell className="text-gray-700">{request.memberNic}</TableCell>
                      <TableCell className="text-gray-700">{request.requestedBy}</TableCell>
                      <TableCell className="text-gray-700">{request.reason}</TableCell>
                      <TableCell>
                        {request.proofDocument ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-gray-600 hover:bg-gray-100 bg-transparent"
                          >
                            <a href={request.proofDocument} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              View Document
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-500">No document</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : request.status === "approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:text-green-700 hover:bg-gray-100"
                                onClick={() => handleApprove(request.deleteRequestId)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>

                              <Dialog
                                open={showRejectDialog && selectedRequest === request.deleteRequestId}
                                onOpenChange={(open) => {
                                  setShowRejectDialog(open)
                                  if (!open) {
                                    setSelectedRequest(null)
                                    setRejectionReason("")
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedRequest(request.deleteRequestId)
                                      setShowRejectDialog(true)
                                    }}
                                    disabled={isProcessing}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white text-gray-900 border-gray-200">
                                  <DialogHeader>
                                    <DialogTitle>Reject Removal Request</DialogTitle>
                                    <DialogDescription className="text-gray-600">
                                      Please provide a reason for rejecting this removal request for{" "}
                                      {request.memberName}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="reason" className="text-gray-700">
                                        Rejection Reason
                                      </Label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Enter the reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-500"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowRejectDialog(false)
                                        setSelectedRequest(null)
                                        setRejectionReason("")
                                      }}
                                      disabled={isProcessing}
                                      className="text-gray-600 hover:bg-gray-100 border-gray-300"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={handleReject}
                                      disabled={!rejectionReason.trim() || isProcessing}
                                    >
                                      {isProcessing ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        "Reject Request"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                          {request.status !== "pending" && (
                            <span className="text-gray-500 text-sm">No actions available</span>
                          )}
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