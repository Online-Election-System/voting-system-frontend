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
import { ChiefOccupant } from "../types";
import { CIVIL_STATUS_OPTIONS, GENDER_OPTIONS } from "../constants";
import { validatePassword } from "../utils/password-validation-util";
import { useFileUpload } from "../hooks/use-file-upload-hook";
import { useRef, useState, useEffect } from "react";

interface ChiefOccupantFormProps {
  chiefOccupant: ChiefOccupant;
  onChange: (field: keyof ChiefOccupant, value: any) => void;
  password: string;
  confirmPassword: string;
  passwordError: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRegisterCleanup?: (cleanupFn: () => Promise<void>) => void;
}

export function ChiefOccupantForm({
  chiefOccupant,
  onChange,
  password,
  confirmPassword,
  passwordError,
  onPasswordChange,
  onConfirmPasswordChange,
  onRegisterCleanup,
}: ChiefOccupantFormProps) {
  // Refs for file inputs
  const nicFileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  
  // Drag state
  const [dragOverNic, setDragOverNic] = useState(false);
  const [dragOverProfile, setDragOverProfile] = useState(false);

  const [nicType, setNicType] = useState<'old' | 'new'>('new');
  const [nicError, setNicError] = useState('');
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
    bucket: 'verification',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
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
    bucket: 'verification',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
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

  // NIC Validation
  const validateNic = (value: string, type: 'old' | 'new') => {
    // Basic length validation
    if (type === 'old' && value.length !== 10) {
      return 'Old NIC must be 10 characters long';
    }
    if (type === 'new' && value.length !== 12) {
      return 'New NIC must be 12 digits long';
    }

    // Format validation
    if (type === 'old' && !/^\d{9}[VvXx]$/.test(value)) {
      return 'Old NIC must be 9 digits followed by V, X, v, or x';
    }
    if (type === 'new' && !/^\d{12}$/.test(value)) {
      return 'New NIC must be 12 digits';
    }

    // DOB validation if DOB is provided
    if (chiefOccupant.dob) {
      const birthYear = new Date(chiefOccupant.dob).getFullYear();
      
      if (type === 'new') {
        const nicYear = parseInt(value.substring(0, 4));
        if (nicYear !== birthYear) {
          return `NIC year (${nicYear}) doesn't match birth year (${birthYear})`;
        }
      } else if (type === 'old') {
        const nicYearPart = parseInt(value.substring(0, 2));
        // For old NIC, the year is 1900 + first two digits
        const nicYear = 1900 + nicYearPart;
        // Handle cases where birth year might be 2000s
        const possibleYears = [nicYear, nicYear + 100];
        if (!possibleYears.includes(birthYear)) {
          return `NIC year (${nicYear} or ${nicYear + 100}) doesn't match birth year (${birthYear})`;
        }
      }
    }

    return '';
  };

  const handleNicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase(); // Convert to uppercase for old NIC
    const errorMsg = validateNic(value, nicType);
    setNicError(errorMsg);
    if (!errorMsg) {
      onChange("nic", value);
    }
  };

  const handleNicTypeChange = (value: 'old' | 'new') => {
    setNicType(value);
    setNicError('');
    onChange("nic", ''); // Clear NIC when changing type
  };

  const handleNicFileSelect = async (file: File) => {
    if (!chiefOccupant.nic || chiefOccupant.nic.trim() === '') {
      alert('Please enter NIC number before uploading the document');
      return;
    }

    const currentFileUrl = typeof chiefOccupant.idCopyPath === 'string' ? chiefOccupant.idCopyPath : undefined;
    const uploadedFileUrl = await uploadNicFile(file, chiefOccupant.nic, currentFileUrl, !!currentFileUrl);
    
    if (uploadedFileUrl) {
      onChange("idCopyPath", uploadedFileUrl);
    }
  };

  const handleProfilePhotoSelect = async (file: File) => {
    if (!chiefOccupant.nic || chiefOccupant.nic.trim() === '') {
      alert('Please enter NIC number before uploading the profile photo');
      return;
    }

    const currentFileUrl = typeof chiefOccupant.photoCopyPath === 'string' ? chiefOccupant.photoCopyPath : undefined;
    const uploadedFileUrl = await uploadProfilePhoto(file, chiefOccupant.nic, currentFileUrl, !!currentFileUrl);
    
    if (uploadedFileUrl) {
      onChange("photoCopyPath", uploadedFileUrl);
    }
  };

  const handleNicFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleNicFileSelect(file);
    }
  };

  const handleProfilePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfilePhotoSelect(file);
    }
  };

  // NIC Document drag handlers
  const handleNicDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNic(true);
  };

  const handleNicDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNic(false);
  };

  const handleNicDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverNic(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleNicFileSelect(file);
    }
  };

  // Profile Photo drag handlers
  const handleProfileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfile(true);
  };

  const handleProfileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfile(false);
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverProfile(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleProfilePhotoSelect(file);
    }
  };

  // File removal functions
  const removeNicFile = async () => {
    if (chiefOccupant.idCopyPath && typeof chiefOccupant.idCopyPath === 'string') {
      await cleanupSpecificNicFile(chiefOccupant.idCopyPath);
    }

    onChange("idCopyPath", null);
    resetNicUploadState();
    if (nicFileInputRef.current) {
      nicFileInputRef.current.value = "";
    }
  };

  const removeProfilePhoto = async () => {
    if (chiefOccupant.photoCopyPath && typeof chiefOccupant.photoCopyPath === 'string') {
      await cleanupSpecificProfileFile(chiefOccupant.photoCopyPath);
    }
    
    onChange("photoCopyPath", null);
    resetProfileUploadState();
    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
    }
  };

  // Check uploaded file states
  const hasUploadedNicFile = chiefOccupant.idCopyPath && typeof chiefOccupant.idCopyPath === 'string';
  const isNicPdf = hasUploadedNicFile && (chiefOccupant.idCopyPath as string).toLowerCase().includes('.pdf');
  const hasUploadedProfilePhoto = chiefOccupant.photoCopyPath && typeof chiefOccupant.photoCopyPath === 'string';

  // Render uploaded NIC file
  const renderUploadedNicFile = () => {
    if (!hasUploadedNicFile) return null;

    const fileUrl = chiefOccupant.idCopyPath as string;

    if (isNicPdf) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">
              NIC document uploaded successfully
            </span>
          </div>
          <div className="relative inline-block p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-medium text-sm">PDF Document</p>
                <p className="text-xs text-gray-500">NIC Document</p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeNicFile();
              }}
            >
              <X className="h-4 w-4" />
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
                nicFileInputRef.current?.click();
              }}
            >
              Replace Document
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">NIC image uploaded successfully</span>
          </div>
          <div className="relative inline-block">
            <img
              src={fileUrl}
              alt="NIC Document"
              className="max-h-48 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation();
                removeNicFile();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              nicFileInputRef.current?.click();
            }}
          >
            Replace Image
          </Button>
        </div>
      );
    }
  };

  // Render uploaded profile photo
  const renderUploadedProfilePhoto = () => {
    if (!hasUploadedProfilePhoto) return null;

    const fileUrl = chiefOccupant.photoCopyPath as string;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <Check className="h-5 w-5" />
          <span className="font-medium">Profile photo uploaded successfully</span>
        </div>
        <div className="relative inline-block">
          <img
            src={fileUrl}
            alt="Profile Photo"
            className="h-48 w-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={(e) => {
              e.stopPropagation();
              removeProfilePhoto();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            profilePhotoInputRef.current?.click();
          }}
        >
          Replace Photo
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Chief Occupant Registration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chiefFullName">Full Name</Label>
          <Input
            id="chiefFullName"
            value={chiefOccupant.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="chiefNic">NIC Number</Label>
            <Select value={nicType} onValueChange={handleNicTypeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="NIC Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New NIC</SelectItem>
                <SelectItem value="old">Old NIC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            id="chiefNic"
            value={chiefOccupant.nic}
            onChange={handleNicChange}
            placeholder={nicType === 'new' ? 'Enter 12 digit NIC' : 'Enter 10 character NIC'}
            maxLength={nicType === 'new' ? 12 : 10}
            required
          />
          {nicError && <p className="text-sm text-red-500">{nicError}</p>}
          <p className="text-sm text-muted-foreground">
            {nicType === 'new' 
              ? 'New NIC: 12 digits (e.g., 200270503426)' 
              : 'Old NIC: 9 digits + V/X (e.g., 855420159V)'}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chiefTelephone">Telephone Number</Label>
          <Input
            id="chiefTelephone"
            value={chiefOccupant.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            placeholder="Enter telephone number"
            required
          />
        </div>
      <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !chiefOccupant.dob && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {chiefOccupant.dob ? format(chiefOccupant.dob, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={chiefOccupant.dob}
                onSelect={(date) => onChange("dob", date)}
                initialFocus
                disabled={{ 
                  after: new Date(), 
                  before: new Date(new Date().setFullYear(new Date().getFullYear() - 120)) 
                }}
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>  
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={chiefOccupant.gender}
            onValueChange={(value: any) => onChange("gender", value)}
          >
            {GENDER_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`chief-${option.value}`}
                />
                <Label htmlFor={`chief-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Civil Status</Label>
          <Select
            value={chiefOccupant.civilStatus}
            onValueChange={(value: any) => onChange("civilStatus", value)}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="chiefEmail">Email Address</Label>
        <Input
          id="chiefEmail"
          type="email"
          value={chiefOccupant.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>

      {/* Profile Photo Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile Photo</h3>
        <div className="space-y-2">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragOverProfile && "border-blue-500 bg-blue-50",
              hasUploadedProfilePhoto && "border-green-500 bg-green-50",
              profileUploadError && "border-red-500 bg-red-50",
              !dragOverProfile && !hasUploadedProfilePhoto && !profileUploadError && "border-gray-300 hover:border-gray-400",
              !chiefOccupant.nic && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleProfileDragOver}
            onDragLeave={handleProfileDragLeave}
            onDrop={handleProfileDrop}
            onClick={() => {
              if (!uploadingProfile && chiefOccupant.nic && chiefOccupant.nic.trim() !== '') {
                profilePhotoInputRef.current?.click();
              }
            }}
          >
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoInputChange}
              className="hidden"
              disabled={uploadingProfile || !chiefOccupant.nic}
            />

            {uploadingProfile ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                <p className="text-sm text-gray-600">Uploading... {profileProgress}%</p>
              </div>
            ) : hasUploadedProfilePhoto ? (
              renderUploadedProfilePhoto()
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Images (PNG, JPG, WEBP) up to 5MB
                  </p>
                  {!chiefOccupant.nic && (
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
            Please upload a clear passport-size(45.0 x 35.0 mm) photo of yourself. The photo should be recent and clearly show your face.
          </p>
        </div>
      </div>

      {/* NIC Document Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">NIC Document</h3>
        <div className="space-y-2">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragOverNic && "border-blue-500 bg-blue-50",
              hasUploadedNicFile && "border-green-500 bg-green-50",
              nicUploadError && "border-red-500 bg-red-50",
              !dragOverNic && !hasUploadedNicFile && !nicUploadError && "border-gray-300 hover:border-gray-400",
              !chiefOccupant.nic && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleNicDragOver}
            onDragLeave={handleNicDragLeave}
            onDrop={handleNicDrop}
            onClick={() => {
              if (!uploadingNic && chiefOccupant.nic && chiefOccupant.nic.trim() !== '') {
                nicFileInputRef.current?.click();

              }
            }}
          >
            <input
              ref={nicFileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleNicFileInputChange}
              className="hidden"
              disabled={uploadingNic || !chiefOccupant.nic}
            />

            {uploadingNic ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                <p className="text-sm text-gray-600">Uploading... {nicProgress}%</p>

              </div>
            ) : hasUploadedNicFile ? (
              renderUploadedNicFile()
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Images (PNG, JPG, WEBP) or PDF up to 5MB
                  </p>
                  {!chiefOccupant.nic && (
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

      {/* Password Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Password Information</h3>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              onPasswordChange(e.target.value);
              validatePassword(e.target.value);
            }}
            placeholder="Enter password"
            required
          />
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Password must contain:
            <ul className="list-disc pl-5">
              <li className={password.length >= 8 ? "text-green-500" : ""}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                One lowercase letter
              </li>
              <li className={/\d/.test(password) ? "text-green-500" : ""}>
                One number
              </li>
              <li
                className={/[@$!%*?&]/.test(password) ? "text-green-500" : ""}
              >
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Confirm password"
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}
        </div>
      </div>
    </div>
  );
}