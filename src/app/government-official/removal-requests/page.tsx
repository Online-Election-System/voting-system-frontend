"use client"

import { useState, useEffect } from "react"
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
  deleteRequestId: string;
  memberName: string;
  memberNic: string;
  requestedBy: string;
  requestedByNic: string;
  reason: string;
  proofDocument: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface RemovalRequestCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const API_BASE_URL = 'http://localhost:8080/api/v1';

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

  // API functions
  const fetchRemovalRequests = async (searchTerm = '', statusFilter = 'all') => {
    try {
      const params = new URLSearchParams();
      
      if (searchTerm && searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const url = `${API_BASE_URL}/removal-requests${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch removal requests: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching removal requests:', error);
      throw error;
    }
  };

  const fetchRemovalRequestCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/removal-requests/counts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch counts: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching removal request counts:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [requestsData, countsData] = await Promise.all([
        fetchRemovalRequests(searchTerm, statusFilter),
        fetchRemovalRequestCounts()
      ]);
      setRemovalRequests(requestsData);
      setCounts(countsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleApprove = async (deleteRequestId: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/removal-requests/${deleteRequestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve removal request: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Refresh data after approval
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve removal request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/removal-requests/${selectedRequest}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject removal request: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Close dialog and reset state
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
      
      // Refresh data after rejection
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject removal request');
    } finally {
      setIsProcessing(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  // Filter requests based on search and status
  const filteredRequests = removalRequests.filter((req) => {
    const matchesSearch =
      req.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.memberNic.includes(searchTerm) ||
      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold text-gray-800">{counts.pending}</div>
            <p className="text-sm text-gray-600">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{counts.approved}</div>
            <p className="text-sm text-gray-600">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{counts.rejected}</div>
            <p className="text-sm text-gray-600">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{counts.total}</div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Removal Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Removal Requests</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${filteredRequests.length} requests found`}
          </CardDescription>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading removal requests...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No removal requests found.</TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.deleteRequestId}>
                    <TableCell className="font-medium">{request.memberName}</TableCell>
                    <TableCell>{request.memberNic}</TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      {request.proofDocument ? (
                        <Button variant="ghost" size="sm" asChild>
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
                        variant={
                          request.status === "pending"
                            ? "secondary"
                            : request.status === "approved"
                              ? "default"
                              : "destructive"
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
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(request.deleteRequestId)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <Dialog open={showRejectDialog && selectedRequest === request.deleteRequestId} onOpenChange={(open) => {
                              setShowRejectDialog(open);
                              if (!open) {
                                setSelectedRequest(null);
                                setRejectionReason("");
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedRequest(request.deleteRequestId);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={isProcessing}
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
                                      setShowRejectDialog(false);
                                      setSelectedRequest(null);
                                      setRejectionReason("");
                                    }}
                                    disabled={isProcessing}
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
                                      'Reject Request'
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
  )
}