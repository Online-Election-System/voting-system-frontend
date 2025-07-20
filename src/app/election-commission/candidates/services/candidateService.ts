import { Candidate, CandidateFormData } from "../candidate.types";

export class CandidateService {
  static generateId(candidates: Candidate[]): number {
    return Math.max(...candidates.map(c => c.id), 0) + 1;
  }

  static createCandidate(
    candidates: Candidate[], 
    formData: CandidateFormData
  ): Candidate {
    return {
      id: this.generateId(candidates),
      name: formData.name.trim(),
      party: formData.party.trim()
    };
  }

  static updateCandidate(
    candidates: Candidate[], 
    candidateId: number, 
    formData: CandidateFormData
  ): Candidate[] {
    return candidates.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, name: formData.name.trim(), party: formData.party.trim() }
        : candidate
    );
  }

  static deleteCandidate(candidates: Candidate[], candidateId: number): Candidate[] {
    return candidates.filter(candidate => candidate.id !== candidateId);
  }

  static validateCandidateData(formData: CandidateFormData): string[] {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push("Candidate name is required");
    }
    
    if (!formData.party.trim()) {
      errors.push("Political party is required");
    }
    
    return errors;
  }
}