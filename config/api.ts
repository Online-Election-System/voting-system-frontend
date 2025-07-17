// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/vote/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

// API Endpoints
export const ENDPOINTS = {
  VOTES: {
    CAST: '/votes/cast',
    BY_ELECTION: (electionId: string) => `/votes/election/${electionId}`,
    BY_VOTER: (voterId: string) => `/votes/voter/${voterId}`,
    BY_ELECTION_AND_DISTRICT: (electionId: string, district: string) => 
      `/votes/election/${electionId}/district/${encodeURIComponent(district)}`,
  },
  VOTERS: {
    VALIDATE: '/voters/validate',
    PROFILE: (voterId: string) => `/voters/${voterId}`,
  },
  ELECTIONS: {
    ACTIVE: '/elections/active',
    BY_ID: (electionId: string) => `/elections/${electionId}`,
  },
  CANDIDATES: {
    BY_ELECTION: (electionId: string) => `/candidates/election/${electionId}`,
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