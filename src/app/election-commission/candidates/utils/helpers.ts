import { CandidateFormData } from "../candidate.types";

export const generateUniqueId = (existingIds: number[]): number => {
  return Math.max(...existingIds, 0) + 1;
};

export const createEmptyFormData = (): CandidateFormData => ({
  name: '',
  party: ''
});