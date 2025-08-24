"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, Download, Eye, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

// Updated interfaces to match backend response structure
interface AddMemberRequest {
  addRequestId: string
  chiefOccupantId: string
  nicNumber: string
  fullName: string
  dateOfBirth: string
  gender: string
  civilStatus: string
  relationshipToChief: string
  chiefOccupantApproval: string
  requestStatus: string
  reason?: string
  nicOrBirthCertificatePath?: string
  photoCopyPath?: string
}

interface HouseholdDetails {
  id: string
  chiefOccupantId: string
  electoralDistrict: string
  pollingDivision: string
  pollingDistrictNumber: string
  gramaNiladhariDivision?: string
  villageStreetEstate?: string
  houseNumber?: string
  householdMemberCount: number
}

interface ChiefOccupant {
  id: string
  fullName: string
  nic: string
  phoneNumber?: string
  email: string
}

// Backend response structure
interface AddMemberRequestDetail {
  request: AddMemberRequest
  chiefOccupant?: ChiefOccupant
  householdDetails?: HouseholdDetails
}

export default function AddMemberDetail({ params }: { params: { id: string } }) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [request, setRequest] = useState<AddMemberRequest | null>(null)
  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetails | null>(null)
  const [chiefOccupant, setChiefOccupant] = useState<ChiefOccupant | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchRequestDetails()
  }, [params.id])

  const fetchRequestDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:8080/api/v1/add-member-requests/${params.id}`)

      if (response.status === 404) {
        throw new Error("Request not found")
      }

      if (!response.ok) {
        throw new Error("Failed to fetch request details")
      }
      const data: AddMemberRequestDetail = await response.json()

      // Backend returns structured response with request, chiefOccupant, householdDetails
      setRequest(data.request)
      setHouseholdDetails(data.householdDetails || null)
      setChiefOccupant(data.chiefOccupant || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching request details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await fetch(`http://localhost:8080/api/v1/add-member-requests/${params.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.status === 404) {
        throw new Error("Request not found")
      }
      if (!response.ok) {
        throw new Error("Failed to approve request")
      }
      toast({
        title: "Request Approved",
        description: "The add member request has been approved successfully.",
      })
      // Refresh the data
      await fetchRequestDetails()

      // Redirect back to the list after a short delay
      setTimeout(() => {
        router.push("/government-official/add-members")
      }, 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve request",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }
    try {
      setProcessing(true)
      const response = await fetch(`http://localhost:8080/api/v1/add-member-requests/${params.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })
      if (response.status === 404) {
        throw new Error("Request not found")
      }
      if (!response.ok) {
        throw new Error("Failed to reject request")
      }
      toast({
        title: "Request Rejected",
        description: "The add member request has been rejected.",
      })
      setShowRejectDialog(false)
      setRejectionReason("")

      // Refresh the data
      await fetchRequestDetails()

      // Redirect back to the list after a short delay
      setTimeout(() => {
        router.push("/government-official/add-members")
      }, 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reject request",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleViewDocument = (documentPath: string) => {
    if (documentPath) {
      window.open(documentPath, "_blank")
    }
  }

  const handleDownloadDocument = (documentPath: string, filename: string) => {
    if (documentPath) {
      const link = document.createElement("a")
      link.href = documentPath
      link.download = filename
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading request details...</span>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-red-500 mt-2">{error || "Request not found"}</p>
          <Button asChild className="mt-4 bg-gray-800 hover:bg-gray-900 text-white">
            <Link href="/government-official/add-members">Back to Requests</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <Link href="/government-official/add-members">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Add Member Requests
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Member Request Details</h1>
            <p className="text-gray-600">Review new household member application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applicant Information</CardTitle>
                    <CardDescription className="text-gray-600">Details of the member to be added</CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(request.requestStatus)}>
                    {request.requestStatus.charAt(0).toUpperCase() + request.requestStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm font-semibold text-gray-900">{request.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">NIC Number</Label>
                    <p className="text-sm font-semibold text-gray-900">{request.nicNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-sm text-gray-900">{request.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Gender</Label>
                    <p className="text-sm text-gray-900">{request.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Civil Status</Label>
                    <p className="text-sm text-gray-900">{request.civilStatus}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Relationship to Chief</Label>
                    <p className="text-sm text-gray-900">{request.relationshipToChief}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Chief Occupant Approval</Label>
                    <p className="text-sm text-gray-900">{request.chiefOccupantApproval}</p>
                  </div>
                  {request.reason && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                      <p className="text-sm text-red-600">{request.reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {chiefOccupant && (
              <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Chief Occupant Information</CardTitle>
                  <CardDescription className="text-gray-600">Details of the household chief occupant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-sm text-gray-900">{chiefOccupant.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">NIC</Label>
                      <p className="text-sm text-gray-900">{chiefOccupant.nic}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-sm text-gray-900">{chiefOccupant.email}</p>
                    </div>
                    {chiefOccupant.phoneNumber && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                        <p className="text-sm text-gray-900">{chiefOccupant.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {householdDetails && (
              <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Household Details</CardTitle>
                  <CardDescription className="text-gray-600">
                    Information about the household this member will join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Chief Occupant ID</Label>
                      <p className="text-sm text-gray-900">{householdDetails.chiefOccupantId}</p>
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
            )}

            {/* Document Sections */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>NIC or Birth Certificate</CardTitle>
                <CardDescription className="text-gray-600">
                  Scanned copy of the relevant identification document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    {request.nicOrBirthCertificatePath ? (
                      <img
                        src={request.nicOrBirthCertificatePath || "/placeholder.svg"}
                        alt="NIC or Birth Certificate"
                        className="w-full max-w-md mx-auto rounded border border-gray-200 cursor-pointer"
                        onClick={() => handleViewDocument(request.nicOrBirthCertificatePath!)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p>No document uploaded</p>
                      </div>
                    )}
                  </div>
                  {request.nicOrBirthCertificatePath && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(request.nicOrBirthCertificatePath!)}
                        className="text-gray-600 hover:bg-gray-100 border-gray-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Size
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadDocument(request.nicOrBirthCertificatePath!, `nic_${request.nicNumber}.pdf`)
                        }
                        className="text-gray-600 hover:bg-gray-100 border-gray-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {request.photoCopyPath && (
              <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle>Photo Copy</CardTitle>
                  <CardDescription className="text-gray-600">Photo copy of the applicant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <img
                        src={request.photoCopyPath || "/placeholder.svg"}
                        alt="Photo Copy"
                        className="w-full max-w-md mx-auto rounded border border-gray-200 cursor-pointer"
                        onClick={() => handleViewDocument(request.photoCopyPath!)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(request.photoCopyPath!)}
                        className="text-gray-600 hover:bg-gray-100 border-gray-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Size
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(request.photoCopyPath!, `photo_${request.nicNumber}.pdf`)}
                        className="text-gray-600 hover:bg-gray-100 border-gray-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription className="text-gray-600">Current status and submission details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`mt-1 ${getStatusBadgeColor(request.requestStatus)}`}>
                    {request.requestStatus.charAt(0).toUpperCase() + request.requestStatus.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {request.requestStatus === "pending" && (
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
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve Request
                      </>
                    )}
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
                        <DialogTitle>Reject Add Member Request</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Please provide a reason for rejecting this add member request.
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
                          onClick={() => setShowRejectDialog(false)}
                          disabled={processing}
                          className="text-gray-600 hover:bg-gray-100 border-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={processing || !rejectionReason.trim()}
                        >
                          {processing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Reject Application"
                          )}
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
                  <span className="font-medium text-gray-900">#{request.addRequestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chief Occupant ID:</span>
                  <span className="font-medium text-gray-900">{request.chiefOccupantId}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}