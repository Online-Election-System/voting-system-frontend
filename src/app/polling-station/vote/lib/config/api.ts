// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

// API Endpoints
export const ENDPOINTS = {
  VOTES: {
    CAST: '/vote/api/v1/votes/cast',
    BY_ELECTION: (electionId: string) => `/vote/api/v1/votes/election/${electionId}`,
    BY_VOTER: (voterId: string) => `/vote/api/v1/votes/voter/${voterId}`,
    BY_ELECTION_AND_DISTRICT: (electionId: string, district: string) => 
      `/vote/api/v1/votes/election/${electionId}/district/${encodeURIComponent(district)}`,
  },
  VOTERS: {
    LOGIN: '/voter-registration/api/v1/login',
    REGISTER: '/voter-registration/api/v1/register',
    PROFILE: (voterId: string) => `/voter-registration/api/v1/voters/${voterId}`,
  },
  ELECTIONS: {
    ALL: '/election/api/v1/elections',
    BY_ID: (electionId: string) => `/election/api/v1/elections/${electionId}`,
  },
  CANDIDATES: {
    BY_ELECTION: (electionId: string) => `/candidate/api/v1/elections/${electionId}/candidates/active`,
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Common headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const