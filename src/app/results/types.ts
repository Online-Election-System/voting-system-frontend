// Unified types file to prevent conflicts between hooks and components
// This should be your main types.ts file

// Core Election Types
export interface Election {
  id: string;
  electionName: string;
  electionDate: string;
  status: string;
}

// Candidate Types - Updated to handle null values from backend
export interface CandidateExportData {
  candidateId: string;
  candidateImage?: string | null; // Allow both null and undefined
  position: number;
  candidateName: string;
  partyName: string;
  partyColor: string;
  totalVotes: number;
  percentage: number;
  districtsWon: number;
  partySymbol?: string | null; // Allow both null and undefined
  isActive: boolean;
}

export interface Candidate {
  candidateId: string;
  candidateName: string;
  partyName: string;
  partyColor: string;
  popularVotes?: number;
  electoralVotes?: number;
  electionId: string;
  position?: number;
  isActive: boolean;
  candidateImage?: string | null;
  partySymbol?: string | null;
}

// Results Types - Matching Ballerina backend exactly
export interface CandidateTotal {
  candidateId: string;
  Totals: number; // Note: Uppercase T to match Ballerina backend exactly
}

export interface CandidateVoteSummary {
  candidateId: string;
  candidateName?: string | null; // Updated to handle null values from backend  
  totalVotes: number;
  percentage: number;
  rank: number;
}

export interface CandidateDistrictAnalysis {
  candidateId: string;
  candidateName?: string | null;
  districtVotes: Record<string, number>;
  districtPercentages: Record<string, number>;
  totalVotes: number;
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

export interface ElectionSummary {
  electionId: string;
  totalCandidates: number;
  totalVotes: number;
  winner: string;
  winnerPercentage: number;
  totalDistrictsConsidered: number;
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

export interface DistributionStatistics {
  electionId: string;
  totalCandidates: number;
  totalVotes: number;
  maxPercentage: number;
  minPercentage: number;
  averagePercentage: number;
  competitivenessIndex: number;
}

export interface MarginAnalysis {
  electionId: string;
  winner: {
    candidateId: string;
    votes: number;
  };
  runnerUp: {
    candidateId: string;
    votes: number;
  };
  margin: {
    votes: number;
    percentage: number;
  };
}

export interface CandidateRank {
  candidateId: string;
  rank: number;
  totalVotes: number;
  totalCandidates: number;
}

export interface ElectionWinner {
  electionId: string;
  winnerCandidateId: string;
  totalVotes: number;
  message: string;
}

// Voting Types
export interface Vote {
  id: string;
  voterId: string;
  electionId: string;
  candidateId: string;
  districtCode: string;
  timestamp: string;
}

export interface Voter {
  id: string;
  name: string;
  email: string;
  district: string;
  province: string;
}

// API Response Types
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: 'success' | 'error' | 'loading';
}

// Utility Types for handling null/undefined conversion
export type NullableToUndefined<T> = {
  [K in keyof T]: T[K] extends null | undefined ? T[K] | undefined : T[K];
};

// Helper type to convert backend null values to frontend undefined
export type BackendToFrontend<T> = {
  [K in keyof T]: T[K] extends string | null | undefined 
    ? string | undefined 
    : T[K];
};

// Sri Lankan Districts
export const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'NuwaraEliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
] as const;

export type SriLankanDistrict = typeof SRI_LANKAN_DISTRICTS[number];

// Election Status Types
export const ELECTION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ElectionStatus = typeof ELECTION_STATUS[keyof typeof ELECTION_STATUS];

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  GOVERNMENT_OFFICIAL: 'GOVERNMENT_OFFICIAL',
  ELECTION_COMMISSION: 'ELECTION_COMMISSION',
  VOTER: 'VOTER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// API Response Status
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

export type ApiResponseStatus = typeof API_RESPONSE_STATUS[keyof typeof API_RESPONSE_STATUS];