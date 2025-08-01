"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, Download, Eye, Loader2, AlertCircle } from "lucide-react"
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

interface RegistrationDetail {
  fullName: string
  nic: string
  dob: string
  phone?: string
  gender: string
  civilStatus: string
  electoralDistrict: string
  pollingDivision: string
  pollingDistrictNumber: string
  gramaNiladhariDivision?: string
  village?: string
  houseNumber?: string
  address: string
  status: string
  idCopyPath?: string
  photoCopyPath?: string
  role: string
}

const API_BASE_URL = "http://localhost:8080/api/v1"

export default function RegistrationDetail({ params }: { params: Promise<{ id: string }> }) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nicId, setNicId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setNicId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!nicId) return

    const fetchRegistration = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/registrations/application/${nicId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch registration: ${response.status} ${response.statusText} - ${errorText}`)
        }
        const data = await response.json()
        setRegistration(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching registration detail:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [nicId])

  const handleApprove = async () => {
    if (!nicId || isProcessing) return

    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/registrations/${nicId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to approve registration: ${response.status} ${response.statusText} - ${errorText}`)
      }

      // Refresh the data after approval
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Failed to approve registration")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!nicId || !rejectionReason.trim() || isProcessing) return

    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/registrations/${nicId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to reject registration: ${response.status} ${response.statusText} - ${errorText}`)
      }

      setShowRejectDialog(false)
      setRejectionReason("")
      // Refresh the data after rejection
      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Failed to reject registration")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading registration details...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Registration not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
            <Link href="/government-official/registrations">
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription className="text-gray-600">Basic details of the applicant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-gray-900">{registration.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">NIC Number</Label>
                    <p className="text-gray-900 font-mono">{registration.nic}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                    <p className="text-gray-900">{registration.dob}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                    <p className="text-gray-900">{registration.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Gender</Label>
                    <p className="text-gray-900 capitalize">{registration.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Civil Status</Label>
                    <p className="text-gray-900 capitalize">{registration.civilStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Electoral Information */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Electoral Information</CardTitle>
                <CardDescription className="text-gray-600">Electoral district & polling details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Electoral District</Label>
                    <p className="text-gray-900">{registration.electoralDistrict}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Polling Division</Label>
                    <p className="text-gray-900">{registration.pollingDivision}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Polling District Number</Label>
                    <p className="text-gray-900">{registration.pollingDistrictNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Grama Niladhari Division</Label>
                    <p className="text-gray-900">{registration.gramaNiladhariDivision || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription className="text-gray-600">Residential address details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Village/Street/Estate</Label>
                    <p className="text-gray-900">{registration.village || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">House Number</Label>
                    <p className="text-gray-900">{registration.houseNumber || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription className="text-gray-600">Submitted identity documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NIC Document */}
                {registration.idCopyPath && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">NIC Document</Label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">National Identity Card</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-gray-600 hover:bg-gray-100 bg-transparent"
                          >
                            <a href={registration.idCopyPath} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-gray-600 hover:bg-gray-100 bg-transparent"
                          >
                            <a href={registration.idCopyPath} download>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                      <img
                        src={registration.idCopyPath || "/placeholder.svg"}
                        alt="NIC Document"
                        className="w-full h-48 object-contain border border-gray-200 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextSibling) nextSibling.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden text-gray-500 text-center py-8">Document preview not available</div>
                    </div>
                  </div>
                )}
                {/* Photo Document */}
                {registration.photoCopyPath && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Photo</Label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Applicant Photo</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-gray-600 hover:bg-gray-100 bg-transparent"
                          >
                            <a href={registration.photoCopyPath} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="text-gray-600 hover:bg-gray-100 bg-transparent"
                          >
                            <a href={registration.photoCopyPath} download>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                      <img
                        src={registration.photoCopyPath || "/placeholder.svg"}
                        alt="Applicant Photo"
                        className="w-full h-48 object-contain border border-gray-200 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextSibling) nextSibling.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden text-gray-500 text-center py-8">Photo preview not available</div>
                    </div>
                  </div>
                )}
                {!registration.idCopyPath && !registration.photoCopyPath && (
                  <div className="text-gray-500 text-center py-8">No documents available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription className="text-gray-600">Current status details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge
                        className={
                          registration.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : registration.status === "approved"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {registration.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription className="text-gray-600">Approve or reject this application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={registration.status !== "pending" || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Approve Registration
                      </>
                    )}
                  </Button>

                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={registration.status !== "pending" || isProcessing}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Registration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-gray-900 border-gray-200">
                      <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Please provide a reason for rejecting this registration application.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejection-reason" className="text-gray-700">
                            Rejection Reason
                          </Label>
                          <Textarea
                            id="rejection-reason"
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
                            "Reject Application"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application ID:</span>
                    <span className="font-mono text-gray-900">{registration.nic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span className="capitalize text-gray-900">{registration.role.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">District:</span>
                    <span className="text-gray-900">{registration.electoralDistrict}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
