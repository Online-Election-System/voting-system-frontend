"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, Download, Eye, ImageIcon } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface UpdateMemberRequestDetail {
  updateRequestId: string;
  chiefOccupantId: string;
  householdMemberId: string;
  nic: string;
  currentFullName: string;
  currentCivilStatus: string;
  newFullName: string | null;
  newCivilStatus: string | null;
  relevantCertificatePath: string;
  requestStatus: string;
  reason: string | null;
}

interface HouseholdDetails {
  id: string;
  chiefOccupantId: string;
  electoralDistrict: string;
  pollingDivision: string;
  pollingDistrictNumber: string;
  gramaNiladhariDivision: string;
  villageStreetEstate: string;
  houseNumber: string;
  householdMemberCount: number;
}

export default function UpdateMemberDetail({ params }: { params: { id: string } }) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [updateMemberRequest, setUpdateMemberRequest] = useState<UpdateMemberRequestDetail | null>(null)
  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUpdateMemberRequestDetail()
  }, [params.id])

  const fetchUpdateMemberRequestDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/v1/update-member-requests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUpdateMemberRequest(data.updateRequest)
        setHouseholdDetails(data.householdDetails)
      } else {
        console.error('Failed to fetch update member request detail')
      }
    } catch (error) {
      console.error('Error fetching update member request detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await fetch(`http://localhost:8080/api/v1/update-member-requests/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Refresh the data
        await fetchUpdateMemberRequestDetail()
        alert('Update member request approved successfully!')
      } else {
        alert('Error approving update member request')
      }
    } catch (error) {
      console.error('Error approving update member request:', error)
      alert('Error approving update member request')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`http://localhost:8080/api/v1/update-member-requests/${params.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })
      
      if (response.ok) {
        setShowRejectDialog(false)
        setRejectionReason("")
        // Refresh the data
        await fetchUpdateMemberRequestDetail()
        alert('Update member request rejected successfully!')
      } else {
        alert('Error rejecting update member request')
      }
    } catch (error) {
      console.error('Error rejecting update member request:', error)
      alert('Error rejecting update member request')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewDocument = () => {
    if (updateMemberRequest?.relevantCertificatePath) {
      window.open(updateMemberRequest.relevantCertificatePath, '_blank')
    }
  }

  const handleDownloadDocument = () => {
    if (updateMemberRequest?.relevantCertificatePath) {
      const link = document.createElement('a')
      link.href = updateMemberRequest.relevantCertificatePath
      link.download = `certificate_${updateMemberRequest.updateRequestId}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!updateMemberRequest || !householdDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center">Update member request not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <Link href="/government-official/update-members">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Update Member Requests
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Member Request Details</h1>
            <p className="text-gray-600">Review household member update application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Updated Information</CardTitle>
                    <CardDescription className="text-gray-600">Details of the requested update</CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(updateMemberRequest.requestStatus)}>
                    {updateMemberRequest.requestStatus.charAt(0).toUpperCase() +
                      updateMemberRequest.requestStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">NIC Number</Label>
                    <p className="text-sm font-semibold text-gray-900">{updateMemberRequest.nic}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Full Name</Label>
                    <p className="text-sm text-gray-900">{updateMemberRequest.currentFullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">New Full Name</Label>
                    <p className="text-sm text-gray-900 font-semibold">
                      {updateMemberRequest.newFullName || "No change requested"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Civil Status</Label>
                    <p className="text-sm text-gray-900">{updateMemberRequest.currentCivilStatus}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">New Civil Status</Label>
                    <p className="text-sm text-gray-900 font-semibold">
                      {updateMemberRequest.newCivilStatus || "No change requested"}
                    </p>
                  </div>
                  {updateMemberRequest.reason && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                      <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                        {updateMemberRequest.reason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Household Details</CardTitle>
                <CardDescription className="text-gray-600">
                  Information about the household related to this update
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Household ID</Label>
                    <p className="text-sm text-gray-900">{householdDetails.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">House Number</Label>
                    <p className="text-sm text-gray-900">{householdDetails.houseNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Village/Street/Estate</Label>
                    <p className="text-sm text-gray-900">{householdDetails.villageStreetEstate || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Grama Niladhari Division</Label>
                    <p className="text-sm text-gray-900">{householdDetails.gramaNiladhariDivision || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Electoral District</Label>
                    <p className="text-sm text-gray-900">{householdDetails.electoralDistrict}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Polling Division</Label>
                    <p className="text-sm text-gray-900">{householdDetails.pollingDivision}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Polling District Number</Label>
                    <p className="text-sm text-gray-900">{householdDetails.pollingDistrictNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Household Members</Label>
                    <p className="text-sm text-gray-900">{householdDetails.householdMemberCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Section */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Relevant Certificate</CardTitle>
                <CardDescription className="text-gray-600">Document supporting the update request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    {updateMemberRequest.relevantCertificatePath ? (
                      <img
                        src={updateMemberRequest.relevantCertificatePath || "/placeholder.svg"}
                        alt="Relevant Certificate"
                        className="w-full max-w-md mx-auto rounded border border-gray-200 cursor-pointer"
                        onClick={handleViewDocument}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p>No document uploaded</p>
                      </div>
                    )}
                  </div>
                  {updateMemberRequest.relevantCertificatePath && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewDocument}
                        className="text-gray-600 hover:bg-gray-100 border-gray-300 bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Size
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadDocument}
                        className="text-gray-600 hover:bg-gray-100 border-gray-300 bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription className="text-gray-600">Current status of the request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusBadgeColor(updateMemberRequest.requestStatus)}`}>
                      {updateMemberRequest.requestStatus.charAt(0).toUpperCase() +
                        updateMemberRequest.requestStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {updateMemberRequest.requestStatus === "pending" && (
              <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription className="text-gray-600">Approve or reject this application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleApprove} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={processing}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processing ? 'Processing...' : 'Approve Request'}
                  </Button>
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={processing}>
                        <X className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-gray-900 border-gray-200">
                      <DialogHeader>
                        <DialogTitle>Reject Update Member Request</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Please provide a reason for rejecting this update member request.
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
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRejectDialog(false)
                            setRejectionReason("")
                          }}
                          className="text-gray-600 hover:bg-gray-100 border-gray-300"
                          disabled={processing}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleReject}
                          disabled={processing || !rejectionReason.trim()}
                        >
                          {processing ? 'Processing...' : 'Reject Application'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Request ID:</span>
                  <span className="font-medium text-gray-900">#{updateMemberRequest.updateRequestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NIC Number:</span>
                  <span className="font-medium text-gray-900">{updateMemberRequest.nic}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}