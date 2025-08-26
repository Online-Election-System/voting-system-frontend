"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, UserPlus, FileText, Eye, UserMinus, User, Save } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFileUpload } from "@/src/app/register/hooks/use-file-upload-hook"

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
}

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

interface PendingAddRequest {
  id: string
  nic: string
  requestStatus: string
  memberName?: string
}

interface ChiefOccupantDetails {
  id: string;
  fullName: string;
  nic: string;
  phoneNumber?: string;
  dob: string;
  gender: string;
  civilStatus: string;
  email: string;
  idCopyPath?: string;
  photoCopyPath?: string;
}

interface MyHouseholdMember {
  id: string;
  chiefOccupantId: string;
  fullName: string;
  nic?: string;
  dob: string;
  gender: string;
  civilStatus: string;
  relationshipWithChiefOccupant: string;
  idCopyPath?: string;
  photoCopyPath?: string;
}

interface MyHouseholdDetails {
  id: string;
  chiefOccupantId: string;
  electoralDistrict: string;
  pollingDivision: string;
  pollingDistrictNumber: string;
  gramaNiladhariDivision?: string;
  villageStreetEstate?: string;
  houseNumber?: string;
}

const emptyChiefOccupant: ChiefOccupant = {
  memberId: '',
  fullName: '',
  nic: '',
  status: ''
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

  const [myChiefOccupantDetails, setMyChiefOccupantDetails] = useState<ChiefOccupantDetails | null>(null)
  const [myHouseholdMembers, setMyHouseholdMembers] = useState<MyHouseholdMember[]>([])
  const [myHouseholdDetails, setMyHouseholdDetails] = useState<MyHouseholdDetails | null>(null)
  
  // Separate editing states for each section
  const [editingChiefDetails, setEditingChiefDetails] = useState(false);
  const [editingHouseholdDetails, setEditingHouseholdDetails] = useState(false);
  const [editingHouseholdMembers, setEditingHouseholdMembers] = useState(false);
  
  // Edited data states
  const [editedChiefDetails, setEditedChiefDetails] = useState<ChiefOccupantDetails | null>(null);
  const [editedHouseholdDetails, setEditedHouseholdDetails] = useState<MyHouseholdDetails | null>(null);
  const [editedMembers, setEditedMembers] = useState<MyHouseholdMember[]>([]);
  const [memberEditingStates, setMemberEditingStates] = useState<Record<string, boolean>>({});
  const [memberEditingData, setMemberEditingData] = useState<Record<string, MyHouseholdMember>>({});

  const {
    uploadFile: uploadIdCopy,
    uploading: uploadingId,
    error: idUploadError,
    deleteFileByUrl,
    uploadFileToFolder
  } = useFileUpload({
    bucket: 'verification',
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  });

  const {
    uploadFile: uploadPhotoCopy,
    uploading: uploadingPhoto,
    error: photoUploadError
  } = useFileUpload({
    bucket: 'verification',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

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
          status: data.chiefOccupant.status
        } : null);

        setTotalMembers(data.totalMembers || 0);
        setUpdateRequests(data.updateRequests || []);
        setDeleteRequests(data.deleteRequests || []);

        const [myChiefRes, myMembersRes, myDetailsRes] = await Promise.all([
          axios.get(`http://localhost:8080/household-management/api/v1/my-chief-details/${chiefOccupantId}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }),
          axios.get(`http://localhost:8080/household-management/api/v1/my-household-members/${chiefOccupantId}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }),
          axios.get(`http://localhost:8080/household-management/api/v1/my-household-details/${chiefOccupantId}`, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          })
        ]);

        setMyChiefOccupantDetails(myChiefRes.data);
        setMyHouseholdMembers(myMembersRes.data);
        setMyHouseholdDetails(myDetailsRes.data);

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

  useEffect(() => {
    if (myChiefOccupantDetails) {
      setEditedChiefDetails({ ...myChiefOccupantDetails });
    }
    if (myHouseholdDetails) {
      setEditedHouseholdDetails({ ...myHouseholdDetails });
    }
    if (myHouseholdMembers) {
      setEditedMembers([...myHouseholdMembers]);
    }
  }, [myChiefOccupantDetails, myHouseholdDetails, myHouseholdMembers]);

  const refreshData = async () => {
    const chiefOccupantId = getUserId();

    try {
      const [dashboardRes, myChiefRes, myMembersRes, myDetailsRes] = await Promise.all([
        axios.get(
          `http://localhost:8080/household-management/api/v1/household/${chiefOccupantId}/members`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true 
          }
        ),
        axios.get(`http://localhost:8080/household-management/api/v1/my-chief-details/${chiefOccupantId}`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }),
        axios.get(`http://localhost:8080/household-management/api/v1/my-household-members/${chiefOccupantId}`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }),
        axios.get(`http://localhost:8080/household-management/api/v1/my-household-details/${chiefOccupantId}`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        })
      ]);

      const data = dashboardRes.data;
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
        status: data.chiefOccupant.status
      } : null);
      
      setTotalMembers(data.totalMembers || 0);
      setUpdateRequests(data.updateRequests || []);
      setDeleteRequests(data.deleteRequests || []);

      setMyChiefOccupantDetails(myChiefRes.data);
      setMyHouseholdMembers(myMembersRes.data);
      setMyHouseholdDetails(myDetailsRes.data);

    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  }
  const toggleMemberEditing = (memberId: string) => {
    setMemberEditingStates(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));

    // Initialize editing data when starting to edit
    if (!memberEditingStates[memberId]) {
      const memberToEdit = editedMembers.find(m => m.id === memberId);
      if (memberToEdit) {
        setMemberEditingData(prev => ({
          ...prev,
          [memberId]: { ...memberToEdit }
        }));
      }
    }
  };

  const handleEditingMemberChange = (memberId: string, field: keyof MyHouseholdMember, value: string | undefined) => {
    setMemberEditingData(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

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

  const renderUpdatedFields = (request: UpdateRequest) => {
    const fields = [];
    if (request.newFullName) fields.push(`Name: ${request.newFullName}`);
    if (request.newCivilStatus) fields.push(`Civil Status: ${request.newCivilStatus}`);
    
    return fields.length > 0 ? fields.join(", ") : "No changes specified";
  };

  const pendingAddRequests: PendingAddRequest[] = householdMembers
    .filter(member => member.status === "Pending" && member.isNewRequest)
    .map(member => ({
      id: member.memberId,
      nic: member.nic,
      requestStatus: "PENDING",
      memberName: member.fullName
    }));

  const approvedHouseholdMembers = householdMembers.filter(member => 
    member.status === "Approved" && !member.isNewRequest
  );

  const newMemberRequests = householdMembers.filter(m => m.isNewRequest);
  const existingApprovedMembers = householdMembers.filter(m => 
    m.status === "Approved" && !m.isNewRequest
  );

  const handleChiefDetailChange = (field: keyof ChiefOccupantDetails, value: string) => {
    if (editedChiefDetails) {
      setEditedChiefDetails({ ...editedChiefDetails, [field]: value });
    }
  };

  const handleHouseholdDetailChange = (field: keyof MyHouseholdDetails, value: string) => {
    if (editedHouseholdDetails) {
      setEditedHouseholdDetails({ ...editedHouseholdDetails, [field]: value });
    }
  };

  const handleMemberChange = (index: number, field: keyof MyHouseholdMember, value: string) => {
    const updatedMembers = [...editedMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setEditedMembers(updatedMembers);
  };

  const saveChiefDetails = async () => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:8080/household-management/api/v1/my-chief-details/${getUserId()}`,
        editedChiefDetails,
        {
          headers: { 
            "Content-Type": "application/json"
          },         
          withCredentials: true
        }
      );
      setEditingChiefDetails(false);
      await refreshData();
    } catch (error) {
      console.error("Failed to save chief details", error);
      setError("Failed to save chief details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveHouseholdDetails = async () => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:8080/household-management/api/v1/my-household-details/${getUserId()}`,
        editedHouseholdDetails,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      setEditingHouseholdDetails(false);
      await refreshData();
    } catch (error) {
      console.error("Failed to save household details", error);
      setError("Failed to save household details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveEditedMember = async (memberId: string) => {
    try {
        setLoading(true);
        
        // Option 1: Send only the edited member
        const memberToUpdate = memberEditingData[memberId];
        
        await axios.put(
            `http://localhost:8080/household-management/api/v1/my-household-members/${getUserId()}`,
            { members: [memberToUpdate] }, // Send only the edited member
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            }
        );

        setMemberEditingStates(prev => ({ ...prev, [memberId]: false }));
        await refreshData();
    } catch (error) {
        console.error("Failed to save member", error);
        setError("Failed to save member. Please try again.");
    } finally {
        setLoading(false);
    }
 };

  const handleFileUpload = async (file: File, type: 'id' | 'photo') => {
    if (!editedChiefDetails?.nic) {
      setError('NIC number is required before uploading files');
      return null;
    }

    try {
      const folderPath = type === 'id' ? 'NIC' : 'Photo';
      const fileUrl = await uploadFileToFolder(
        file,
        folderPath,
        editedChiefDetails.nic,
        type === 'id' ? editedChiefDetails.idCopyPath : editedChiefDetails.photoCopyPath,
        true
      );

      if (fileUrl && editedChiefDetails) {
        setEditedChiefDetails({
          ...editedChiefDetails,
          [`${type}CopyPath`]: fileUrl
        });
      }

      return fileUrl;
    } catch (error) {
      console.error(`Error uploading ${type} copy:`, error);
      setError(`Failed to upload ${type} copy`);
      return null;
    }
  };

  const handleRemoveFile = async (type: 'id' | 'photo') => {
    if (!editedChiefDetails) return;
    const currentUrl = type === 'id' ? editedChiefDetails.idCopyPath : editedChiefDetails.photoCopyPath;
    if (!currentUrl) return;

    try {
      await deleteFileByUrl(currentUrl);
      setEditedChiefDetails({
        ...editedChiefDetails,
        [`${type}CopyPath`]: undefined
      });
    } catch (error) {
      console.error(`Error removing ${type} file:`, error);
      setError(`Failed to remove ${type} verification document`);
    }
  };

  const handleMemberFileUpload = async (file: File, type: 'id' | 'photo', memberIndex: number) => {
    const member = editedMembers[memberIndex];
    if (!member?.nic && !editedChiefDetails?.nic) {
      setError('NIC number is required before uploading files');
      return null;
    }

    try {
      const folderPath = type === 'id' ? 'NIC' : 'Photo';
      const currentUrl = type === 'id' ? member.idCopyPath : member.photoCopyPath;
      
      const fileUrl = await uploadFileToFolder(
        file,
        folderPath,
        member.nic || editedChiefDetails?.nic || '',
        currentUrl||undefined,
        true
      );

      if (fileUrl) {
        const updatedMembers = [...editedMembers];
        updatedMembers[memberIndex] = {
          ...updatedMembers[memberIndex],
          [`${type}CopyPath`]: fileUrl
        };
        setEditedMembers(updatedMembers);
      }

      return fileUrl;
    } catch (error) {
      console.error(`Error uploading ${type} copy:`, error);
      setError(`Failed to upload ${type} copy for member`);
      return null;
    }
  };

  const handleRemoveMemberFile = async (type: 'id' | 'photo', memberIndex: number) => {
    if (memberIndex >= editedMembers.length) return;
    const member = editedMembers[memberIndex];
    const currentUrl = type === 'id' ? member.idCopyPath : member.photoCopyPath;
    if (!currentUrl) return;

    try {
      await deleteFileByUrl(currentUrl);
      const updatedMembers = [...editedMembers];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        [`${type}CopyPath`]: undefined
      };
      setEditedMembers(updatedMembers);
    } catch (error) {
      console.error(`Error removing ${type} file:`, error);
      setError(`Failed to remove ${type} verification document for member`);
    }
  };

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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* My Chief Occupant Details */}
            {editedChiefDetails && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <CardTitle>Chief Occupant Details</CardTitle>
                    </div>
                    {editingChiefDetails ? (
                      <div className="flex gap-2">
                        <Button onClick={saveChiefDetails} disabled={loading} size="sm">
                          <Save className="mr-2 h-4 w-4" /> Submit
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingChiefDetails(false)} 
                          disabled={loading}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setEditingChiefDetails(true)} size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {editingChiefDetails ? "Edit your details below" : "Your complete chief occupant information"}
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>NIC</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Civil Status</TableHead>
                        <TableHead>ID Copy</TableHead>
                        <TableHead>Photo Copy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {editedChiefDetails.photoCopyPath ? (
                            <img 
                              src={editedChiefDetails.photoCopyPath} 
                              alt="Profile" 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Input
                              value={editedChiefDetails.fullName}
                              onChange={(e) => handleChiefDetailChange('fullName', e.target.value)}
                            />
                          ) : (
                            editedChiefDetails.fullName
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Input
                              value={editedChiefDetails.nic}
                              onChange={(e) => handleChiefDetailChange('nic', e.target.value)}
                            />
                          ) : (
                            editedChiefDetails.nic
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Input
                              value={editedChiefDetails.phoneNumber || ''}
                              onChange={(e) => handleChiefDetailChange('phoneNumber', e.target.value)}
                            />
                          ) : (
                            editedChiefDetails.phoneNumber || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Input
                              value={editedChiefDetails.email}
                              onChange={(e) => handleChiefDetailChange('email', e.target.value)}
                            />
                          ) : (
                            editedChiefDetails.email
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Input
                              type="date"
                              value={editedChiefDetails.dob}
                              onChange={(e) => handleChiefDetailChange('dob', e.target.value)}
                            />
                          ) : (
                            editedChiefDetails.dob
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Select
                              value={editedChiefDetails.gender}
                              onValueChange={(value) => handleChiefDetailChange('gender', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            editedChiefDetails.gender
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <Select
                              value={editedChiefDetails.civilStatus}
                              onValueChange={(value) => handleChiefDetailChange('civilStatus', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            editedChiefDetails.civilStatus
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <div className="flex flex-col gap-2">
                              {editedChiefDetails.idCopyPath && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(editedChiefDetails.idCopyPath!, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveFile('id')}
                                    disabled={uploadingId}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                                  </Button>
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*,.pdf"
                                disabled={uploadingId}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) await handleFileUpload(file, 'id');
                                  e.target.value = '';
                                }}
                              />
                              {uploadingId && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                              {idUploadError && (
                                <p className="text-xs text-red-500">{idUploadError}</p>
                              )}
                            </div>
                          ) : editedChiefDetails.idCopyPath ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(editedChiefDetails.idCopyPath!, '_blank')}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          ) : (
                            <span>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingChiefDetails ? (
                            <div className="flex flex-col gap-2">
                              {editedChiefDetails.photoCopyPath && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(editedChiefDetails.photoCopyPath!, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveFile('photo')}
                                    disabled={uploadingPhoto}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                                  </Button>
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                disabled={uploadingPhoto}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) await handleFileUpload(file, 'photo');
                                  e.target.value = '';
                                }}
                              />
                              {uploadingPhoto && (
                                <p className="text-xs text-muted-foreground">Uploading...</p>
                              )}
                              {photoUploadError && (
                                <p className="text-xs text-red-500">{photoUploadError}</p>
                              )}
                            </div>
                          ) : editedChiefDetails.photoCopyPath ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(editedChiefDetails.photoCopyPath!, '_blank')}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                          ) : (
                            <span>—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* My Household Details */}
            {editedHouseholdDetails && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>Household Details</CardTitle>
                    </div>
                    {editingHouseholdDetails ? (
                      <div className="flex gap-2">
                        <Button onClick={saveHouseholdDetails} disabled={loading} size="sm">
                          <Save className="mr-2 h-4 w-4" /> Submit
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingHouseholdDetails(false)} 
                          disabled={loading}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setEditingHouseholdDetails(true)} size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {editingHouseholdDetails ? "Edit your household details below" : "Your household registration details"}
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Electoral District</TableHead>
                        <TableHead>Polling Division</TableHead>
                        <TableHead>Polling District</TableHead>
                        <TableHead>GN Division</TableHead>
                        <TableHead>Village/Street</TableHead>
                        <TableHead>House Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.electoralDistrict}
                              onChange={(e) => handleHouseholdDetailChange('electoralDistrict', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.electoralDistrict
                          )}
                        </TableCell>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.pollingDivision}
                              onChange={(e) => handleHouseholdDetailChange('pollingDivision', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.pollingDivision
                          )}
                        </TableCell>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.pollingDistrictNumber}
                              onChange={(e) => handleHouseholdDetailChange('pollingDistrictNumber', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.pollingDistrictNumber
                          )}
                        </TableCell>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.gramaNiladhariDivision || ''}
                              onChange={(e) => handleHouseholdDetailChange('gramaNiladhariDivision', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.gramaNiladhariDivision || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.villageStreetEstate || ''}
                              onChange={(e) => handleHouseholdDetailChange('villageStreetEstate', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.villageStreetEstate || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {editingHouseholdDetails ? (
                            <Input
                              value={editedHouseholdDetails.houseNumber || ''}
                              onChange={(e) => handleHouseholdDetailChange('houseNumber', e.target.value)}
                            />
                          ) : (
                            editedHouseholdDetails.houseNumber || "—"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            {/* My Household Members - Editable */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Household Members
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete details of your household members
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>NIC</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Civil Status</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>ID Copy</TableHead>
                        <TableHead>Photo Copy</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedMembers.length > 0 ? (
                        editedMembers.map((member, index) => {
                          const isEditing = memberEditingStates[member.id] || false;
                          const currentMember = memberEditingData[member.id] || {...member};

                          return (
                            <TableRow key={member.id}>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={currentMember.fullName}
                                    onChange={(e) => handleEditingMemberChange(member.id, 'fullName', e.target.value)}
                                  />
                                ) : (
                                  member.fullName
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={currentMember.nic || ''}
                                    onChange={(e) => handleEditingMemberChange(member.id, 'nic', e.target.value)}
                                  />
                                ) : (
                                  member.nic || "—"
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    type="date"
                                    value={currentMember.dob}
                                    onChange={(e) => handleEditingMemberChange(member.id, 'dob', e.target.value)}
                                  />
                                ) : (
                                  member.dob
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Select
                                    value={currentMember.gender}
                                    onValueChange={(value) => handleEditingMemberChange(member.id, 'gender', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  member.gender
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Select
                                    value={currentMember.civilStatus}
                                    onValueChange={(value) => handleEditingMemberChange(member.id, 'civilStatus', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Single">Single</SelectItem>
                                      <SelectItem value="Married">Married</SelectItem>
                                      <SelectItem value="Divorced">Divorced</SelectItem>
                                      <SelectItem value="Widowed">Widowed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  member.civilStatus
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={currentMember.relationshipWithChiefOccupant}
                                    onChange={(e) => handleEditingMemberChange(member.id, 'relationshipWithChiefOccupant', e.target.value)}
                                  />
                                ) : (
                                  member.relationshipWithChiefOccupant
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex flex-col gap-2">
                                    {currentMember.idCopyPath && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(currentMember.idCopyPath!, '_blank')}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View NIC
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={async () => {
                                            await handleRemoveMemberFile('id', index);
                                            handleEditingMemberChange(member.id, 'idCopyPath', undefined);
                                          }}
                                          disabled={uploadingId}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                    )}
                                    <Input
                                      type="file"
                                      accept="image/*,.pdf"
                                      disabled={uploadingId}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const fileUrl = await handleMemberFileUpload(file, 'id', index);
                                          if (fileUrl) {
                                            handleEditingMemberChange(member.id, 'idCopyPath', fileUrl);
                                          }
                                        }
                                        e.target.value = '';
                                      }}
                                    />
                                    {uploadingId && <p className="text-xs text-muted-foreground">Uploading NIC...</p>}
                                  </div>
                                ) : member.idCopyPath ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(member.idCopyPath!, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View NIC
                                  </Button>
                                ) : (
                                  <span>—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex flex-col gap-2">
                                    {currentMember.photoCopyPath && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(currentMember.photoCopyPath!, '_blank')}
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View Photo
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={async () => {
                                            await handleRemoveMemberFile('photo', index);
                                            handleEditingMemberChange(member.id, 'photoCopyPath', undefined);
                                          }}
                                          disabled={uploadingPhoto}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                    )}
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      disabled={uploadingPhoto}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const fileUrl = await handleMemberFileUpload(file, 'photo', index);
                                          if (fileUrl) {
                                            handleEditingMemberChange(member.id, 'photoCopyPath', fileUrl);
                                          }
                                        }
                                        e.target.value = '';
                                      }}
                                    />
                                    {uploadingPhoto && <p className="text-xs text-muted-foreground">Uploading Photo...</p>}
                                  </div>
                                ) : member.photoCopyPath ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(member.photoCopyPath!, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Photo
                                  </Button>
                                ) : (
                                  <span>—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <Button onClick={() => saveEditedMember(member.id)} disabled={loading} size="sm">
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        // Reset to original values when canceling
                                        setMemberEditingData(prev => ({
                                          ...prev,
                                          [member.id]: {...member}
                                        }));
                                        toggleMemberEditing(member.id);
                                      }} 
                                      disabled={loading}
                                      size="sm"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button onClick={() => toggleMemberEditing(member.id)} size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No household members found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
          </TabsContent>
          {/* Tab 2: Manage */}
          <TabsContent value="manage" className="space-y-6">
            {/* Guidelines Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Action Guidelines
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on any guideline below to understand when to use each action button.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add Member Guidelines */}
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-blue-900">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        When to use "Add Member"?
                      </div>
                      <span className="transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 text-sm text-blue-800">
                      <p className="mb-2 font-medium">Use this when a new person becomes part of your household and needs to be registered for voting:</p>
                      <ul className="space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>A child turns 18 and receives their National Identity Card (NIC)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>A new spouse joins the family (after marriage)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>A relative moves into your household permanently</span>
                        </li>
                      </ul>
                    </div>
                  </details>
                </div>

                {/* Update Member Guidelines */}
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-yellow-900">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        When to use "Update"?
                      </div>
                      <span className="transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 text-sm text-yellow-800">
                      <p className="mb-2 font-medium">Use this when existing member information needs to be corrected or updated:</p>
                      <ul className="space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>NIC correction (errors in original entry)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Civil status change (single to married, etc.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Name changes due to marriage or legal reasons</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Relationship status updates</span>
                        </li>
                      </ul>
                    </div>
                  </details>
                </div>

                {/* Delete Member Guidelines */}
                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-red-900">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        When to use "Delete"?
                      </div>
                      <span className="transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 text-sm text-red-800">
                      <p className="mb-2 font-medium">Use this when a member is no longer part of the household and should be removed:</p>
                      <ul className="space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Death of a family member</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Permanent relocation (abroad, new household)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Divorce/separation (spouse moves out)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Child moves out permanently (marriage, job relocation)</span>
                        </li>
                      </ul>
                      <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-400">
                        <p className="text-red-800 text-xs font-medium">
                          ⚠️ Important: Deletion requests require proper documentation and approval from authorities.
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>

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

            {/* Household Members & Add Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Cheif-Occupant detaials & Add Requests
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
                    {/* Chief Occupant */}
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

                    {/* Existing Approved Members */}
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

                    {/* New Member Requests */}
                    {newMemberRequests.length > 0 && 
                      newMemberRequests
                        .sort((a, b) => {
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

            {/* Update Requests */}
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

            {/* Delete Requests */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}