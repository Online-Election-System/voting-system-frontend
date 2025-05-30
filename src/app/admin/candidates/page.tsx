"use client"

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CandidateTable } from "./components/candidate-table";
import { CandidateDialog } from "./components/candidate-dialog";
import { useCandidates } from "./hooks/use-candidates";
import { CandidateFormData } from "./candidate.types";
import { useCandidateDialog } from "./hooks/use-candidate-dialog";

export default function CandidatesPage() {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { open, editingCandidate, openDialog, closeDialog, setOpen } = useCandidateDialog();

  const handleAddClick = () => {
    openDialog();
  };

  const handleEditClick = (candidate: any) => {
    openDialog(candidate);
  };

  const handleSubmit = (formData: CandidateFormData) => {
    if (editingCandidate) {
      updateCandidate(editingCandidate.id, formData);
    } else {
      addCandidate(formData);
    }
    closeDialog();
  };

  const handleCancel = () => {
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Candidates</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <CandidateTable 
        candidates={candidates}
        onEdit={handleEditClick}
        onDelete={deleteCandidate}
      />

      <CandidateDialog
        open={open}
        onOpenChange={setOpen}
        candidate={editingCandidate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
