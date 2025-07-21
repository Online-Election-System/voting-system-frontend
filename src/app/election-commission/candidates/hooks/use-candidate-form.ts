import { useCallback, useState } from "react";
import { Candidate, CandidateFormData } from "../candidate.types";

export const useCandidateForm = (initialCandidate?: Candidate | null) => {
  const [name, setName] = useState(initialCandidate?.candidateName || "");
  const [party, setParty] = useState(initialCandidate?.partyName || "");

  const resetForm = useCallback(() => {
    setName("");
    setParty("");
  }, []);

  const setFormData = useCallback((candidate: Candidate) => {
    setName(candidate.candidateName);
    setParty(candidate.partyName);
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