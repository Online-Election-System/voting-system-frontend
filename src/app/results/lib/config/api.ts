// Updated API Configuration - Aligned with Ballerina Backend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Endpoints - Matching your Ballerina backend exactly
export const ENDPOINTS = {
  // Admin Registration Service
  ADMIN_REGISTRATION: {
    GOV_OFFICIAL_REGISTER: '/admin-registration/api/v1/gov-official/register',
    ELECTION_COMMISSION_REGISTER: '/admin-registration/api/v1/election-commission/register',
    LOGOUT: '/admin-registration/api/v1/logout',
  },

  // Voter Registration Service
  VOTER_REGISTRATION: {
    REGISTER: '/voter-registration/api/v1/register',
    LOGIN: '/voter-registration/api/v1/login',
    LOGOUT: '/voter-registration/api/v1/logout',
    CHANGE_PASSWORD: '/voter-registration/api/v1/change-password',
    PROFILE: (voterId: string) => `/voter-registration/api/v1/profile/${voterId}`,
    VOTER_ELECTIONS: (voterId: string) => `/voter-registration/api/v1/voter/${voterId}/elections`,
  },

  // Election Management Service
  ELECTIONS: {
    // Public endpoints
    ALL: '/election/api/v1/elections',
    BY_ID: (electionId: string) => `/election/api/v1/elections/${electionId}`,
    
    // Voter enrollment endpoints
    VOTER_ENROLLED: (voterId: string, electionId: string) => 
      `/election/api/v1/voter/${voterId}/election/${electionId}/enrolled`,
    VOTER_ELECTIONS: (voterId: string) => `/election/api/v1/voter/${voterId}/elections`,
    
    // Admin endpoints
    CREATE: '/election/api/v1/elections/create',
    UPDATE: (electionId: string) => `/election/api/v1/elections/${electionId}/update`,
    DELETE: (electionId: string) => `/election/api/v1/elections/${electionId}/delete`,
    
    // Admin utilities
    TOKEN_STATS: '/election/api/v1/admin/token-stats',
    CLEANUP_TOKENS: '/election/api/v1/admin/cleanup-tokens',
  },

  // Candidate Management Service
  CANDIDATES: {
    // Get candidates
    ALL: '/candidate/api/v1/candidates',
    BY_ID: (candidateId: string) => `/candidate/api/v1/candidates/${candidateId}`,
    BY_ELECTION: (electionId: string) => `/candidate/api/v1/elections/${electionId}/candidates`,
    BY_ELECTION_AND_PARTY: (electionId: string, partyName: string) => 
      `/candidate/api/v1/elections/${electionId}/candidates/party/${partyName}`,
    BY_PARTY: (partyName: string) => `/candidate/api/v1/candidates/party/${partyName}`,
    
    // Candidate status
    IS_ACTIVE: (candidateId: string) => `/candidate/api/v1/candidates/${candidateId}/active`,
    ACTIVE_BY_ELECTION: (electionId: string) => `/candidate/api/v1/elections/${electionId}/candidates/active`,
    
    // Voter-specific candidate endpoints
    FOR_VOTER: (voterId: string) => `/candidate/api/v1/voter/${voterId}/candidates`,
    FOR_VOTER_ELECTION: (voterId: string, electionId: string) => 
      `/candidate/api/v1/voter/${voterId}/election/${electionId}/candidates`,
    
    // CRUD operations
    CREATE: '/candidate/api/v1/candidates/create',
    UPDATE: (candidateId: string) => `/candidate/api/v1/candidates/${candidateId}/update`,
    DELETE: (candidateId: string) => `/candidate/api/v1/candidates/${candidateId}/delete`,
    
    // Admin utilities
    UPDATE_STATUSES: '/candidate/api/v1/admin/update-candidate-statuses',
  },

  // Voting Service
  VOTES: {
    // Cast vote
    CAST: '/vote/api/v1/votes/cast',
    
    // Eligibility check
    ELIGIBILITY: (voterId: string, electionId: string) => 
      `/vote/api/v1/eligibility/${voterId}/election/${electionId}`,
    
    // Get votes
    BY_ELECTION: (electionId: string) => `/vote/api/v1/votes/election/${electionId}`,
    BY_VOTER: (voterId: string) => `/vote/api/v1/votes/voter/${voterId}`,
    BY_ELECTION_AND_DISTRICT: (electionId: string, district: string) => 
      `/vote/api/v1/votes/election/${electionId}/district/${encodeURIComponent(district)}`,
    BY_HOUSEHOLD: (chiefOccupantId: string, electionId: string) => 
      `/vote/api/v1/votes/household/${chiefOccupantId}/election/${electionId}`,
  },

  // Results Service - COMPREHENSIVE API
  RESULTS: {
    // Candidate totals and rankings
    CANDIDATE_TOTALS: (electionId: string) => `/results/api/v1/elections/${electionId}/candidates/totals`,
    UPDATE_CANDIDATE_TOTAL: (electionId: string, candidateId: string) => 
      `/results/api/v1/elections/${electionId}/candidates/${candidateId}/update-total`,
    BATCH_UPDATE_TOTALS: (electionId: string) => 
      `/results/api/v1/elections/${electionId}/candidates/batch-update-totals`,
    
    // Candidate summaries and export
    CANDIDATE_SUMMARY: (electionId: string) => `/results/api/v1/elections/${electionId}/candidates/summary`,
    CANDIDATE_EXPORT: (electionId: string) => `/results/api/v1/elections/${electionId}/candidates/export`,
    CANDIDATE_EXPORT_CSV: (electionId: string) => `/results/api/v1/elections/${electionId}/candidates/export/csv`,
    
    // District analysis
    DISTRICT_ANALYSIS: (electionId: string) => `/results/api/v1/elections/${electionId}/districts/analysis`,
    DISTRICT_TOTALS: (electionId: string) => `/results/api/v1/elections/${electionId}/districts/totals`,
    DISTRICT_WINNERS: (electionId: string) => `/results/api/v1/elections/${electionId}/districts/winners`,
    
    // Election summary and overview
    ELECTION_SUMMARY: (electionId: string) => `/results/api/v1/elections/${electionId}/summary`,
    
    
    // Specific queries
    WINNER: (electionId: string) => `/results/api/v1/elections/${electionId}/winner`,
    TOP_CANDIDATES: (electionId: string, count: number) => 
      `/results/api/v1/elections/${electionId}/candidates/top/${count}`,
    CANDIDATE_RANK: (electionId: string, candidateId: string) => 
      `/results/api/v1/elections/${electionId}/candidates/${candidateId}/rank`,
    
    // Advanced analytics
    DISTRIBUTION_STATS: (electionId: string) => `/results/api/v1/elections/${electionId}/statistics/distribution`,
    MARGIN_ANALYSIS: (electionId: string) => `/results/api/v1/elections/${electionId}/statistics/margins`,
    
    // Admin utilities
    REFRESH_CALCULATIONS: (electionId: string) => 
      `/results/api/v1/admin/elections/${electionId}/refresh-calculations`,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// CORS Configuration (matching your Ballerina service)
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001'
  ],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOW_CREDENTIALS: true,
} as const;

// Election Status Types
export const ELECTION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// User Roles (from your auth system)
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  GOVERNMENT_OFFICIAL: 'GOVERNMENT_OFFICIAL',
  ELECTION_COMMISSION: 'ELECTION_COMMISSION',
  VOTER: 'VOTER',
} as const;

// Permissions
export const PERMISSIONS = {
  CREATE_ELECTION: 'CREATE_ELECTION',
  DELETE_ELECTION: 'DELETE_ELECTION',
  MANAGE_CANDIDATES: 'MANAGE_CANDIDATES',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ELECTIONS: 'MANAGE_ELECTIONS',
} as const;

// API Response Status
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Default Election ID for testing - UPDATED TO MATCH YOUR BACKEND
export const DEFAULT_ELECTION_ID = 'PRE_2024';

// Sri Lankan Districts - for reference and validation
export const SRI_LANKAN_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'NuwaraEliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
] as const;

export type ElectionStatus = typeof ELECTION_STATUS[keyof typeof ELECTION_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type ApiResponseStatus = typeof API_RESPONSE_STATUS[keyof typeof API_RESPONSE_STATUS];
export type SriLankanDistrict = typeof SRI_LANKAN_DISTRICTS[number];