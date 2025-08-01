"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFileUpload } from "@/src/app/register/hooks/use-file-upload-hook"
import { Check, X, Upload, FileText } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { cn } from "@/src/lib/utils"
import { isAuthenticated } from "@/src/lib/cookies"

export interface HouseholdMember {
  memberId: string
  memberName: string
  nic: string
  phoneNumber?: string
  email?: string
  civilStatus?: string
  relationship: string
}

export interface ChiefOccupant {
  memberId: string
  fullName: string
  nic: string
  phoneNumber?: string
  email?: string
  civilStatus?: string
}

// Add interface for pending add requests
interface PendingAddRequest {
  id: string
  nic: string
  requestStatus: string
  memberName?: string
}

// Updated interface to match backend requirements
interface UpdateRequestData {
  updateRequestId: string
  chiefOccupantId: string
  householdMemberId: string | null
  newFullName?: string
  newCivilStatus?: string
  relevantCertificatePath: string
  reason: null
}

// Updated interface to include pendingAddRequests
interface UpdateHouseholdMemberFormProps {
  householdMembers?: HouseholdMember[]
  chiefOccupant?: ChiefOccupant
  pendingAddRequests?: PendingAddRequest[]
  onSuccess?: () => void
}

export function UpdateHouseholdMemberForm({ 
  householdMembers = [], 
  chiefOccupant,
  pendingAddRequests = [],
  onSuccess 
}: UpdateHouseholdMemberFormProps) {
  // State variables
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [newName, setNewName] = useState<string>("")
  const [newCivilStatus, setNewCivilStatus] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

  // File upload hook
  const {
    uploadFileToFolder,
    uploading,
    progress,
    error: uploadError,
    resetUploadState,
    cleanupSpecificFile,
  } = useFileUpload({
    bucket: 'verification',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
    cleanupOnUnmount: false,
  })

  // Remove document handler
  const removeDocument = async () => {
    if (documentUrl) {
      await cleanupSpecificFile(documentUrl)
      setDocumentUrl(null)
      resetUploadState()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleDocumentUpload(file)
    }
  }

  // Drag and drop handlers
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
      handleDocumentUpload(file)
    }
  }

  // Document upload handler
  const handleDocumentUpload = async (file: File) => {
    if (!selectedMember) {
      alert('Please select a household member first')
      return null
    }

    const member = allMembers.find(m => m.id === selectedMember)
    if (!member) return null

    try {
      const uploadedUrl = await uploadFileToFolder(
        file, 
        'UpdateRequestDocs',
        member.nic || member.id,
        documentUrl ?? undefined,
        false
      )
      
      if (uploadedUrl) {
        setDocumentUrl(uploadedUrl)
      }
      return uploadedUrl
    } catch (error) {
      console.error('File upload failed:', error)
      alert('File upload failed. Please try again.')
      return null
    }
  }

  // Combined members array with filtering for pending add requests
  const allMembers = useMemo(() => {
    // Get NICs of pending add requests to filter them out
    const pendingNICs = new Set(
      pendingAddRequests
        .filter(req => req.requestStatus === 'PENDING')
        .map(req => req.nic)
    )

    console.log('Pending NICs to exclude:', Array.from(pendingNICs))

    // Filter household members to exclude those with pending add requests
    const filteredHouseholdMembers = householdMembers.filter(member => {
      const shouldExclude = pendingNICs.has(member.nic)
      if (shouldExclude) {
        console.log(`Excluding member ${member.memberName} (${member.nic}) - has pending add request`)
      }
      return !shouldExclude
    })

    console.log(`Filtered household members: ${filteredHouseholdMembers.length} out of ${householdMembers.length}`)

    return [
      ...(chiefOccupant ? [{
        id: chiefOccupant.memberId,
        nic: chiefOccupant.nic,
        name: chiefOccupant.fullName,
        civilStatus: chiefOccupant.civilStatus,
        relationship: "Chief Occupant",
        isChiefOccupant: true
      }] : []),
      ...filteredHouseholdMembers.map(member => ({
        id: member.memberId,
        nic: member.nic,
        name: member.memberName,
        civilStatus: member.civilStatus,
        relationship: member.relationship,
        isChiefOccupant: false
      }))
    ]
  }, [chiefOccupant, householdMembers, pendingAddRequests])

  // Effect to set fields when member is selected
  useEffect(() => {
    if (selectedMember) {
      const member = allMembers.find(m => m.id === selectedMember)
      if (member) {
        setNewName(member.name)
        setNewCivilStatus(member.civilStatus || "")
      }
    } else {
      setNewName("")
      setNewCivilStatus("")
    }
  }, [selectedMember, allMembers])

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Check authentication before submission
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in.")
      setLoading(false)
      router.push("/login")
      return
    }

    if (!selectedMember) {
      setError('Please select a household member')
      setLoading(false)
      return
    }

    if (!documentUrl) {
      setError('Please upload a supporting document')
      setLoading(false)
      return
    }

    try {
      const member = allMembers.find(m => m.id === selectedMember)
      if (!member) throw new Error('Selected member not found')

      const isChiefOccupant = member.isChiefOccupant
      
      // Prepare request data - matching backend interface exactly
      const requestData: UpdateRequestData = {
        updateRequestId: uuidv4(),
        chiefOccupantId: chiefOccupant?.memberId || "",
        householdMemberId: isChiefOccupant ? null : selectedMember, // null for chief occupant
        relevantCertificatePath: documentUrl,
        reason: null // Always null as per backend
      }

      // Only include fields that are being changed
      if (newName && newName !== member.name) {
        requestData.newFullName = newName
      }
      
      if (newCivilStatus && newCivilStatus !== member.civilStatus) {
        requestData.newCivilStatus = newCivilStatus
      }

      // Validate at least one field is being updated
      if (!requestData.newFullName && !requestData.newCivilStatus) {
        throw new Error('At least one field must be updated')
      }

      const response = await fetch(`${API_BASE_URL}/household-management/api/v1/update-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please log in again.")
          router.push("/login")
          return
        }

        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit update request')
      }

      // Reset form on success
      setSelectedMember('')
      setNewName('')
      setNewCivilStatus('')
      setDocumentUrl(null)
      resetUploadState()
      if (fileInputRef.current) fileInputRef.current.value = ''

      alert('Update request submitted successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit update request')
    } finally {
      setLoading(false)
    }
  }

  // Render uploaded file component
  const renderUploadedFile = () => {
    if (!documentUrl) return null

    const isPdf = documentUrl.toLowerCase().includes('.pdf')

    return (
      <div className="space-y-3 mt-2">
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="font-medium">Document uploaded</span>
        </div>
        
        {isPdf ? (
          <div className="relative inline-block p-3 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-xs">PDF Document</p>
                <p className="text-xs text-gray-500">Supporting Document</p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={removeDocument}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={documentUrl}
              alt="Supporting Document"
              className="max-h-32 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={removeDocument}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(documentUrl, '_blank')}
          >
            View {isPdf ? 'PDF' : 'Image'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Replace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Update Household Member</CardTitle>
        <CardDescription>
          Select a member to update their name and civil status.
          {allMembers.length === 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              No household members available for update. All members may have pending add requests.
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="select-member">Select Member *</Label>
            <Select 
              value={selectedMember} 
              onValueChange={setSelectedMember} 
              required
              disabled={allMembers.length === 0}
            >
              <SelectTrigger id="select-member">
                <SelectValue 
                  placeholder={
                    allMembers.length === 0 
                      ? "No members available" 
                      : "Select a household member"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {allMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.nic}) - {member.relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="new-name">New Full Name</Label>
                <Input
                  id="new-name"
                  placeholder="Leave blank to keep current name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="civil-status">Civil Status</Label>
                <Select
                  value={newCivilStatus}
                  onValueChange={setNewCivilStatus}
                >
                  <SelectTrigger id="civil-status">
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
                <Label htmlFor="document-upload">
                  Supporting Document (PDF/Image) *
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                    dragOver && "border-blue-500 bg-blue-50",
                    documentUrl && "border-green-500 bg-green-50",
                    uploading && "border-gray-300 bg-gray-50",
                    !dragOver && !documentUrl && !uploading && "border-gray-300 hover:border-gray-400"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="document-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileInputChange}
                    required
                  />

                  {uploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                      <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                    </div>
                  ) : documentUrl ? (
                    renderUploadedFile()
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Click to upload</strong> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF or images up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full mt-2"
                disabled={loading || uploading || !documentUrl}
              >
                {loading ? "Submitting..." : "Submit Update Request"}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
