"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface RegistrationDetails {
  fullName: string
  nic: string
  dob: string
  gender: string
  civilStatus: string
  phone?: string
  electoralDistrict: string
  pollingDivision: string
  pollingDistrictNumber: string
  villageStreetEstate?: string
  houseNumber?: string
  fullAddress: string
  idCopyPath?: string
  imagePath?: string
  status: string
  reviewedAt?: string
  comments?: string
}

export default function RegistrationDetailPage({ params }: { params: { nic: string } }) {
  const router = useRouter()
  const [registration, setRegistration] = useState<RegistrationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10-second timeout

    if (params.nic) {
  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching registration for NIC:", params.nic);
      const response = await fetch(
        `http://localhost:8080/api/v1/registrations/applications/${params.nic}`,
        { signal: controller.signal }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend error [${response.status}]: ${errorText}`);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setRegistration(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || "Failed to load registration details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    if (params.nic) {
      fetchDetails();
    }

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [params.nic]);
    }
  // Handle approval
  const handleApprove = async () => {
    if (!registration || isProcessing) return
    
    setIsProcessing(true)
    try {
      const response = await fetch(`http://localhost:8080/api/v1/registrations/applications/${registration.nic}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          comments: 'Application approved'
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      alert('Registration approved successfully!')
      router.push('/registrations')
    } catch (err: any) {
      console.error("Error approving registration:", err)
      alert(`Failed to approve: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle rejection
  const handleReject = async () => {
    if (!registration || !rejectionReason.trim() || isProcessing) return
    
    setIsProcessing(true)
    try {
      const response = await fetch(`http://localhost:8080/api/v1/registrations/applications/${registration.nic}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          comments: rejectionReason.trim()
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setShowRejectDialog(false)
      setRejectionReason("")
      alert('Registration rejected successfully!')
      router.push('/registrations')
    } catch (err: any) {
      console.error("Error rejecting registration:", err)
      alert(`Failed to reject: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate age
  const calculateAge = (dob: string) => {
    try {
      const birthDate = new Date(dob)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1
      }
      return age
    } catch {
      return 'N/A'
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading registration details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Error Loading Registration</p>
          <p>{error}</p>
          <Button asChild className="mt-4">
            <Link href="/registrations">Back to Registrations</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No registration data found.</p>
          <Button asChild className="mt-4">
            <Link href="/registrations">Back to Registrations</Link>
          </Button>
        </div>
      </div>
    )
  }

  const age = calculateAge(registration.dob)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/registrations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registrations
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Details</h1>
          <p className="text-gray-600">Review voter registration application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Basic details of the applicant</CardDescription>
                </div>
                <Badge variant={registration.status === 'approved' ? 'default' : registration.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="font-semibold">{registration.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">NIC Number</Label>
                  <p className="font-semibold">{registration.nic}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                  <p>{formatDate(registration.dob)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                  <p>{registration.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Gender</Label>
                  <p>{registration.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Civil Status</Label>
                  <p>{registration.civilStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Electoral Information</CardTitle>
              <CardDescription>Electoral district and polling details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Electoral District</Label>
                  <p>{registration.electoralDistrict}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Polling Division</Label>
                  <p>{registration.pollingDivision}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Polling District Number</Label>
                  <p>{registration.pollingDistrictNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Residential address details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Village/Street/Estate</Label>
                  <p>{registration.villageStreetEstate || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">House Number</Label>
                  <p>{registration.houseNumber || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Full Address</Label>
                  <p>{registration.fullAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>NIC Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
                  {registration.idCopyPath ? (
                    <img 
                      src={registration.idCopyPath} 
                      alt="NIC Document" 
                      className="w-full rounded max-h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <p>No NIC document uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applicant Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
                  {registration.imagePath ? (
                    <img 
                      src={registration.imagePath} 
                      alt="Applicant Photo" 
                      className="w-full rounded max-h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <p>No photo uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {registration.comments && (
            <Card>
              <CardHeader>
                <CardTitle>Review Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-gray-50 p-3 rounded">{registration.comments}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge 
                  className="mt-1 block w-fit" 
                  variant={registration.status === 'approved' ? 'default' : registration.status === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Reviewed Date</Label>
                <p>{formatDate(registration.reviewedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {registration.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Approve or reject this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleApprove} 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                  disabled={isProcessing}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Approve Registration"}
                </Button>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isProcessing}>
                      <X className="w-4 h-4 mr-2" />
                      Reject Registration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Registration</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Rejection Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowRejectDialog(false)
                          setRejectionReason("")
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
                        {isProcessing ? "Processing..." : "Reject Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Age:</span>
                <span className="font-medium">{age} years</span>
              </div>
              <div className="flex justify-between">
                <span>District:</span>
                <span className="font-medium">{registration.electoralDistrict}</span>
              </div>
              <div className="flex justify-between">
                <span>Division:</span>
                <span className="font-medium">{registration.pollingDivision}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}