"use client"

import type React from "react"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"

export function DeleteHouseholdMemberDialog() {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [documentUpload, setDocumentUpload] = useState<File | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Dummy data for household members
  const householdMembers = [
    { id: "1", name: "Jane Doe", nic: "123456789V" },
    { id: "2", name: "Peter Pan", nic: "987654321V" },
  ]

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) {
      alert("Please select a member to delete.")
      return
    }
    console.log("Submitting household member deletion:", {
      selectedMember,
      documentUpload,
    })
    // In a real application, you would send this data to a server action or API route
    alert("Household member deletion submitted for GN Officer approval.")
    setIsOpen(false) // Close dialog on submission
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Household Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Household Member</DialogTitle>
          <DialogDescription>
            Select the member to delete and upload the required document (e.g., Death Certificate, Proof of Aborted
            Residence).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDelete} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="select-member">Select Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember} required>
              <SelectTrigger id="select-member">
                <SelectValue placeholder="Select a household member" />
              </SelectTrigger>
              <SelectContent>
                {householdMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.nic})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMember && (
            <div className="grid gap-2">
              <Label htmlFor="document-upload">Required Document (PDF/Image)</Label>
              <Input
                id="document-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentUpload(e.target.files ? e.target.files[0] : null)}
                required
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!selectedMember || !documentUpload}>
              Submit for Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
