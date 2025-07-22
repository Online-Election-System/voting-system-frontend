import { Candidate, CandidateFormData } from "../candidate.types";

export const generateUniqueId = (existingIds: number[]): number => {
  return Math.max(...existingIds, 0) + 1;
};

export const createEmptyFormData = (): CandidateFormData => ({
  candidateName: '',
  partyName: '',
  partyColor: ''
});

// Helper function to ensure candidate has ID field for frontend compatibility
export function normalizeCandidateForFrontend(candidate: any): Candidate {
  return {
    ...candidate,
    id: candidate.candidateId || candidate.id, // Use candidateId as id if id is missing
    candidateId: candidate.candidateId || candidate.id,
  };
}

// Helper to convert frontend candidate back to backend format
export function prepareCandidateForBackend(candidate: Candidate): any {
  const { id, ...backendCandidate } = candidate as any;
  return {
    ...backendCandidate,
    candidateId: candidate.candidateId,
  };
}
