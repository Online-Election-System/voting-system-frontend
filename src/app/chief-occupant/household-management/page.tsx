"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, UserPlus, FileText, Eye, UserMinus } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import { AddHouseholdMemberForm } from "./manage/addform"
import { UpdateHouseholdMemberForm } from "./manage/updateform"
import { DeleteHouseholdMemberDialog } from "./manage/removeform"
import axios from "axios";
import { getUserId, isAuthenticated } from "@/src/lib/cookies"
import router from "next/router"

interface HouseholdMember {
  memberId: string
  memberName: string
  fullName: string
  nic: string
  status: string
  rejectionReason: string
  relationship: string
  relationshipWithChiefOccupant: string
  requestDate?: string
  isNewRequest?: boolean
}

interface ChiefOccupant {
  memberId: string
  fullName: string
  nic: string
  status: string
  role: string
}

// Updated interface to match actual backend response
interface UpdateRequest {
  updateRequestId: string
  chiefOccupantId: string
  householdMemberId: string | null
  memberName: string
  memberNic: string
  newFullName?: string
  newCivilStatus?: string
  requestStatus: string
  relevantCertificatePath: string
  requestDate: string
  rejectionReason?: string
  isChiefOccupantUpdate: boolean
}

// Interface for delete requests
interface DeleteRequest {
  deleteRequestId: string
  chiefOccupantId: string
  householdMemberId: string
  memberName: string
  memberNic: string
  requestStatus: string
  requiredDocumentPath: string
  requestDate: string
  reason: string
  rejectionReason?: string
}

// Add interface for pending add requests
interface PendingAddRequest {
  id: string
  nic: string
  requestStatus: string
  memberName?: string
}

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
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([])
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isUpdateMemberDialogOpen, setIsUpdateMemberDialogOpen] = useState(false)
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "—";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchHouseholdData = async () => {
      try {
        setLoading(true);
        setError(null);
        
    const chiefOccupantId = getUserId();

    if (!isAuthenticated()) {
    setError("Not authenticated. Please log in.")
    router.push("/login")
    return
    }

       
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

        setHouseholdMembers(data.members?.map((member: any) => ({
          memberId: member.memberId,
          memberName: member.fullName,
          fullName: member.fullName,
          nic: member.nic,
          status: member.status,
          rejectionReason: member.rejectionReason || "—",
          relationship: member.relationship,
          relationshipWithChiefOccupant: member.relationship,
          requestDate: member.requestDate,
          isNewRequest: member.isNewRequest || false
        })) || []);

        setChiefOccupant(data.chiefOccupant ? {
          memberId: data.chiefOccupant.memberId,
          fullName: data.chiefOccupant.fullName,
          nic: data.chiefOccupant.nic,
          status: data.chiefOccupant.status,
          role: data.chiefOccupant.role || "Chief Occupant"
        } : null);

        setTotalMembers(data.totalMembers || 0);

        // Set update requests from the main API response
        setUpdateRequests(data.updateRequests || []);

        // Set delete requests from the main API response
        setDeleteRequests(data.deleteRequests || []);

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
    };

    fetchHouseholdData();
  }, [])

  const refreshData = async () => {
    const chiefOccupantId = getUserId();

    try {
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
      setHouseholdMembers(data.members?.map((member: any) => ({
        memberId: member.memberId,
        memberName: member.fullName,
        fullName: member.fullName,
        nic: member.nic,
        status: member.status,
        rejectionReason: member.rejectionReason || "—",
        relationship: member.relationship,
        relationshipWithChiefOccupant: member.relationship,
        requestDate: member.requestDate,
        isNewRequest: member.isNewRequest || false
      })) || []);
      
      setChiefOccupant(data.chiefOccupant ? {
        memberId: data.chiefOccupant.memberId,
        fullName: data.chiefOccupant.fullName,
        nic: data.chiefOccupant.nic,
        status: data.chiefOccupant.status,
        role: data.chiefOccupant.role || "Chief Occupant"
      } : null);
      
      setTotalMembers(data.totalMembers || 0);

      // Set update requests from the main API response
      setUpdateRequests(data.updateRequests || []);

      // Set delete requests from the main API response
      setDeleteRequests(data.deleteRequests || []);
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  }

  const getStatusBadge = (status: string, isNewRequest?: boolean) => {
    const baseClasses = isNewRequest ? "ring-2 ring-blue-200" : "";
    
    switch (status) {
      case "Approved":
      case "APPROVED":
        return (
          <Badge className={`bg-green-500 hover:bg-green-600 text-white ${baseClasses}`}>
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "Rejected":
      case "REJECTED":
        return (
          <Badge variant="destructive" className={baseClasses}>
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      case "D. Funding":
        return (
          <Badge className={`bg-blue-500 hover:bg-blue-600 text-white ${baseClasses}`}>
            <Clock className="mr-1 h-3 w-3" /> D. Funding
          </Badge>
        );
      default:
        return (
          <Badge className={`bg-yellow-500 hover:bg-yellow-600 text-white ${baseClasses}`}>
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  }

  // Updated function to render only the fields that exist in the backend
  const renderUpdatedFields = (request: UpdateRequest) => {
    const fields = [];
    if (request.newFullName) fields.push(`Name: ${request.newFullName}`);
    if (request.newCivilStatus) fields.push(`Civil Status: ${request.newCivilStatus}`);
    
    return fields.length > 0 ? fields.join(", ") : "No changes specified";
  };

  // Filter members by status for better organization
  const pendingRequests = householdMembers.filter(m => m.status === "Pending");
  const approvedMembers = householdMembers.filter(m => m.status === "Approved");
  const rejectedRequests = householdMembers.filter(m => m.status === "Rejected");
  const reviewingRequests = householdMembers.filter(m => m.status === "D. Funding");

  // Separate existing members from new requests
  const existingApprovedMembers = householdMembers.filter(m => 
    m.status === "Approved" && !m.isNewRequest
  );
  const newMemberRequests = householdMembers.filter(m => m.isNewRequest);

  // Filter update requests by status
  const pendingUpdateRequests = updateRequests.filter(r => r.requestStatus === "PENDING");
  const approvedUpdateRequests = updateRequests.filter(r => r.requestStatus === "APPROVED");
  const rejectedUpdateRequests = updateRequests.filter(r => r.requestStatus === "REJECTED");

  // Filter delete requests by status
  const pendingDeleteRequests = deleteRequests.filter(r => r.requestStatus === "PENDING");
  const approvedDeleteRequests = deleteRequests.filter(r => r.requestStatus === "APPROVED");
  const rejectedDeleteRequests = deleteRequests.filter(r => r.requestStatus === "REJECTED");

  // Create pendingAddRequests from householdMembers with pending status
  const pendingAddRequests: PendingAddRequest[] = householdMembers
    .filter(member => member.status === "Pending" && member.isNewRequest)
    .map(member => ({
      id: member.memberId,
      nic: member.nic,
      requestStatus: "PENDING",
      memberName: member.fullName
    }));

  // Get only approved household members for the update form
  const approvedHouseholdMembers = householdMembers.filter(member => 
    member.status === "Approved" && !member.isNewRequest
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading household data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-200">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Household Management</h1>
            <p className="text-muted-foreground">
              Manage your household members and their enrollment status.
            </p>
            {chiefOccupant && (
              <p className="text-sm text-muted-foreground mt-1">
                Chief Occupant: <span className="font-medium">{chiefOccupant.fullName}</span> ({chiefOccupant.nic})
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <AddHouseholdMemberForm 
                  onSuccess={() => {
                    setIsAddMemberDialogOpen(false);
                    refreshData();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isUpdateMemberDialogOpen} onOpenChange={setIsUpdateMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Update
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <UpdateHouseholdMemberForm 
                  householdMembers={approvedHouseholdMembers}
                  chiefOccupant={chiefOccupant || emptyChiefOccupant}
                  pendingAddRequests={pendingAddRequests}
                  onSuccess={() => {
                    setIsUpdateMemberDialogOpen(false);
                    refreshData();
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteMemberDialogOpen} onOpenChange={setIsDeleteMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DeleteHouseholdMemberDialog 
                  householdMembers={approvedHouseholdMembers}
                  chiefOccupant={chiefOccupant || emptyChiefOccupant}
                  onSuccess={() => {
                    setIsDeleteMemberDialogOpen(false);
                    refreshData();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">Approved members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedRequests.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Update Requests</CardTitle>
              <Edit className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{updateRequests.length}</div>
              <p className="text-xs text-muted-foreground">Information updates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delete Requests</CardTitle>
              <UserMinus className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deleteRequests.length}</div>
              <p className="text-xs text-muted-foreground">Member removals</p>
            </CardContent>
          </Card>
        </div>

        {/* 1. HOUSEHOLD MEMBERS & ADD REQUESTS TABLE - FIRST */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Household Members & Add Requests
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current household members and new member requests are shown below.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 1st Row: Chief Occupant */}
                {chiefOccupant && (
                  <TableRow className="bg-green-50 border-l-4 border-l-green-500">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <strong>{chiefOccupant.fullName}</strong>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Chief</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{chiefOccupant.nic}</TableCell>
                    <TableCell className="font-medium">Chief Occupant</TableCell>
                    <TableCell>{getStatusBadge(chiefOccupant.status)}</TableCell>
                    <TableCell>—</TableCell>
                  </TableRow>
                )}

                {/* 2nd: Existing Approved Members */}
                {existingApprovedMembers.length > 0 && 
                  existingApprovedMembers.map((member) => (
                    <TableRow key={member.memberId} className="bg-green-50 border-l-4 border-l-green-400">
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{member.nic}</TableCell>
                      <TableCell>{member.relationship}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        {member.rejectionReason !== "—" ? member.rejectionReason : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                }

                {/* 3rd: New Member Requests */}
                {newMemberRequests.length > 0 && 
                  newMemberRequests
                    .sort((a, b) => {
                      // Sort by status priority: Pending -> D. Funding -> Approved -> Rejected
                      const statusOrder = { "Pending": 0, "D. Funding": 1, "Approved": 2, "Rejected": 3 };
                      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
                    })
                    .map((member) => (
                    <TableRow key={member.memberId} className="bg-blue-50 border-l-4 border-l-blue-400">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.fullName}
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">New Request</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{member.nic}</TableCell>
                      <TableCell>{member.relationship}</TableCell>
                      <TableCell>{getStatusBadge(member.status, member.isNewRequest)}</TableCell>
                      <TableCell>
                        {member.rejectionReason !== "—" ? member.rejectionReason : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                }

                {/* No data row */}
                {(!chiefOccupant && existingApprovedMembers.length === 0 && newMemberRequests.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No household members or requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 2. UPDATE REQUESTS TABLE - SECOND */}
        {updateRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-yellow-700" />
                Member Update Requests
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track the status of your member information update requests.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Updated Fields</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updateRequests
                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                    .map((request) => (
                    <TableRow 
                      key={request.updateRequestId}
                      className={`bg-yellow-50 ${request.requestStatus === "PENDING" ? "border-l-4 border-l-yellow-500" : ""}`}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.memberName}</div>
                          <div className="text-xs text-muted-foreground">{request.memberNic}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.isChiefOccupantUpdate ? "default" : "secondary"}>
                          {request.isChiefOccupantUpdate ? "Chief Occupant" : "Member"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate" title={renderUpdatedFields(request)}>
                          {renderUpdatedFields(request)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.requestStatus)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(request.requestDate)}
                      </TableCell>
                      <TableCell>
                        {request.relevantCertificatePath && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(request.relevantCertificatePath, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.rejectionReason || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 3. DELETE REQUESTS TABLE - THIRD */}
        {deleteRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-red-700" />
                Member Delete Requests
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track the status of your member deletion requests.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deleteRequests
                    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                    .map((request) => (
                    <TableRow 
                      key={request.deleteRequestId}
                      className={`bg-red-50 ${request.requestStatus === "PENDING" ? "border-l-4 border-l-red-500" : ""}`}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.memberName}</div>
                          <div className="text-xs text-muted-foreground">{request.memberNic}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.requestStatus)}
                      </TableCell>
                      <TableCell>
                        {request.requiredDocumentPath && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(request.requiredDocumentPath, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.rejectionReason || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}