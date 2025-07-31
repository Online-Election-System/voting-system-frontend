"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFileUpload } from "@/src/app/register/hooks/use-file-upload-hook"
import { Check, X, Upload, FileText, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { cn } from "@/src/lib/utils"
import { isAuthenticated } from "@/src/lib/cookies"

interface HouseholdMember {
  memberId: string
  memberName: string
  fullName: string
  nic: string
  relationshipWithChiefOccupant: string
}

interface ChiefOccupant {
  memberId: string
  fullName: string
  nic: string
}

interface DeleteHouseholdMemberDialogProps {
  chiefOccupant: ChiefOccupant
  householdMembers: HouseholdMember[]
  onSuccess?: () => void
}

export function DeleteHouseholdMemberDialog({ 
  chiefOccupant, 
  householdMembers = [], 
  onSuccess 
}: DeleteHouseholdMemberDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Combined members array
  const allMembers = useMemo(() => [
    ...(chiefOccupant ? [{
      id: chiefOccupant.memberId,
      nic: chiefOccupant.nic,
      name: chiefOccupant.fullName,
      relationship: "Chief Occupant",
      isChiefOccupant: true
    }] : []),
    ...householdMembers.map(member => ({
      id: member.memberId,
      nic: member.nic,
      name: member.fullName || member.memberName,
      relationship: member.relationshipWithChiefOccupant,
      isChiefOccupant: false
    }))
  ], [chiefOccupant, householdMembers])

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

  const handleDocumentUpload = async (file: File) => {
    // Check authentication before upload
    if (!isAuthenticated()) {
      setError("Authentication required. Please log in.")
      router.push("/login")
      return null
    }

    if (!selectedMember) {
      alert('Please select a member first')
      return null
    }

    const member = allMembers.find(m => m.id === selectedMember)
    if (!member) return null

    const nicNumber = member.nic || member.id
    
    try {
      const uploadedUrl = await uploadFileToFolder(
        file, 
        'DeleteRequestDocs',
        nicNumber,
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleDocumentUpload(file)
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
      handleDocumentUpload(file)
    }
  }

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

  const handleDelete = async (e: React.FormEvent) => {
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
      setError('Please select a member')
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

      // Prevent chief occupant deletion
      if (member.isChiefOccupant) {
        setError('Chief occupant cannot be deleted through this form')
        setLoading(false)
        return
      }

      const deleteRequest = {
        deleteRequestId: uuidv4(),
        chiefOccupantId: chiefOccupant.memberId,
        householdMemberId: selectedMember,
        requestStatus: 'PENDING',
        requiredDocumentPath: documentUrl
      }

      const response = await fetch(`${API_BASE_URL}/household-management/api/v1/delete-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(deleteRequest),
      })

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please log in again.")
          router.push("/login")
          return
        }

        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit delete request')
      }

      const result = await response.json()
      alert(`Delete request submitted successfully! Request ID: ${result.requestId}`)

      // Reset form
      setSelectedMember('')
      setDocumentUrl(null)
      resetUploadState()
      if (fileInputRef.current) fileInputRef.current.value = ''

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit delete request')
      console.error("Delete error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete Household Member</DialogTitle>
          <DialogDescription>
            Select a member to delete and upload relevant supporting documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="member">Select Member *</Label>
            <Select 
              value={selectedMember} 
              onValueChange={setSelectedMember}
              required
            >
              <SelectTrigger id="member">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {allMembers.filter(m => !m.isChiefOccupant).map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.nic || 'N/A'}) - {member.relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMember && (
            <div className="grid gap-2">
              <Label htmlFor="document">Supporting Document *</Label>
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
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
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
              {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={!selectedMember || !documentUrl || loading || uploading}
          >
            {loading ? "Submitting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
