"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, Download, Eye } from "lucide-react"
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

export default function RegistrationDetail({ params }: { params: { id: string } }) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Mock data - in real app, fetch based on params.id
  const registration = {
    id: params.id,
    fullName: "Saman Perera",
    nic: "199512345678",
    dob: "1995-03-15",
    phone: "0771234567",
    gender: "Male",
    civilStatus: "Married",
    electoralDistrict: "Colombo",
    pollingDivision: "Colombo Central",
    pollingDistrictNumber: "001",
    gramaNiladhariDivision: "Pettah",
    village: "Main Street",
    houseNumber: "45",
    address: "No. 45, Main Street, Colombo",
    status: "pending",
    submittedDate: "2024-01-15",
    submittedTime: "10:30 AM",
    nicDocument: "/placeholder.svg?height=400&width=600&text=NIC+Document",
  }

  const handleApprove = () => {
    console.log(`Approving registration ${params.id}`)
    // Implementation for approval
  }

  const handleReject = () => {
    console.log(`Rejecting registration ${params.id} with reason: ${rejectionReason}`)
    setShowRejectDialog(false)
    // Implementation for rejection
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/registrations">
            <ArrowLeft className="w-4 h-4" />
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
                <Badge
                  className={
                    registration.status === "pending"
                      ? "bg-gray-100 text-gray-800"
                      : registration.status === "approved"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {registration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-sm font-semibold">{registration.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">NIC Number</Label>
                  <p className="text-sm font-semibold">{registration.nic}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  <p className="text-sm">{registration.dob}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="text-sm">{registration.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gender</Label>
                  <p className="text-sm">{registration.gender}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Civil Status</Label>
                  <p className="text-sm">{registration.civilStatus}</p>
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
                  <Label className="text-sm font-medium text-gray-600">Electoral District</Label>
                  <p className="text-sm">{registration.electoralDistrict}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Polling Division</Label>
                  <p className="text-sm">{registration.pollingDivision}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Polling District Number</Label>
                  <p className="text-sm">{registration.pollingDistrictNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Grama Niladhari Division</Label>
                  <p className="text-sm">{registration.gramaNiladhariDivision}</p>
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
                  <Label className="text-sm font-medium text-gray-600">Village/Street/Estate</Label>
                  <p className="text-sm">{registration.village}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">House Number</Label>
                  <p className="text-sm">{registration.houseNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Full Address</Label>
                  <p className="text-sm">{registration.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NIC Document</CardTitle>
              <CardDescription>Scanned copy of National Identity Card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img
                    src={registration.nicDocument || "/placeholder.svg"}
                    alt="NIC Document"
                    className="w-full max-w-md mx-auto rounded border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Size
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Current status and submission details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge
                  className={`mt-1 ${
                    registration.status === "pending"
                      ? "bg-gray-100 text-gray-800"
                      : registration.status === "approved"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {registration.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Submitted Date</Label>
                <p className="text-sm">{registration.submittedDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Submitted Time</Label>
                <p className="text-sm">{registration.submittedTime}</p>
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
                <Button onClick={handleApprove} className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                  <Check className="w-4 h-4 mr-2" />
                  Approve Registration
                </Button>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <X className="w-4 h-4 mr-2" />
                      Reject Registration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Registration</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this registration application.
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
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        Reject Application
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
                <span className="text-gray-600">Application ID:</span>
                <span className="font-medium">#{registration.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">29 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">District:</span>
                <span className="font-medium">{registration.electoralDistrict}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}