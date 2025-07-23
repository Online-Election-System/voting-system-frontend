// Fixed resultService.ts - Consolidated API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Fixed API Endpoints - Results Service (matching your Ballerina backend exactly)
export const ENDPOINTS = {
  // Election Management Endpoints
  ELECTIONS: {
    // Main endpoint for frontend - matches your backend
    SUMMARY: (electionId: string) => `/result/api/v1/election/${electionId}/summary`,
    
    // Election details
    BY_ID: (electionId: string) => `/result/api/v1/election/${electionId}`,
    
    // Election winner (candidate with most electoral votes)
    WINNER: (electionId: string) => `/result/api/v1/election/${electionId}/winner`,
    
    // Popular vote winner
    POPULAR_WINNER: (electionId: string) => `/result/api/v1/election/${electionId}/popular-winner`,
    
    // Victory margin analysis
    MARGIN: (electionId: string) => `/result/api/v1/election/${electionId}/margin`,
    
    // Party summaries for election
    PARTIES: (electionId: string) => `/result/api/v1/election/${electionId}/parties`,
    
    // Election summary statistics
    SUMMARY_STATS: (electionId: string) => `/result/api/v1/election/${electionId}/summary-stats`,
    
    // District results for specific election
    DISTRICTS: (electionId: string) => `/result/api/v1/election/${electionId}/districts`,
  },

  // Candidate Management Endpoints
  CANDIDATES: {
    // Get all candidates for a specific election
    BY_ELECTION: (electionId: string) => `/result/api/v1/election/${electionId}/candidates`,
    
    // Get specific candidate by ID
    BY_ID: (candidateId: string) => `/result/api/v1/candidates/${candidateId}`,
    
    // Get candidate metrics and analytics
    METRICS: (candidateId: string) => `/result/api/v1/candidates/${candidateId}/metrics`,
  },

  // District Management Endpoints
  DISTRICTS: {
    // Get all districts
    ALL: '/result/api/v1/districts',
    
    // Get specific district by ID
    BY_ID: (districtId: string) => `/result/api/v1/districts/${districtId}`,
    
    // Get district results with detailed breakdown
    RESULTS: (districtId: string) => `/result/api/v1/districts/${districtId}/results`,
  },

  // Province Management Endpoints
  PROVINCES: {
    // Get all provinces
    ALL: '/result/api/v1/provinces',
    
    // Get specific province by ID
    BY_ID: (provinceId: string) => `/result/api/v1/provinces/${provinceId}`,
    
    // Get districts by province ID
    DISTRICTS: (provinceId: string) => `/result/api/v1/provinces/${provinceId}/districts`,
  },

  // Voting System Endpoints (if you still need these from other services)
  VOTES: {
    CAST: '/vote/api/v1/votes/cast',
    BY_ELECTION: (electionId: string) => `/vote/api/v1/votes/election/${electionId}`,
    BY_VOTER: (voterId: string) => `/vote/api/v1/votes/voter/${voterId}`,
    BY_ELECTION_AND_DISTRICT: (electionId: string, district: string) => 
      `/vote/api/v1/votes/election/${electionId}/district/${encodeURIComponent(district)}`,
  },

  // Voter Registration Endpoints (if you still need these from other services)
  VOTERS: {
    LOGIN: '/voter-registration/api/v1/login',
    REGISTER: '/voter-registration/api/v1/register',
    PROFILE: (voterId: string) => `/voter-registration/api/v1/voters/${voterId}`,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
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
  ALLOW_CREDENTIALS: false,
} as const;

// Election Status Types
export const ELECTION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// Margin Types
export const MARGIN_TYPES = {
  POPULAR_VOTE: 'POPULAR_VOTE',
  ELECTORAL_VOTE: 'ELECTORAL_VOTE',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
} as const;

// API Response Status
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

export type ElectionStatus = typeof ELECTION_STATUS[keyof typeof ELECTION_STATUS];
export type MarginType = typeof MARGIN_TYPES[keyof typeof MARGIN_TYPES];
export type ApiResponseStatus = typeof API_RESPONSE_STATUS[keyof typeof API_RESPONSE_STATUS];