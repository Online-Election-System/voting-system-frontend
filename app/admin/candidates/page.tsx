"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

// Sample data for candidates
const initialCandidates = [
  { id: 1, name: "John Smith", party: "Democratic Party", position: "President", status: "Approved" },
  { id: 2, name: "Jane Doe", party: "Republican Party", position: "President", status: "Pending" },
  { id: 3, name: "Robert Johnson", party: "Independent", position: "Vice President", status: "Approved" },
  { id: 4, name: "Sarah Williams", party: "Green Party", position: "President", status: "Rejected" },
]

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [open, setOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<any>(null)

  // Form state
  const [name, setName] = useState("")
  const [party, setParty] = useState("")
  const [position, setPosition] = useState("")
  const [status, setStatus] = useState("Pending")

  const handleAddCandidate = () => {
    const newCandidate = {
      id: candidates.length + 1,
      name,
      party,
      position,
      status,
    }

    setCandidates([...candidates, newCandidate])
    resetForm()
    setOpen(false)
  }

  const handleEditCandidate = (candidate: any) => {
    setEditingCandidate(candidate)
    setName(candidate.name)
    setParty(candidate.party)
    setPosition(candidate.position)
    setStatus(candidate.status)
    setOpen(true)
  }

  const handleUpdateCandidate = () => {
    const updatedCandidates = candidates.map((c) =>
      c.id === editingCandidate.id ? { ...c, name, party, position, status } : c,
    )

    setCandidates(updatedCandidates)
    resetForm()
    setOpen(false)
  }

  const handleDeleteCandidate = (id: number) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  const resetForm = () => {
    setName("")
    setParty("")
    setPosition("")
    setStatus("Pending")
    setEditingCandidate(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Candidates</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
              <DialogDescription>
                {editingCandidate
                  ? "Update the candidate information below."
                  : "Fill in the details to add a new candidate."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter candidate's full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="party">Political Party</Label>
                <Input
                  id="party"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder="Enter political party"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="President">President</SelectItem>
                    <SelectItem value="Vice President">Vice President</SelectItem>
                    <SelectItem value="Senator">Senator</SelectItem>
                    <SelectItem value="Governor">Governor</SelectItem>
                    <SelectItem value="Mayor">Mayor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingCandidate ? handleUpdateCandidate : handleAddCandidate}>
                {editingCandidate ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates List</CardTitle>
          <CardDescription>Manage all candidates for upcoming elections</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Political Party</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.party}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : candidate.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCandidate(candidate)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCandidate(candidate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

