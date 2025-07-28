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
  startTime: string // maps to start_time in DB, time:Date in backend
  endTime: string // maps to end_time in DB, time:Date in backend
  enrolDdl: string // maps to enrol_ddl in DB, time:Date in backend
  endDate: string // maps to end_date in DB, time:Date in backend
  noOfCandidates: number // maps to no_of_candidates in DB
}

// Complete Vote type (matches backend exactly)
export interface Vote {
  id: string // readonly in backend
  voterId: string // maps to voter_id in DB
  electionId: string // maps to election_id in DB
  candidateId: string // maps to candidate_id in DB
  district: string
  timestamp: string
}

// Vote request payload (without readonly id field - for sending to backend)
export interface VoteRequest {
  voterId: string
  electionId: string
  candidateId: string
  district: string
  timestamp: string
}

// Backend Candidate type (matches your Ballerina structure) - UPDATED: Removed position
export interface BackendCandidate {
  candidateId: string
  electionId: string
  candidateName: string
  partyName: string
  partySymbol?: string
  partyColor: string
  candidateImage?: string
  popularVotes: number
  electoralVotes: number
  isActive: boolean
}

// Frontend Candidate type (for display compatibility) - UPDATED: Removed position
export interface Candidate {
  candidateId: string
  electionId: string
  candidateName: string
  partyName: string
  partySymbol?: string
  partyColor: string
  candidateImage?: string
  popularVotes: number
  electoralVotes: number
  isActive: boolean
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

// Vote casting request payload (what the UI component passes)
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

// NEW: Enrollment-related types
export interface EnrollmentStatus {
  voterId: string
  electionId: string
  isEnrolled: boolean
}

export interface VotingEligibility {
  voterId: string
  electionId: string
  isEnrolled: boolean
  alreadyVoted: boolean
  eligible: boolean
}

export interface EnrolledCandidate extends Candidate {
  enrolledVotes?: number // Vote count from EnrolCandidates table
}