// types/election.ts
export interface CandidateTotal {
  candidateId: string;
  Totals: number;
}

export interface DistrictVoteTotal {
  district: string;
  totalVotes: number;
}

export interface CandidateDistrictAnalysis {
  candidateId: string;
  candidateName?: string;
  districtVotes: Record<string, number>;
  districtPercentages: Record<string, number>;
  totalVotes: number;
}

export interface CandidateVoteSummary {
  candidateId: string;
  candidateName?: string;
  totalVotes: number;
  percentage: number;
  rank: number;
}

export interface CandidateExportData {
  candidateId: string;
  candidateImage?: string;
  position: number;
  candidateName: string;
  partyName: string;
  partyColor: string;
  totalVotes: number;
  percentage: number;
  districtsWon: number;
  partySymbol?: string;
  isActive: boolean;
}

export interface ElectionSummary {
  electionId: string;
  totalCandidates: number;
  totalVotes: number;
  winner: string;
  winnerPercentage: number;
  totalDistrictsConsidered: number;
}

export interface DistrictWinner {
  candidateId: string;
  candidateName: string;
  votes: number;
}

export interface DistrictWinnerAnalysis {
  electionId: string;
  districtWinners: Record<string, DistrictWinner>;
  marginPercentages: Record<string, number>;
}

export interface DistrictVoteTotals {
  electionId: string;
  Ampara: number;
  Anuradhapura: number;
  Badulla: number;
  Batticaloa: number;
  Colombo: number;
  Galle: number;
  Gampaha: number;
  Hambantota: number;
  Jaffna: number;
  Kalutara: number;
  Kandy: number;
  Kegalle: number;
  Kilinochchi: number;
  Kurunegala: number;
  Mannar: number;
  Matale: number;
  Matara: number;
  Monaragala: number;
  Mullaitivu: number;
  NuwaraEliya: number;
  Polonnaruwa: number;
  Puttalam: number;
  Ratnapura: number;
  Trincomalee: number;
  Vavuniya: number;
  GrandTotal: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  statistics: {
    candidatesWithMismatchedTotals: number;
    candidatesWithNegativeVotes: number;
    candidatesWithMissingData: number;
  };
}

export const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura", 
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "NuwaraEliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya"
] as const;

export type District = typeof SRI_LANKAN_DISTRICTS[number];