import { useState, useCallback } from 'react';
import { Candidate, CandidateFormData } from "../candidate.types";
import { CandidateService } from '../services/candidateService';
import { INITIAL_CANDIDATES } from '../candidate-constants';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);

  const addCandidate = useCallback((formData: CandidateFormData) => {
    const newCandidate = CandidateService.createCandidate(candidates, formData);
    setCandidates(prev => [...prev, newCandidate]);
  }, [candidates]);

  const updateCandidate = useCallback((candidateId: number, formData: CandidateFormData) => {
    const updatedCandidates = CandidateService.updateCandidate(candidates, candidateId, formData);
    setCandidates(updatedCandidates);
  }, [candidates]);

  const deleteCandidate = useCallback((candidateId: number) => {
    const filteredCandidates = CandidateService.deleteCandidate(candidates, candidateId);
    setCandidates(filteredCandidates);
  }, [candidates]);

  return {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate
  };
};
