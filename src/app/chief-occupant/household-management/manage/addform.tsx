"use client"

import { CalendarIcon, Upload, X, Check, FileText } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/src/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useFileUpload } from "@/src/app/register/hooks/use-file-upload-hook"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { v4 as uuidv4 } from 'uuid'
import { getUserId, isAuthenticated } from "@/src/lib/cookies"

export function AddHouseholdMemberForm() {
  const [fullName, setFullName] = useState("")
  const [nicNumber, setNicNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [gender, setGender] = useState<"Male" | "Female">("Male")
  const [civilStatus, setCivilStatus] = useState("")
  const [relationship, setRelationship] = useState("")
  const [chiefOccupantApproval, setChiefOccupantApproval] = useState<"approve" | "disapprove">("approve")
  const [chiefOccupantId, setChiefOccupantId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  // File upload refs and states
  const nicFileInputRef = useRef<HTMLInputElement>(null)
  const [nicDragOver, setNicDragOver] = useState(false)
  const isFileUploadEnabled = nicNumber.length > 0
  const [selectedNicFile, setSelectedNicFile] = useState<File | null>(null)

  // NIC Document upload hook
  const {
    uploadFile: uploadNicDocument,
    uploading: uploadingNic,
    progress: nicProgress,
    error: nicError,
    resetUploadState: resetNicState,
    cleanupSpecificFile: cleanupNicFile,
  } = useFileUpload({
    bucket: 'verification',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  })

  const [nicDocumentUrl, setNicDocumentUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Authentication check and setup
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check authentication
    if (!isAuthenticated()) {
      setAuthError("Not authenticated. Please log in.")
      router.push("/login")
      return
    }

    const userId = getUserId()
    if (!userId) {
      setAuthError("User ID not found in session.")
      router.push("/login")
      return
    }

    setChiefOccupantId(userId)
    setAuthError(null)
  }, [router])

  // Handle NIC document upload
  const handleNicFileSelect = async (file: File) => {
    if (!isFileUploadEnabled) {
      alert('Please enter NIC number before uploading the document')
      return
    }
    setSelectedNicFile(file)
    const uploadedUrl = await uploadNicDocument(file, nicNumber, nicDocumentUrl || undefined, !!nicDocumentUrl)
    if (uploadedUrl) {
      setNicDocumentUrl(uploadedUrl)
    }
  }

  // Handle NIC file input change
  const handleNicFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleNicFileSelect(file)
    }
  }

  // Handle NIC drag events
  const handleNicDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setNicDragOver(true)
  }

  const handleNicDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setNicDragOver(false)
  }

  const handleNicDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setNicDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleNicFileSelect(file)
    }
  }

  // Remove NIC file
  const removeNicFile = async () => {
    if (nicDocumentUrl) {
      await cleanupNicFile(nicDocumentUrl)
      setNicDocumentUrl(null)
      resetNicState()
      setSelectedNicFile(null)
      if (nicFileInputRef.current) {
        nicFileInputRef.current.value = ""
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Check authentication before submission
    if (!chiefOccupantId) {
      setAuthError("Authentication required. Please log in.")
      setIsSubmitting(false)
      router.push("/login")
      return
    }

    // Validate required fields
    if (!fullName || !nicNumber || !dateOfBirth || !civilStatus || !relationship) {
      alert("Please fill all required fields")
      setIsSubmitting(false)
      return
    }

    if (!nicDocumentUrl) {
      alert("Please upload NIC document")
      setIsSubmitting(false)
      return
    }

    try {
      const requestData = {
        addRequestId: uuidv4(), // Generate UUID on client side to match backend expectation
        chiefOccupantId,
        nicNumber,
        fullName,
        dateOfBirth: format(dateOfBirth, "yyyy-MM-dd"),
        gender,
        civilStatus,
        relationshipToChief: relationship,
        chiefOccupantApproval,
        requestStatus: "PENDING",
        nicOrBirthCertificatePath: nicDocumentUrl
      }

      console.log("Submitting:", requestData)

      const response = await axios.post(
        "http://localhost:8080/household-management/api/v1/add-member", 
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true // Ensure cookies are sent with request
        }
      )

      console.log("API Response:", response.data)
      alert("Household member addition submitted for GN Officer approval.")
      
      // Reset form
      setFullName("")
      setNicNumber("")
      setDateOfBirth(undefined)
      setGender("Male")
      setCivilStatus("")
      setRelationship("")
      setNicDocumentUrl(null)
      setSelectedNicFile(null)

    } catch (err: any) {
      console.error("Full error:", err)
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError("Authentication failed. Please log in again.")
        router.push("/login")
        return
      }
      
      if (err.response) {
        console.error("Response data:", err.response.data)
        console.error("Response status:", err.response.status)
        console.error("Response headers:", err.response.headers)
      }
      alert("Submission failed: " + (err.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show auth error if present
  if (authError) {
    return (
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Authentication Error</DialogTitle>
          <DialogDescription>
            {authError}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Button onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Household Member</DialogTitle>
        <DialogDescription>
          Fill in the details for the new household member and upload required documents.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Personal Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nicNumber">NIC Number *</Label>
              <Input
                id="nicNumber"
                placeholder="Enter NIC number"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    initialFocus
                    disabled={{ 
                      after: new Date(), 
                      before: new Date(new Date().setFullYear(new Date().getFullYear() - 120)) 
                    }}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup
                value={gender}
                onValueChange={(value: "Male" | "Female") => setGender(value)}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="gender-male" />
                  <Label htmlFor="gender-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="gender-female" />
                  <Label htmlFor="gender-female">Female</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="civilStatus">Civil Status *</Label>
              <Select value={civilStatus} onValueChange={setCivilStatus} required>
                <SelectTrigger id="civilStatus">
                  <SelectValue placeholder="Select civil status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship with Chief Occupant *</Label>
              <Input
                id="relationship"
                placeholder="E.g., Spouse, Child, Parent"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* NIC Document Upload Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">NIC Document</h3>
          <div className="space-y-2">
            <Label htmlFor="document">NIC / Birth Certificate *</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                nicDragOver && "border-blue-500 bg-blue-50",
                nicDocumentUrl && "border-green-500 bg-green-50",
                uploadingNic && "border-gray-300 bg-gray-50",
                !nicDragOver && !nicDocumentUrl && !uploadingNic && "border-gray-300 hover:border-gray-400",
                !isFileUploadEnabled && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={handleNicDragOver}
              onDragLeave={handleNicDragLeave}
              onDrop={handleNicDrop}
              onClick={() => !uploadingNic && isFileUploadEnabled && nicFileInputRef.current?.click()}
            >
              <input
                ref={nicFileInputRef}
                type="file"
                id="document"
                accept="image/*,.pdf"
                onChange={handleNicFileInputChange}
                className="hidden"
                disabled={uploadingNic || !isFileUploadEnabled}
              />

              {uploadingNic ? (
                <div className="space-y-2 p-4">
                  <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">Uploading... {nicProgress}%</p>
                </div>
              ) : nicDocumentUrl ? (
                <div className="space-y-3 p-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Document uploaded</span>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNicFile()
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images (PNG, JPG, WEBP) or PDF up to 5MB
                    </p>
                    {!isFileUploadEnabled && (
                      <p className="text-xs text-amber-600 mt-1">
                        Enter NIC number first to enable file upload
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {nicError && (
              <p className="text-sm text-red-500">{nicError}</p>
            )}
          </div>
        </div>

        {/* Approval Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Approval</h3>
          <div className="space-y-2">
            <Label>Chief Occupant Approval *</Label>
            <RadioGroup
              value={chiefOccupantApproval}
              onValueChange={(value: "approve" | "disapprove") => setChiefOccupantApproval(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approval-approve" />
                <Label htmlFor="approval-approve">I approve this member's registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disapprove" id="approval-disapprove" />
                <Label htmlFor="approval-disapprove">I do not approve this member's registration</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={uploadingNic || isSubmitting || !chiefOccupantId}
        >
          {isSubmitting ? "Submitting..." : "Submit for Approval"}
        </Button>
      </form>
    </DialogContent>
  )
}
