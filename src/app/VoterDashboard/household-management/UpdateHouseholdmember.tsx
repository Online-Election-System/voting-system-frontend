"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function UpdateHouseholdMemberForm() {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [documentUpload, setDocumentUpload] = useState<File | null>(null)

  // Dummy data for household members
  const householdMembers = [
    { id: "1", name: "Jane Doe", nic: "123456789V" },
    { id: "2", name: "Peter Pan", nic: "987654321V" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) {
      alert("Please select a member to update.")
      return
    }
    console.log("Submitting household member update:", {
      selectedMember,
      documentUpload,
      // ... other updated fields
    })
    // In a real application, you would send this data to a server action or API route
    alert("Household member update submitted for GN Officer approval.")
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Update Household Member</CardTitle>
        <CardDescription>
          Select a member to update their details and upload relevant supporting documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <>
              <div className="grid gap-2">
                <Label htmlFor="new-name">New Full Name (Optional)</Label>
                <Input id="new-name" placeholder="New Name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-address">New Resident Area (Optional)</Label>
                <Textarea id="new-address" placeholder="New Address" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document-upload">
                  Relevant Certificate (e.g., Marriage Certificate for name change, Utility Bill for address change)
                  (PDF/Image)
                </Label>
                <Input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocumentUpload(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Update for Approval
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
