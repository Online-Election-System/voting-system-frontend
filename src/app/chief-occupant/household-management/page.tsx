"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, XCircle, Clock, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import { AddHouseholdMemberForm } from "./manage/addform"
import { UpdateHouseholdMemberForm } from "./manage/updateform"
import { DeleteHouseholdMemberDialog } from "./manage/removeform"
import axios from "axios";

interface HouseholdMember {
  memberId: string
  memberName: string
  fullName: string
  nic: string
  status: string
  rejectionReason: string
  relationship: string
  relationshipWithChiefOccupant: string
}

interface ChiefOccupant {
  memberId: string
  fullName: string
  nic: string
  status: string
  role: string
}

// Add this right after your interface definitions, before the component
const emptyChiefOccupant: ChiefOccupant = {
  memberId: '',
  fullName: '',
  nic: '',
  status: '',
  role: ''
}

export default function HouseholdManagementPage() {
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([])
  const [chiefOccupant, setChiefOccupant] = useState<ChiefOccupant | null>(null)
  const [totalMembers, setTotalMembers] = useState(0)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isUpdateMemberDialogOpen, setIsUpdateMemberDialogOpen] = useState(false)
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    // Prevent server-side execution
    if (typeof window === "undefined") return;

    const chiefOccupantId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!chiefOccupantId) {
      setError("User ID not found in localStorage.");
      return;
    }

    async function fetchHouseholdData() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `http://localhost:8080/household-management/api/v1/household/${chiefOccupantId}/members`,
          {
            headers: {
              "Content-Type": "application/json"
            },
            withCredentials: true
          }
        );

        const data = res.data;

        // Transform members to include all required properties
        const membersWithIds = data.members?.map((member: any) => ({
          memberId: member.memberId || member.nic, // Fallback to NIC if memberId doesn't exist
          memberName: member.memberName,
          fullName: member.fullName || member.memberName, // Use fullName if available, fallback to memberName
          nic: member.nic,
          relationship: member.relationship,
          relationshipWithChiefOccupant: member.relationshipWithChiefOccupant || member.relationship, // Use specific property if available
          status: member.status || '',
          rejectionReason: member.rejectionReason || ''
        })) || [];

        setHouseholdMembers(membersWithIds);
        
        // Transform chief occupant data
        setChiefOccupant(data.chiefOccupant ? {
          memberId: data.chiefOccupant.memberId || chiefOccupantId,
          fullName: data.chiefOccupant.fullName,
          nic: data.chiefOccupant.nic,
          status: data.chiefOccupant.status || '',
          role: data.chiefOccupant.role || ''
        } : null);

        setTotalMembers(data.totalMembers || 0);

        } catch (error: any) {
        console.error("Failed to fetch household data", error);
        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch household data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHouseholdData();
  }, [])

  const handleResubmit = (nic: string) => {
    alert(`Resubmission requested for NIC: ${nic}`)
    setHouseholdMembers((prev) =>
      prev.map((member) =>
        member.nic === nic ? { ...member, status: "☑ Pending", rejectionReason: "Pending" } : member,
      ),
    )
  }

  const getStatusBadge = (status: string) => {
    if (status.includes("Approved")) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle className="mr-1 h-3 w-3" /> Approved
        </Badge>
      )
    } else if (status.includes("Rejected")) {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading household data...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">Error: {error}</div>
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Household Management</h1>
              <p className="mt-2 text-muted-foreground">Manage your household members and their enrollment status.</p>
              {chiefOccupant && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Chief Occupant: <span className="font-medium">{chiefOccupant.fullName}</span> ({chiefOccupant.nic})
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <AddHouseholdMemberForm />
                </DialogContent>
              </Dialog>

              <Dialog open={isUpdateMemberDialogOpen} onOpenChange={setIsUpdateMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Update Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <UpdateHouseholdMemberForm 
                    householdMembers={householdMembers} 
                    chiefOccupant={chiefOccupant || emptyChiefOccupant}
                    onSuccess={() => setIsUpdateMemberDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isDeleteMemberDialogOpen} onOpenChange={setIsDeleteMemberDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Member
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DeleteHouseholdMemberDialog 
                    chiefOccupant={chiefOccupant || emptyChiefOccupant}
                    householdMembers={householdMembers}
                    onSuccess={() => setIsDeleteMemberDialogOpen(false)}
                    />
                </DialogContent>
                </Dialog>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Household Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <p className="text-xs text-muted-foreground">Current count of registered members.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {householdMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No household members found
                    </TableCell>
                  </TableRow>
                ) : (
                  householdMembers.map((member, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{member.memberName}</TableCell>
                      <TableCell>{member.nic}</TableCell>
                      <TableCell>{member.relationship}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.status.includes("Rejected") ? member.rejectionReason : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.status.includes("Rejected") && (
                          <Button variant="outline" size="sm" onClick={() => handleResubmit(member.nic)}>
                            Resubmit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}