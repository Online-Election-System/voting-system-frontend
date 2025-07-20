import { useCallback, useState } from "react";
import { Candidate, CandidateFormData } from "../candidate.types";

export const useCandidateForm = (initialCandidate?: Candidate | null) => {
  const [name, setName] = useState(initialCandidate?.name || "");
  const [party, setParty] = useState(initialCandidate?.party || "");

  const resetForm = useCallback(() => {
    setName("");
    setParty("");
  }, []);

  const setFormData = useCallback((candidate: Candidate) => {
    setName(candidate.name);
    setParty(candidate.party);
  }, []);

  const getFormData = useCallback((): CandidateFormData => ({
    name,
    party
  }), [name, party]);

  return {
    name,
    setName,
    party,
    setParty,
    resetForm,
    setFormData,
    getFormData
  };
};