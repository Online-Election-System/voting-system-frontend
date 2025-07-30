// lib/config/api.ts
// API configuration for election results system

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  RESULTS_BASE_PATH: '/results/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Default election ID that matches your backend
export const DEFAULT_ELECTION_ID = 'PRE_2024';

// API endpoints configuration
export const API_ENDPOINTS = {
  // Election endpoints
  ELECTIONS: '/elections',
  
  // Candidate endpoints
  CANDIDATE_TOTALS: (electionId: string) => `/elections/${electionId}/candidates/totals`,
  CANDIDATE_EXPORT: (electionId: string) => `/elections/${electionId}/candidates/export`,
  CANDIDATE_EXPORT_CSV: (electionId: string) => `/elections/${electionId}/candidates/export/csv`,
  CANDIDATE_TOP: (electionId: string, count: number) => `/elections/${electionId}/candidates/top/${count}`,
  CANDIDATE_RANK: (electionId: string, candidateId: string) => `/elections/${electionId}/candidates/${candidateId}/rank`,
  BATCH_UPDATE_TOTALS: (electionId: string) => `/elections/${electionId}/candidates/batch-update-totals`,
  
  // District endpoints
  DISTRICT_ANALYSIS: (electionId: string) => `/elections/${electionId}/districts/analysis`,
  DISTRICT_TOTALS: (electionId: string) => `/elections/${electionId}/districts/totals`,
  DISTRICT_WINNERS: (electionId: string) => `/elections/${electionId}/districts/winners`,
  
  // Election summary endpoints
  ELECTION_SUMMARY: (electionId: string) => `/election/${electionId}/summary`,
  ELECTION_WINNER: (electionId: string) => `/elections/${electionId}/winner`,
  
  // Statistics endpoints
  STATISTICS_DISTRIBUTION: (electionId: string) => `/elections/${electionId}/statistics/distribution`,
  STATISTICS_MARGINS: (electionId: string) => `/elections/${electionId}/statistics/margins`,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// API response status types
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  NOT_FOUND: 'Requested data not found.',
  INVALID_ELECTION_ID: 'Invalid election ID provided.',
  NO_DATA: 'No data available for the requested election.',
  BATCH_UPDATE_FAILED: 'Failed to update candidate totals.',
  CALCULATION_REFRESH_FAILED: 'Failed to refresh calculations.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully',
  BATCH_UPDATE_SUCCESS: 'Candidate totals updated successfully',
  CALCULATION_REFRESH_SUCCESS: 'Calculations refreshed successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
} as const;

// Build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const basePath = API_CONFIG.RESULTS_BASE_PATH.replace(/^\//, ''); // Remove leading slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  
  return `${baseUrl}/${basePath}/${cleanEndpoint}`;
};

// Validate election ID format
export const isValidElectionId = (electionId: string): boolean => {
  return typeof electionId === 'string' && electionId.length > 0 && /^[A-Z0-9_]+$/.test(electionId);
};

// Get election ID with fallback
export const getElectionId = (electionId?: string): string => {
  if (electionId && isValidElectionId(electionId)) {
    return electionId;
  }
  return DEFAULT_ELECTION_ID;
};

// Environment checks
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Debug logging in development
export const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[API Debug] ${message}`, data || '');
  }
};

// Error logging
export const errorLog = (message: string, error?: any) => {
  if (isDevelopment) {
    console.error(`[API Error] ${message}`, error || '');
  }
};