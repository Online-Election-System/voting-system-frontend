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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    uploadFile,
    uploading,
    progress,
    error: uploadError,
    resetUploadState,
    cleanupCurrentFiles,
    cleanupSpecificFile,
  } = useFileUpload({
    bucket: "nic-documents",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    cleanupOnUnmount: false, // Don't auto-cleanup on unmount
  });

  // Register cleanup function with parent
  useEffect(() => {
    if (onRegisterCleanup) {
      onRegisterCleanup(cleanupCurrentFiles);
    }
  }, [onRegisterCleanup, cleanupCurrentFiles]);

  const handleFileSelect = async (file: File) => {
    // Check if NIC number is available
    if (!chiefOccupant.nic || chiefOccupant.nic.trim() === "") {
      // You might want to show an error or prompt user to enter NIC first
      alert("Please enter NIC number before uploading the file");
      return;
    }

    const currentFileUrl =
      typeof chiefOccupant.idCopyPath === "string"
        ? chiefOccupant.idCopyPath
        : undefined;
    // Pass true for shouldDeletePrevious when replacing a file
    const uploadedFileUrl = await uploadFile(
      file,
      chiefOccupant.nic,
      currentFileUrl,
      !!currentFileUrl
    );

    if (uploadedFileUrl) {
      // Store the URL in idCopyPath for backend processing
      onChange("idCopyPath", uploadedFileUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      handleFileSelect(file);
    }
  };

  const removeImage = async () => {
    // Explicitly cleanup the current file when user clicks remove
    if (
      chiefOccupant.idCopyPath &&
      typeof chiefOccupant.idCopyPath === "string"
    ) {
      await cleanupSpecificFile(chiefOccupant.idCopyPath);
    }

    onChange("idCopyPath", null);
    resetUploadState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Check if idCopyPath is a URL string (uploaded) or null
  const hasUploadedFile =
    chiefOccupant.idCopyPath && typeof chiefOccupant.idCopyPath === "string";

  // Determine if the uploaded file is a PDF
  const isPdf =
    hasUploadedFile &&
    (chiefOccupant.idCopyPath as string).toLowerCase().includes(".pdf");

  const renderUploadedFile = () => {
    if (!hasUploadedFile) return null;

    const fileUrl = chiefOccupant.idCopyPath as string;

    if (isPdf) {
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
                removeImage();
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
                fileInputRef.current?.click();
              }}
            >
              Replace Document
            </Button>
          </div>
        </div>
      );
    } else {
      // Image file
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
                removeImage();
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
              fileInputRef.current?.click();
            }}
          >
            Replace Image
          </Button>
        </div>
      );
    }
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
          <Label htmlFor="chiefNic">NIC Number</Label>
          <Input
            id="chiefNic"
            value={chiefOccupant.nic}
            onChange={(e) => onChange("nic", e.target.value)}
            placeholder="Enter NIC number"
            required
          />
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
          <Label>Date of Birth</Label>
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
                {chiefOccupant.dob ? (
                  format(chiefOccupant.dob, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={chiefOccupant.dob}
                onSelect={(date) => onChange("dob", date)}
                initialFocus
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
            onValueChange={(value) => onChange("gender", value)}
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
            onValueChange={(value) => onChange("civilStatus", value)}
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

      {/* NIC Document Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">NIC Document</h3>
        <div className="space-y-2">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              dragOver && "border-blue-500 bg-blue-50",
              hasUploadedFile && "border-green-500 bg-green-50",
              uploadError && "border-red-500 bg-red-50",
              !dragOver &&
                !hasUploadedFile &&
                !uploadError &&
                "border-gray-300 hover:border-gray-400",
              !chiefOccupant.nic && "opacity-50 cursor-not-allowed"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (
                !uploading &&
                chiefOccupant.nic &&
                chiefOccupant.nic.trim() !== ""
              ) {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={uploading || !chiefOccupant.nic}
            />

            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                <p className="text-sm text-gray-600">
                  Uploading... {progress}%
                </p>
              </div>
            ) : hasUploadedFile ? (
              renderUploadedFile()
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

          {uploadError && (
            <p className="text-sm text-red-500 mt-2">{uploadError}</p>
          )}

          <p className="text-xs text-gray-500">
            Please upload a clear image or PDF of your National Identity Card
            (NIC). For images, both front and back sides should be visible and
            readable.
          </p>
        </div>
      </div>

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
