import { useCallback, useState } from "react";
import { Candidate } from "../candidate.types";

export const useCandidateDialog = () => {
  const [open, setOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const openDialog = useCallback((candidate?: Candidate) => {
    setEditingCandidate(candidate || null);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setEditingCandidate(null);
  }, []);

  return {
    open,
    editingCandidate,
    openDialog,
    closeDialog,
    setOpen
  };
};