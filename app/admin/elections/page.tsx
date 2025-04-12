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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Sample data for elections
const initialElections = [
  {
    id: 1,
    title: "Presidential Election 2024",
    type: "National",
    date: new Date(2024, 10, 5),
    startTime: "07:00",
    endTime: "19:00",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Local Council Election",
    type: "Regional",
    date: new Date(2024, 11, 12),
    startTime: "08:00",
    endTime: "18:00",
    status: "Scheduled",
  },
  {
    id: 3,
    title: "Parliamentary By-Election",
    type: "District",
    date: new Date(2025, 0, 15),
    startTime: "08:00",
    endTime: "17:00",
    status: "Scheduled",
  },
  {
    id: 4,
    title: "Mayoral Election 2023",
    type: "City",
    date: new Date(2023, 5, 10),
    startTime: "07:00",
    endTime: "19:00",
    status: "Completed",
  },
]

export default function ElectionsPage() {
  const [elections, setElections] = useState(initialElections)
  const [open, setOpen] = useState(false)
  const [editingElection, setEditingElection] = useState<any>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("Scheduled")

  const handleAddElection = () => {
    if (!date) return

    const newElection = {
      id: elections.length + 1,
      title,
      type,
      date,
      startTime,
      endTime,
      description,
      status,
    }

    setElections([...elections, newElection])
    resetForm()
    setOpen(false)
  }

  const handleEditElection = (election: any) => {
    setEditingElection(election)
    setTitle(election.title)
    setType(election.type)
    setDate(election.date)
    setStartTime(election.startTime)
    setEndTime(election.endTime)
    setDescription(election.description || "")
    setStatus(election.status)
    setOpen(true)
  }

  const handleUpdateElection = () => {
    if (!date) return

    const updatedElections = elections.map((e) =>
      e.id === editingElection.id ? { ...e, title, type, date, startTime, endTime, description, status } : e,
    )

    setElections(updatedElections)
    resetForm()
    setOpen(false)
  }

  const handleDeleteElection = (id: number) => {
    setElections(elections.filter((e) => e.id !== id))
  }

  const resetForm = () => {
    setTitle("")
    setType("")
    setDate(undefined)
    setStartTime("")
    setEndTime("")
    setDescription("")
    setStatus("Scheduled")
    setEditingElection(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Elections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Election
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingElection ? "Edit Election" : "Add New Election"}</DialogTitle>
              <DialogDescription>
                {editingElection
                  ? "Update the election information below."
                  : "Fill in the details to schedule a new election."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Election Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter election title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Election Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select election type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="District">District</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Election Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter election details"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
              <Button onClick={editingElection ? handleUpdateElection : handleAddElection}>
                {editingElection ? "Update" : "Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elections List</CardTitle>
          <CardDescription>Manage all scheduled and past elections</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell>{election.type}</TableCell>
                  <TableCell>{format(election.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{`${election.startTime} - ${election.endTime}`}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        election.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : election.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : election.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : election.status === "Upcoming"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {election.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditElection(election)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteElection(election.id)}>
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

