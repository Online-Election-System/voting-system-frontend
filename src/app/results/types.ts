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

// Frontend-compatible types (for legacy compatibility)
export interface CandidateTotal {
  candidateId: string;
  Totals: number; // Note: Uppercase T for frontend compatibility
}

// Backend-compatible types (matching actual API responses)
export interface BackendCandidateTotal {
  candidateId: string;
  totals: number; // lowercase to match backend
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

// Frontend-compatible types (for legacy compatibility)
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

// Backend-compatible types (matching actual API responses)
export interface BackendDistrictVoteTotals {
  electionId: string;
  ampara: number;
  anuradhapura: number;
  badulla: number;
  batticaloa: number;
  colombo: number;
  galle: number;
  gampaha: number;
  hambantota: number;
  jaffna: number;
  kalutara: number;
  kandy: number;
  kegalle: number;
  kilinochchi: number;
  kurunegala: number;
  mannar: number;
  matale: number;
  matara: number;
  monaragala: number;
  mullaitivu: number;
  nuwaraeliya: number;
  polonnaruwa: number;
  puttalam: number;
  ratnapura: number;
  trincomalee: number;
  vavuniya: number;
  grandTotal: number; // camelCase to match backend
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

// Type conversion utilities
export type ConvertToBackend<T extends DistrictVoteTotals> = BackendDistrictVoteTotals;
export type ConvertToFrontend<T extends BackendDistrictVoteTotals> = DistrictVoteTotals;

// Type guards for runtime type checking
export function isBackendDistrictVoteTotals(obj: any): obj is BackendDistrictVoteTotals {
  return obj && typeof obj === 'object' && 'grandTotal' in obj && 'ampara' in obj;
}

export function isFrontendDistrictVoteTotals(obj: any): obj is DistrictVoteTotals {
  return obj && typeof obj === 'object' && 'GrandTotal' in obj && 'Ampara' in obj;
}

export function isBackendCandidateTotal(obj: any): obj is BackendCandidateTotal {
  return obj && typeof obj === 'object' && 'totals' in obj && 'candidateId' in obj;
}

export function isFrontendCandidateTotal(obj: any): obj is CandidateTotal {
  return obj && typeof obj === 'object' && 'Totals' in obj && 'candidateId' in obj;
}

// Data transformation utilities
export function convertDistrictTotalsToFrontend(backend: BackendDistrictVoteTotals): DistrictVoteTotals {
  return {
    electionId: backend.electionId,
    Ampara: backend.ampara,
    Anuradhapura: backend.anuradhapura,
    Badulla: backend.badulla,
    Batticaloa: backend.batticaloa,
    Colombo: backend.colombo,
    Galle: backend.galle,
    Gampaha: backend.gampaha,
    Hambantota: backend.hambantota,
    Jaffna: backend.jaffna,
    Kalutara: backend.kalutara,
    Kandy: backend.kandy,
    Kegalle: backend.kegalle,
    Kilinochchi: backend.kilinochchi,
    Kurunegala: backend.kurunegala,
    Mannar: backend.mannar,
    Matale: backend.matale,
    Matara: backend.matara,
    Monaragala: backend.monaragala,
    Mullaitivu: backend.mullaitivu,
    NuwaraEliya: backend.nuwaraeliya,
    Polonnaruwa: backend.polonnaruwa,
    Puttalam: backend.puttalam,
    Ratnapura: backend.ratnapura,
    Trincomalee: backend.trincomalee,
    Vavuniya: backend.vavuniya,
    GrandTotal: backend.grandTotal,
  };
}

export function convertDistrictTotalsToBackend(frontend: DistrictVoteTotals): BackendDistrictVoteTotals {
  return {
    electionId: frontend.electionId,
    ampara: frontend.Ampara,
    anuradhapura: frontend.Anuradhapura,
    badulla: frontend.Badulla,
    batticaloa: frontend.Batticaloa,
    colombo: frontend.Colombo,
    galle: frontend.Galle,
    gampaha: frontend.Gampaha,
    hambantota: frontend.Hambantota,
    jaffna: frontend.Jaffna,
    kalutara: frontend.Kalutara,
    kandy: frontend.Kandy,
    kegalle: frontend.Kegalle,
    kilinochchi: frontend.Kilinochchi,
    kurunegala: frontend.Kurunegala,
    mannar: frontend.Mannar,
    matale: frontend.Matale,
    matara: frontend.Matara,
    monaragala: frontend.Monaragala,
    mullaitivu: frontend.Mullaitivu,
    nuwaraeliya: frontend.NuwaraEliya,
    polonnaruwa: frontend.Polonnaruwa,
    puttalam: frontend.Puttalam,
    ratnapura: frontend.Ratnapura,
    trincomalee: frontend.Trincomalee,
    vavuniya: frontend.Vavuniya,
    grandTotal: frontend.GrandTotal,
  };
}

export function convertCandidateTotalToFrontend(backend: BackendCandidateTotal): CandidateTotal {
  return {
    candidateId: backend.candidateId,
    Totals: backend.totals,
  };
}

export function convertCandidateTotalToBackend(frontend: CandidateTotal): BackendCandidateTotal {
  return {
    candidateId: frontend.candidateId,
    totals: frontend.Totals,
  };
}

// Sri Lankan Districts
export const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'NuwaraEliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
] as const;

export type SriLankanDistrict = typeof SRI_LANKAN_DISTRICTS[number];

// Backend district names (lowercase/camelCase)
export const BACKEND_DISTRICT_NAMES = [
  'ampara', 'anuradhapura', 'badulla', 'batticaloa', 'colombo',
  'galle', 'gampaha', 'hambantota', 'jaffna', 'kalutara',
  'kandy', 'kegalle', 'kilinochchi', 'kurunegala', 'mannar',
  'matale', 'matara', 'monaragala', 'mullaitivu', 'nuwaraeliya',
  'polonnaruwa', 'puttalam', 'ratnapura', 'trincomalee', 'vavuniya'
] as const;

export type BackendDistrictName = typeof BACKEND_DISTRICT_NAMES[number];

// District name mapping utilities
export const DISTRICT_NAME_MAP: Record<SriLankanDistrict, BackendDistrictName> = {
  'Ampara': 'ampara',
  'Anuradhapura': 'anuradhapura',
  'Badulla': 'badulla',
  'Batticaloa': 'batticaloa',
  'Colombo': 'colombo',
  'Galle': 'galle',
  'Gampaha': 'gampaha',
  'Hambantota': 'hambantota',
  'Jaffna': 'jaffna',
  'Kalutara': 'kalutara',
  'Kandy': 'kandy',
  'Kegalle': 'kegalle',
  'Kilinochchi': 'kilinochchi',
  'Kurunegala': 'kurunegala',
  'Mannar': 'mannar',
  'Matale': 'matale',
  'Matara': 'matara',
  'Monaragala': 'monaragala',
  'Mullaitivu': 'mullaitivu',
  'NuwaraEliya': 'nuwaraeliya',
  'Polonnaruwa': 'polonnaruwa',
  'Puttalam': 'puttalam',
  'Ratnapura': 'ratnapura',
  'Trincomalee': 'trincomalee',
  'Vavuniya': 'vavuniya',
};

export const BACKEND_TO_FRONTEND_DISTRICT_MAP: Record<BackendDistrictName, SriLankanDistrict> = {
  'ampara': 'Ampara',
  'anuradhapura': 'Anuradhapura',
  'badulla': 'Badulla',
  'batticaloa': 'Batticaloa',
  'colombo': 'Colombo',
  'galle': 'Galle',
  'gampaha': 'Gampaha',
  'hambantota': 'Hambantota',
  'jaffna': 'Jaffna',
  'kalutara': 'Kalutara',
  'kandy': 'Kandy',
  'kegalle': 'Kegalle',
  'kilinochchi': 'Kilinochchi',
  'kurunegala': 'Kurunegala',
  'mannar': 'Mannar',
  'matale': 'Matale',
  'matara': 'Matara',
  'monaragala': 'Monaragala',
  'mullaitivu': 'Mullaitivu',
  'nuwaraeliya': 'NuwaraEliya',
  'polonnaruwa': 'Polonnaruwa',
  'puttalam': 'Puttalam',
  'ratnapura': 'Ratnapura',
  'trincomalee': 'Trincomalee',
  'vavuniya': 'Vavuniya',
};

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
  POLLING_STATION: 'POLLING_STATION',
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

// Safe data access utilities
export const SafeDataUtils = {
  safeNumber: (value: number | undefined | null): number => value || 0,
  safeString: (value: string | undefined | null): string => value || '',
  safePercentage: (value: number | undefined | null): string => (value || 0).toFixed(2),
  safeLocaleString: (value: number | undefined | null): string => (value || 0).toLocaleString(),
  safeBool: (value: boolean | undefined | null): boolean => Boolean(value),
};

// Export safe data utils as individual functions for easier imports
export const {
  safeNumber,
  safeString, 
  safePercentage,
  safeLocaleString,
  safeBool
} = SafeDataUtils;

// Backend-compatible types (matching actual API responses)
export interface BackendCandidateTotal {
  candidateId: string;
  totals: number; // lowercase to match backend
}

export interface BackendDistrictVoteTotals {
  electionId: string;
  ampara: number;
  anuradhapura: number;
  badulla: number;
  batticaloa: number;
  colombo: number;
  galle: number;
  gampaha: number;
  hambantota: number;
  jaffna: number;
  kalutara: number;
  kandy: number;
  kegalle: number;
  kilinochchi: number;
  kurunegala: number;
  mannar: number;
  matale: number;
  matara: number;
  monaragala: number;
  mullaitivu: number;
  nuwaraeliya: number;
  polonnaruwa: number;
  puttalam: number;
  ratnapura: number;
  trincomalee: number;
  vavuniya: number;
  grandTotal: number; // camelCase to match backend
}