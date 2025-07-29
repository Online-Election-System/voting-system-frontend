import { CalendarIcon, Upload, X, Check, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberInfo } from "../types";
import { CIVIL_STATUS_OPTIONS, GENDER_OPTIONS } from "../constants";
import { useFileUpload } from "../hooks/use-file-upload-hook";
import { useRef, useState, useEffect } from "react";

interface HouseholdMembersFormProps {
  householdMembers: MemberInfo[];
  currentMemberIndex: number;
  householdMemberCount: number;
  onChange: (index: number, field: keyof MemberInfo, value: any) => void;
  onMemberIndexChange: (index: number) => void;
  onRegisterCleanup?: (cleanupFn: () => Promise<void>) => void;
}

export function HouseholdMembersForm({
  householdMembers,
  currentMemberIndex,
  householdMemberCount,
  onChange,
  onMemberIndexChange,
  onRegisterCleanup,
}: HouseholdMembersFormProps) {
  // Refs for file inputs
  const nicFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const profilePhotoInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  
  // Drag states
  const [dragOverNicStates, setDragOverNicStates] = useState<{ [key: number]: boolean }>({});
  const [dragOverProfileStates, setDragOverProfileStates] = useState<{ [key: number]: boolean }>({});

  // NIC Document Upload Hook
  const {
    uploadFile: uploadNicFile,
    uploading: uploadingNic,
    progress: nicProgress,
    error: nicUploadError,
    resetUploadState: resetNicUploadState,
    cleanupCurrentFiles: cleanupNicFiles,
    cleanupSpecificFile: cleanupSpecificNicFile,
  } = useFileUpload({
    bucket: "verification",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
    cleanupOnUnmount: false,
  });

  // Profile Photo Upload Hook
  const {
    uploadFile: uploadProfilePhoto,
    uploading: uploadingProfile,
    progress: profileProgress,
    error: profileUploadError,
    resetUploadState: resetProfileUploadState,
    cleanupCurrentFiles: cleanupProfileFiles,
    cleanupSpecificFile: cleanupSpecificProfileFile,
  } = useFileUpload({
    bucket: "verification",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    cleanupOnUnmount: false,
  });

  // Register cleanup functions with parent
  useEffect(() => {
    if (onRegisterCleanup) {
      onRegisterCleanup(async () => {
        await Promise.all([cleanupNicFiles(), cleanupProfileFiles()]);
      });
    }
  }, [onRegisterCleanup, cleanupNicFiles, cleanupProfileFiles]);

  const handleNicFileSelect = async (index: number, file: File) => {
    const member = householdMembers[index];
    
    if (!member?.nic || member.nic.trim() === '') {
      alert('Please enter NIC number for this member before uploading the document');
      return;
    }

    const currentFileUrl = typeof member?.idCopyPath === "string" ? member.idCopyPath : undefined;
    const uploadedFileUrl = await uploadNicFile(file, member.nic, currentFileUrl, !!currentFileUrl);

    if (uploadedFileUrl) {
      onChange(index, "idCopyPath", uploadedFileUrl);
    }
  };

  const handleProfilePhotoSelect = async (index: number, file: File) => {
    const member = householdMembers[index];
    
    if (!member?.nic || member.nic.trim() === '') {
      alert('Please enter NIC number for this member before uploading the profile photo');
      return;
    }

    const currentFileUrl = typeof member?.photoCopyPath === "string" ? member.photoCopyPath : undefined;
    const uploadedFileUrl = await uploadProfilePhoto(file, member.nic, currentFileUrl, !!currentFileUrl);

    if (uploadedFileUrl) {
      onChange(index, "photoCopyPath", uploadedFileUrl);
    }
  };

  const handleNicFileInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleNicFileSelect(index, file);
    }
  };

  const handleProfilePhotoInputChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfilePhotoSelect(index, file);
    }
  };

  // NIC Document drag handlers
  const handleNicDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNicStates((prev) => ({ ...prev, [index]: true }));
  };

  const handleNicDragLeave = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNicStates((prev) => ({ ...prev, [index]: false }));
  };

  const handleNicDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNicStates((prev) => ({ ...prev, [index]: false }));

    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      handleNicFileSelect(index, file);
    }
  };

  // Profile Photo drag handlers
  const handleProfileDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfileStates((prev) => ({ ...prev, [index]: true }));
  };

  const handleProfileDragLeave = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfileStates((prev) => ({ ...prev, [index]: false }));
  };

  const handleProfileDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfileStates((prev) => ({ ...prev, [index]: false }));

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleProfilePhotoSelect(index, file);

    }
  };

  // File removal functions
  const removeNicFile = async (index: number) => {
    const member = householdMembers[index];
    
    if (member?.idCopyPath && typeof member.idCopyPath === 'string') {
      await cleanupSpecificNicFile(member.idCopyPath);
    }

    onChange(index, "idCopyPath", null);
    resetNicUploadState();
    if (nicFileInputRefs.current[index]) {
      nicFileInputRefs.current[index]!.value = "";
    }
  };

  const removeProfilePhoto = async (index: number) => {
    const member = householdMembers[index];
    
    if (member?.photoCopyPath && typeof member.photoCopyPath === 'string') {
      await cleanupSpecificProfileFile(member.photoCopyPath);
    }
    
    onChange(index, "photoCopyPath", null);
    resetProfileUploadState();
    if (profilePhotoInputRefs.current[index]) {
      profilePhotoInputRefs.current[index]!.value = "";
    }
  };

  // Render uploaded NIC file
  const renderUploadedNicFile = (index: number) => {
    const member = householdMembers[index];
    const hasUploadedFile =
      member?.idCopyPath && typeof member.idCopyPath === "string";

    if (!hasUploadedFile) return null;

    const fileUrl = member.idCopyPath as string;
    const isPdf = fileUrl.toLowerCase().includes(".pdf");

    if (isPdf) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">NIC document uploaded</span>
          </div>
          <div className="relative inline-block p-3 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-xs">PDF Document</p>
                <p className="text-xs text-gray-500">NIC Document</p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeNicFile(index);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(fileUrl, "_blank")}
            >
              View PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                nicFileInputRefs.current[index]?.click();
              }}
            >
              Replace
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">NIC image uploaded</span>
          </div>
          <div className="relative inline-block">
            <img
              src={fileUrl}
              alt="Member NIC Document"
              className="max-h-32 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeNicFile(index);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              nicFileInputRefs.current[index]?.click();
            }}
          >
            Replace
          </Button>
        </div>
      );
    }
  };

  // Render uploaded profile photo
  const renderUploadedProfilePhoto = (index: number) => {
    const member = householdMembers[index];
    const hasUploadedFile = member?.photoCopyPath && typeof member.photoCopyPath === "string";
    
    if (!hasUploadedFile) return null;

    const fileUrl = member.photoCopyPath as string;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Profile photo uploaded</span>
        </div>
        <div className="relative inline-block">
          <img
            src={fileUrl}
            alt="Profile Photo"
            className="h-32 w-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
            onClick={(e) => {
              e.stopPropagation();
              removeProfilePhoto(index);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            profilePhotoInputRefs.current[index]?.click();
          }}
        >
          Replace
        </Button>
      </div>
    );
  };

  const renderMemberForm = (index: number) => {
    const member = householdMembers[index];
    const hasUploadedNicFile = member?.idCopyPath && typeof member.idCopyPath === "string";
    const hasUploadedProfilePhoto = member?.photoCopyPath && typeof member.photoCopyPath === "string";
    const nicDragOver = dragOverNicStates[index] || false;
    const profileDragOver = dragOverProfileStates[index] || false;
    const memberHasNic = member?.nic && member.nic.trim() !== '';

    return (
      <div key={index} className="space-y-6 border p-4 rounded-md">
        <h3 className="text-lg font-semibold">Household Member {index + 1}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`fullName-${index}`}>Full Name</Label>
            <Input
              id={`fullName-${index}`}
              value={householdMembers[index]?.fullName || ""}
              onChange={(e) => onChange(index, "fullName", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`nic-${index}`}>NIC Number</Label>
            <Input
              id={`nic-${index}`}
              value={householdMembers[index]?.nic || ""}
              onChange={(e) => onChange(index, "nic", e.target.value)}
              placeholder="Enter NIC number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !householdMembers[index]?.dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {householdMembers[index]?.dob ? (
                    format(householdMembers[index].dob, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={householdMembers[index]?.dob}
                  onSelect={(date) => onChange(index, "dob", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={householdMembers[index]?.gender || "male"}
              onValueChange={(value: any) => onChange(index, "gender", value)}
            >
              {GENDER_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${option.value}-${index}`}
                  />
                  <Label htmlFor={`${option.value}-${index}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Civil Status</Label>
            <Select
              value={householdMembers[index]?.civilStatus || "single"}
              onValueChange={(value: any) => onChange(index, "civilStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select civil status" />
              </SelectTrigger>
              <SelectContent>
                {CIVIL_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`relationship-${index}`}>
              Relationship with Chief Occupant
            </Label>
            <Input
              id={`relationship-${index}`}
              value={householdMembers[index]?.relationshipWithChiefOccupant || ""}
              onChange={(e) =>
                onChange(index, "relationshipWithChiefOccupant", e.target.value)
              }
              placeholder="E.g., Spouse, Child, Parent"
              required
            />
          </div>
        </div>

        {/* Profile Photo Upload Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Profile Photo</h4>
          <div className="space-y-2">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                profileDragOver && "border-blue-500 bg-blue-50",
                hasUploadedProfilePhoto && "border-green-500 bg-green-50",
                profileUploadError && "border-red-500 bg-red-50",
                !profileDragOver &&
                  !hasUploadedProfilePhoto &&
                  !profileUploadError &&
                  "border-gray-300 hover:border-gray-400",
                !memberHasNic && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={handleProfileDragOver(index)}
              onDragLeave={handleProfileDragLeave(index)}
              onDrop={handleProfileDrop(index)}
              onClick={() => {
                if (!uploadingProfile && memberHasNic) {
                  profilePhotoInputRefs.current[index]?.click();
                }
              }}
            >
              <input
                ref={(el) => {
                  profilePhotoInputRefs.current[index] = el;
                }}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoInputChange(index)}
                className="hidden"
                disabled={uploadingProfile || !memberHasNic}
              />

              {uploadingProfile ? (
                <div className="space-y-2">
                  <div className="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">
                    Uploading... {profileProgress}%
                  </p>
                </div>
              ) : hasUploadedProfilePhoto ? (
                renderUploadedProfilePhoto(index)
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images (PNG, JPG, WEBP) up to 5MB
                    </p>
                    {!memberHasNic && (
                      <p className="text-xs text-amber-600 mt-1">
                        Enter NIC number first to enable file upload
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {profileUploadError && (
              <p className="text-sm text-red-500 mt-2">{profileUploadError}</p>
            )}

            <p className="text-xs text-gray-500">
              Please upload a clear passport-style photo of yourself. The photo should be recent and clearly show your face.
            </p>
          </div>
        </div>

        {/* NIC Document Upload Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">NIC Document</h4>
          <div className="space-y-2">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                nicDragOver && "border-blue-500 bg-blue-50",
                hasUploadedNicFile && "border-green-500 bg-green-50",
                nicUploadError && "border-red-500 bg-red-50",
                !nicDragOver &&
                  !hasUploadedNicFile &&
                  !nicUploadError &&
                  "border-gray-300 hover:border-gray-400",
                !memberHasNic && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={handleNicDragOver(index)}
              onDragLeave={handleNicDragLeave(index)}
              onDrop={handleNicDrop(index)}
              onClick={() => {
                if (!uploadingNic && memberHasNic) {
                  nicFileInputRefs.current[index]?.click();
                }
              }}
            >
              <input
                ref={(el) => {
                  nicFileInputRefs.current[index] = el;
                }}
                type="file"
                accept="image/*,.pdf"
                onChange={handleNicFileInputChange(index)}
                className="hidden"
                disabled={uploadingNic || !memberHasNic}
              />

              {uploadingNic ? (
                <div className="space-y-2">
                  <div className="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">
                    Uploading... {nicProgress}%
                  </p>
                </div>
              ) : hasUploadedNicFile ? (
                renderUploadedNicFile(index)
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images (PNG, JPG, WEBP) or PDF up to 5MB
                    </p>
                    {!memberHasNic && (
                      <p className="text-xs text-amber-600 mt-1">
                        Enter NIC number first to enable file upload
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {nicUploadError && (
              <p className="text-sm text-red-500 mt-2">{nicUploadError}</p>
            )}

            <p className="text-xs text-gray-500">
              Please upload a clear image or PDF of your National Identity Card
              (NIC). For images, both front and back sides should be visible and
              readable.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Chief Occupant Approval</Label>
          <RadioGroup
            value={
              householdMembers[index]?.approvedByChief
                ? "approved"
                : "not-approved"
            }
            onValueChange={(value: string) =>
              onChange(index, "approvedByChief", value === "approved")
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id={`approval-${index}`} />
              <Label htmlFor={`approval-${index}`}>
                I approve this member's registration
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="not-approved"
                id={`not-approval-${index}`}
              />
              <Label htmlFor={`not-approval-${index}`}>
                I do not approve this member's registration
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Household Members Registration</h3>

      {householdMemberCount > 0 ? (
        <Tabs
          defaultValue="0"
          value={currentMemberIndex.toString()}
          onValueChange={(value: string) => onMemberIndexChange(Number.parseInt(value))}
        >
          <TabsList
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                householdMemberCount,
                5
              )}, 1fr)`,
            }}
          >
            {Array.from({ length: householdMemberCount }).map((_, i) => (
              <TabsTrigger key={i} value={i.toString()}>
                Member {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {Array.from({ length: householdMemberCount }).map((_, i) => (
            <TabsContent key={i} value={i.toString()}>
              {renderMemberForm(i)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p>No additional household members to register.</p>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        Please ensure all information is accurate. NIC documents (images or PDFs) and profile photos are required for all members.
      </div>
    </div>
  );
}