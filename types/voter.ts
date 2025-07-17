// Types matching the backend Ballerina schema exactly

export interface Voter {
  id: string // readonly in backend
  nationalId: string // maps to national_id in DB
  fullName: string // maps to full_name in DB
  mobileNumber?: string | null // maps to mobile_number in DB
  dob?: string | null // Format: MM/DD/YYYY
  gender?: string | null // Male/Female
  nicChiefOccupant?: string | null // maps to nic_chief_occupant in DB
  address?: string | null
  district: string
  householdNo?: string | null // maps to household_no in DB
  gramaNiladhari?: string | null // maps to grama_niladhari in DB
  password: string
}

export interface Election {
  id: string // readonly in backend
  electionName: string // maps to election_name in DB
  description: string
  startDate: string // time:Date in backend, but we'll use string in frontend
  enrolDdl: string // maps to enrol_ddl in DB, time:Date in backend
  endDate: string // maps to end_date in DB, time:Date in backend
  noOfCandidates: number // maps to no_of_candidates in DB
}

export interface Vote {
  id: string // readonly in backend
  voterId: string // maps to voter_id in DB
  electionId: string // maps to election_id in DB
  candidateId: string // maps to candidate_id in DB
  district: string
  timestamp: string
}

export interface Election {
  id: string
  electionName: string
  description: string
  startDate: string // ISO date string
  enrolDdl: string // ISO date string
  endDate: string // ISO date string
  noOfCandidates: number
  candidateId: string
}

export interface Vote {
  id: string
  voterId: string
  electionId: string
  candidateId: string
  district: string
  timestamp: string
}

// Frontend-specific types
export interface Candidate {
  electionId: string // Changed from 'any' to 'string' for better type safety
  id: string
  nameEn: string
  symbol: string
  symbolName: string
  party?: string
}

export interface VoterProfile extends Voter {
  status: 'eligible' | 'already-voted' | 'ineligible'
  photo?: string
  votedAt?: string
  ineligibleReason?: string
  // Computed fields for display
  age?: number
  nameWithInitials?: string
  pollingDivision?: string
}

export type ValidationStatus = 'idle' | 'checking' | 'found' | 'not-found'

export type Screen = 'validation' | 'voting' | 'confirmation' | 'success'

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: number
  details?: string
}

// Vote casting request payload
export interface VoteCastRequest {
  voterId: string
  electionId: string
  candidateId: string
  district: string
}

// Vote result response
export interface VoteResult {
  voteId: string
  timestamp: string
  success: boolean
}