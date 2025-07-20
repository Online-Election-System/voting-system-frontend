// components/CandidateDialog.tsx
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CandidateDialogProps } from "../candidate.types";
import { useCandidateForm } from "../hooks/use-candidate-form";
import { DIALOG_CONFIG } from "../candidate-constants";

export const CandidateDialog = ({ 
  open, 
  onOpenChange, 
  candidate, 
  onSubmit, 
  onCancel 
}: CandidateDialogProps) => {
  const {
    name,
    setName,
    party,
    setParty,
    resetForm,
    setFormData,
    getFormData
  } = useCandidateForm();

  const isEditing = Boolean(candidate);

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    } else {
      resetForm();
    }
  }, [candidate, setFormData, resetForm]);

  const handleSubmit = () => {
    const formData = getFormData();
    if (formData.name.trim() && formData.party.trim()) {
      onSubmit(formData);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? DIALOG_CONFIG.TITLES.EDIT : DIALOG_CONFIG.TITLES.ADD}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? DIALOG_CONFIG.DESCRIPTIONS.EDIT : DIALOG_CONFIG.DESCRIPTIONS.ADD}
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
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="party">Political Party</Label>
            <Input
              id="party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="Enter political party"
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {DIALOG_CONFIG.BUTTONS.CANCEL}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !party.trim()}
          >
            {isEditing ? DIALOG_CONFIG.BUTTONS.EDIT : DIALOG_CONFIG.BUTTONS.ADD}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
