"use client"

import { CalendarIcon, Upload, X, Check, FileText } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFileUpload } from "../../register/hooks/use-file-upload-hook"
import { useRef, useState, useEffect } from "react"
import axios from "axios"

export function AddHouseholdMemberForm() {
  const [fullName, setFullName] = useState("")
  const [nicNumber, setNicNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [gender, setGender] = useState<"Male" | "Female">("Male")
  const [civilStatus, setCivilStatus] = useState("")
  const [relationship, setRelationship] = useState("")
  const [chiefOccupantApproval, setChiefOccupantApproval] = useState<"approve" | "disapprove">("approve")
  const chiefOccupantId = localStorage.getItem("userId")

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const isFileUploadEnabled = nicNumber.length > 0

  // Enhanced file upload hook
  const {
    uploadFile,
    uploading,
    progress,
    error: uploadError,
    resetUploadState,
    cleanupCurrentFiles,
    cleanupSpecificFile,
  } = useFileUpload({
    bucket: 'verification',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
    cleanupOnUnmount: false,
  })

  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (file: File) => {
    if (!isFileUploadEnabled) {
      alert('Please enter NIC number before uploading the file')
      return
    }

    setSelectedFile(file);
    const currentFileUrl = documentUrl === null ? undefined : documentUrl;
    const uploadedFileUrl = await uploadFile(
      file, 
      nicNumber, // This will be used in generateStandardFileName
      currentFileUrl, 
      !!documentUrl // shouldDeletePrevious flag
    );
    if (uploadedFileUrl) {
      setDocumentUrl(uploadedFileUrl)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleFileSelect(file)
    }
  }

  const removeFile = async () => {
    if (documentUrl) {
      // Extract path after the bucket name
      const urlParts = documentUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('verification') + 1).join('/');
      await cleanupSpecificFile(filePath);
    }
    setDocumentUrl(null);
    setSelectedFile(null);
    resetUploadState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasUploadedFile = !!documentUrl
  const isPdf = hasUploadedFile && documentUrl.toLowerCase().includes('.pdf')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append("fullName", fullName)
      formData.append("nicNumber", nicNumber)
      formData.append("dateOfBirth", dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : "")
      formData.append("gender", gender)
      formData.append("civilStatus", civilStatus)
      formData.append("relationshipToChief", relationship)
      formData.append("chiefOccupantId", chiefOccupantId ?? "")
      formData.append("chiefOccupantApproval", chiefOccupantApproval)
      formData.append("requestStatus", "PENDING")
      
      if (documentUrl) {
        formData.append("documentUrl", documentUrl);
        // Extract the path from the URL to store in your database
        const urlParts = documentUrl.split('/');
        const filePath = urlParts[urlParts.length - 1];
        formData.append("documentPath", filePath);
      }

      const response = await axios.post(
        "http://localhost:8080/household-management/api/v1/add-member", 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      console.log("API Response:", response.data)
      alert("Household member addition submitted for GN Officer approval.")
      
      // Reset form after successful submission
      setFullName("")
      setNicNumber("")
      setDateOfBirth(undefined)
      setGender("Male")
      setCivilStatus("")
      setRelationship("")
      setDocumentUrl(null)
      setSelectedFile(null)

    } catch (err: any) {
      console.error("Error submitting add-member request:", err)
      alert("Submission failed: " + err.message)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Add Household Member</CardTitle>
        <CardDescription>
          Fill in the details for the new household member and upload required documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nicNumber">NIC Number</Label>
              <Input
                id="nicNumber"
                placeholder="Enter NIC number"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
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
                    {dateOfBirth ? (
                      format(dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
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
            <div className="grid gap-2">
              <Label>Gender</Label>
              <RadioGroup
                defaultValue="Male"
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
            <div className="grid gap-2">
              <Label htmlFor="civilStatus">Civil Status</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="relationship">Relationship with Chief Occupant</Label>
              <Input
                id="relationship"
                placeholder="E.g., Spouse, Child, Parent"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
              />
            </div>
           </div>

           {/* Enhanced Document Upload Section */}
           <div className="grid gap-2">
            <Label htmlFor="document">NIC / Birth Certificate Document</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                dragOver && "border-blue-500 bg-blue-50",
                hasUploadedFile && "border-green-500 bg-green-50",
                uploadError && "border-red-500 bg-red-50",
                !dragOver && !hasUploadedFile && !uploadError && "border-gray-300 hover:border-gray-400",
                !isFileUploadEnabled && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!uploading && isFileUploadEnabled) {
                  fileInputRef.current?.click()
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="document"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploading || !isFileUploadEnabled}
              />

              {uploading ? (
                <div className="space-y-2">
                  <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                </div>
              ) : hasUploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">
                      {isPdf ? "Document uploaded successfully" : "Image uploaded successfully"}
                    </span>
                  </div>
                  
                  {isPdf ? (
                    <div className="relative inline-block p-4 border-2 border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">PDF Document</p>
                          <p className="text-xs text-gray-500">NIC Certificate</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={documentUrl}
                        alt="Uploaded Document"
                        className="max-h-48 rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 justify-center">
                    {isPdf && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(documentUrl, '_blank')
                        }}
                      >
                        View PDF
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      Replace {isPdf ? "Document" : "Image"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
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
                    {selectedFile && !hasUploadedFile && (
                      <p className="mt-2 text-sm text-blue-600">Selected file: {selectedFile.name}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-red-500 mt-2">{uploadError}</p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Please upload a clear image or PDF of your National Identity Card (NIC) or Birth Certificate.
              For images, both front and back sides should be visible and readable.
            </p>
           </div>

           <div className="grid gap-2">
            <Label>Chief Occupant Approval</Label>
            <RadioGroup
              defaultValue="approve"
              value={chiefOccupantApproval}
              onValueChange={(value: "approve" | "disapprove") => setChiefOccupantApproval(value)}
              className="flex flex-col space-y-2"
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

           <Button type="submit" className="w-full" disabled={uploading}>
            Submit for Approval
           </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}