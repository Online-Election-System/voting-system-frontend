"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Users, Edit, Save, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Household {
  id: string
  houseNumber: string | null
  villageStreetEstate: string | null
  chiefOccupantName: string
  chiefOccupantNic: string
  totalMembers: number
  lastUpdated: string
  status: string
}

interface HouseholdNote {
  householdId: string
  note: string
  updatedAt: string
}

export default function Households() {
  const [searchTerm, setSearchTerm] = useState("")
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, HouseholdNote>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load households from backend
  useEffect(() => {
    fetchHouseholds()
    loadNotesFromStorage()
  }, [])

  const fetchHouseholds = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/v1/households")
      if (!response.ok) {
        throw new Error("Failed to fetch households")
      }
      const data = await response.json()
      setHouseholds(data)
    } catch (error) {
      console.error("Error fetching households:", error)
      toast.error("Failed to load households")
    } finally {
      setLoading(false)
    }
  }

  // Load notes from localStorage
  const loadNotesFromStorage = () => {
    try {
      const savedNotes = localStorage.getItem("household_notes")
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
    } catch (error) {
      console.error("Error loading notes from storage:", error)
    }
  }

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: Record<string, HouseholdNote>) => {
    try {
      localStorage.setItem("household_notes", JSON.stringify(updatedNotes))
    } catch (error) {
      console.error("Error saving notes to storage:", error)
      toast.error("Failed to save note")
    }
  }

  // Handle note editing
  const openNoteDialog = (householdId: string) => {
    setEditingNote(householdId)
    setNoteText(notes[householdId]?.note || "")
    setIsDialogOpen(true)
  }

  const saveNote = () => {
    if (!editingNote) return
    const updatedNotes = {
      ...notes,
      [editingNote]: {
        householdId: editingNote,
        note: noteText,
        updatedAt: new Date().toISOString(),
      },
    }
    setNotes(updatedNotes)
    saveNotesToStorage(updatedNotes)
    setIsDialogOpen(false)
    setEditingNote(null)
    setNoteText("")
    toast.success("Note saved successfully")
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingNote(null)
    setNoteText("")
  }

  const filteredHouseholds = households.filter(
    (household) =>
      household.chiefOccupantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (household.villageStreetEstate?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (household.houseNumber || "").includes(searchTerm) ||
      household.chiefOccupantNic.includes(searchTerm),
  )

  const totalHouseholds = households.length
  const totalMembers = households.reduce((sum, h) => sum + h.totalMembers, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading households...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Household Management</h1>
          <p className="text-gray-600">Manage households and their members in your division</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{totalHouseholds}</div>
              <p className="text-sm text-gray-600">Total Households</p>
            </CardContent>
          </Card>
          <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{totalMembers}</div>
              <p className="text-sm text-gray-600">Total Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Search className="w-4 h-4 text-gray-700" />
              Search Households
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by chief occupant name, address, house number, or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Households Table */}
        <Card className="bg-white text-gray-900 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle>Households</CardTitle>
            <CardDescription className="text-gray-600">{filteredHouseholds.length} households found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-100">
                  <TableHead className="text-gray-700">House No.</TableHead>
                  <TableHead className="text-gray-700">Village / Street</TableHead>
                  <TableHead className="text-gray-700">Chief Occupant</TableHead>
                  <TableHead className="text-gray-700">Chief Occupant NIC</TableHead>
                  <TableHead className="text-gray-700">Members</TableHead>
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHouseholds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-600">
                      No households found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHouseholds.map((household) => (
                    <TableRow key={household.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{household.houseNumber || "N/A"}</TableCell>
                      <TableCell className="max-w-48 truncate text-gray-700">
                        {household.villageStreetEstate || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-900">{household.chiefOccupantName}</TableCell>
                      <TableCell className="text-gray-700">{household.chiefOccupantNic}</TableCell>
                      <TableCell className="text-gray-900">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          {household.totalMembers}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openNoteDialog(household.id)}
                            className="relative text-gray-600 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                            {notes[household.id] && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </Button>
                          {notes[household.id] && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openNoteDialog(household.id)}
                              title="View note"
                              className="text-gray-600 hover:bg-gray-100"
                            >
                              <FileText className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Note Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 border-gray-200">
            <DialogHeader>
              <DialogTitle>Household Note</DialogTitle>
              <DialogDescription className="text-gray-600">Add or edit a note for this household.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Enter your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className="bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-gray-500"
              />
              {editingNote && notes[editingNote] && (
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(notes[editingNote].updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDialog}
                className="text-gray-600 hover:bg-gray-100 border-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={saveNote} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white">
                <Save className="w-4 h-4" />
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
