// components/CandidateDialog.tsx
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateDialogProps, COMMON_PARTY_COLORS } from "../candidate.types";
import { useCandidateForm } from "../hooks/use-candidate-form";
import { User, Palette, Mail, Phone, FileText, Hash } from "lucide-react";

export const CandidateDialog = ({ 
  open, 
  onOpenChange, 
  candidate, 
  onSubmit, 
  onCancel,
  isLoading = false
}: CandidateDialogProps) => {
  const {
    candidateName,
    setCandidateName,
    partyName,
    setPartyName,
    partyColor,
    setPartyColor,
    partySymbol,
    setPartySymbol,
    candidateImage,
    setCandidateImage,
    email,
    setEmail,
    phone,
    setPhone,
    description,
    setDescription,
    errors,
    validateForm,
    isFormValid,
    resetForm,
    setFormData,
    getFormData
  } = useCandidateForm(candidate);

  const isEditing = Boolean(candidate);

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    } else {
      resetForm();
    }
  }, [candidate, setFormData, resetForm]);

  const handleSubmit = async () => {
    if (validateForm() && isFormValid()) {
      const formData = getFormData();
      await onSubmit(formData);
      resetForm();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update candidate information. Status is managed automatically based on election enrollment." 
              : "Add a new candidate to the system. They will be inactive until enrolled in an election."}
          </DialogDescription>
          {isEditing && candidate && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={candidate.isActive ? "default" : "secondary"}>
                {candidate.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Status is automatically managed
              </span>
            </div>
          )}
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h4>
            
            <div className="grid gap-2">
              <Label htmlFor="candidateName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Candidate Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate's full name"
                disabled={isLoading}
              />
              {errors.candidateName && (
                <span className="text-sm text-red-500">{errors.candidateName}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partyName" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Political Party <span className="text-red-500">*</span>
              </Label>
              <Input
                id="partyName"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Enter political party name"
                disabled={isLoading}
              />
              {errors.partyName && (
                <span className="text-sm text-red-500">{errors.partyName}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partyColor" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Party Color <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="partyColor"
                  value={partyColor}
                  onChange={(e) => setPartyColor(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1"
                  disabled={isLoading}
                />
                <div 
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: partyColor }}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {COMMON_PARTY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => setPartyColor(color)}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.partyColor && (
                <span className="text-sm text-red-500">{errors.partyColor}</span>
              )}
            </div>
          </div>

          {/* Optional Information Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Optional Information
            </h4>

            <div className="grid gap-2">
              <Label htmlFor="partySymbol">Party Symbol URL</Label>
              <Input
                id="partySymbol"
                value={partySymbol}
                onChange={(e) => setPartySymbol(e.target.value)}
                placeholder="https://example.com/symbol.png"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="candidateImage">Candidate Image URL</Label>
              <Input
                id="candidateImage"
                value={candidateImage}
                onChange={(e) => setCandidateImage(e.target.value)}
                placeholder="https://example.com/candidate.jpg"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Saving..." : (isEditing ? "Update Candidate" : "Add Candidate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
