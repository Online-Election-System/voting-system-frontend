import { CandidateFormData } from "../candidate.types";

export const validateRequired = (value: string, fieldName: string): string | null => {
  return value.trim() ? null : `${fieldName} is required`;
};

export const validateCandidateForm = (formData: CandidateFormData): string[] => {
  const errors: string[] = [];
  
  const nameError = validateRequired(formData.name, 'Candidate name');
  const partyError = validateRequired(formData.party, 'Political party');
  
  if (nameError) errors.push(nameError);
  if (partyError) errors.push(partyError);
  
  return errors;
};