// Types matching the backend Ballerina schema for election results

import { Key } from "react"

// ChiefOccupant type (matches backend exactly)
export interface ChiefOccupant {
  id: string // readonly in backend
  fullName: string // maps to full_name in DB
  nic: string
  phoneNumber?: string | null // maps to phone_number in DB
  dob: string // Format: MM/DD/YYYY
  gender: string // Male/Female
  civilStatus: string // maps to civil_status in DB
  passwordHash: string // maps to password_hash in DB
  email: string
  idCopyPath?: string | null // maps to id_copy_path in DB
  role: string
}

// HouseholdDetails type (matches backend exactly)
export interface HouseholdDetails {
  id: string // readonly in backend
  chiefOccupantId: string // maps to chief_occupant_id in DB
  electoralDistrict: string // maps to electoral_district in DB
  pollingDivision: string // maps to polling_division in DB
  pollingDistrictNumber: string // maps to polling_district_number in DB
  gramaNiladhariDivision?: string | null // maps to grama_niladhari_division in DB
  villageStreetEstate?: string | null // maps to village_street_estate in DB
  houseNumber?: string | null // maps to house_number in DB
  householdMemberCount: number // maps to household_member_count in DB
}

// HouseholdMembers type (matches backend exactly)
export interface HouseholdMembers {
  id: string // readonly in backend
  chiefOccupantId: string // maps to chief_occupant_id in DB
  fullName: string // maps to full_name in DB
  nic?: string | null
  dob: string // Format: MM/DD/YYYY
  gender: string // Male/Female
  civilStatus: string // maps to civil_status in DB
  relationshipWithChiefOccupant: string // maps to relationship_with_chief_occupant in DB
  idCopyPath?: string | null // maps to id_copy_path in DB
  approvedByChief: boolean // maps to approved_by_chief in DB
  passwordHash: string // maps to Hased_password in DB (note: typo in original schema)
  passwordchanged: boolean
  role: string
}

// Election type (matches backend exactly)
export interface Election {
  id: string // readonly in backend
  electionName: string // maps to election_name in DB
  description: string
  startDate: string // time:Date in backend, using string in frontend
  enrolDdl: string // maps to enrol_ddl in DB, time:Date in backend
  electionDate: string // maps to election_date in DB, time:Date in backend
  endDate: string // maps to end_date in DB, time:Date in backend
  noOfCandidates: number // maps to no_of_candidates in DB
  electionType: string // maps to election_type in DB
  startTime: string // time:TimeOfDay in backend, using string in frontend
  endTime: string // maps to end_time in DB, time:TimeOfDay in backend
  status: string // Scheduled / Upcoming / Active / Completed / Cancelled
}

// AdminUsers type (matches backend exactly)
export interface AdminUsers {
  id: string // readonly in backend
  username: string
  email: string
  passwordHash: string // maps to password_hash in DB
  role: string
  createdAt: string // maps to created_at in DB, time:Utc in backend
  isActive: boolean // maps to is_active in DB
}

// Vote type (matches backend exactly)
export interface Vote {
  id: string // readonly in backend
  voterId: string // maps to voter_id in DB
  electionId: string // maps to election_id in DB
  candidateId: string // maps to candidate_id in DB
  timestamp: string
  district: string
}

// Vote request payload (without readonly id field)
export interface VoteRequest {
  voterId: string
  electionId: string
  candidateId: string
  timestamp: string
  district: string
}

// Candidate type (matches backend exactly)
export interface Candidate {
  candidateId: string // maps to candidate_id in DB, readonly in backend
  electionId: string // maps to election_id in DB
  candidateName: string // maps to candidate_name in DB
  partyName: string // maps to party_name in DB
  partySymbol?: string | null // maps to party_symbol in DB
  partyColor: string // maps to party_color in DB
  candidateImage?: string | null // maps to candidate_image in DB
  popularVotes?: number | null // maps to popular_votes in DB
  electoralVotes?: number | null // maps to electoral_votes in DB
  position?: number | null
  isActive: boolean // maps to is_active in DB
}

// DistrictResult type (matches backend exactly)
export interface DistrictResult {
  districtCode: string // maps to district_code in DB, readonly in backend
  electionId: string // maps to election_id in DB, readonly in backend
  districtName: string // maps to district_name in DB
  totalVotes: number // maps to total_votes in DB
  votesProcessed: number // maps to votes_processed in DB
  winner?: string | null
  status: string
}

// ElectionSummary type (matches backend exactly)
export interface ElectionSummary {
  electionId: string // maps to election_id in DB, readonly in backend
  totalRegisteredVoters: number // maps to total_registered_voters in DB
  totalVotesCast: number // maps to total_votes_cast in DB
  totalRejectedVotes: number // maps to total_rejected_votes in DB
  turnoutPercentage: number // decimal in backend, using number in frontend
  winnerCandidateId?: string | null // maps to winner_candidate_id in DB
  electionStatus: string // maps to election_status in DB
}

// District type (matches backend exactly)
export interface District {
  districtId: string // maps to district_id in DB, readonly in backend
  provinceId: string // maps to province_id in DB
  districtName: string // maps to district_name in DB
  totalVoters: number // maps to total_voters in DB
}

// ProvinceResult type (matches backend exactly)
export interface ProvinceResult {
  provinceId: string // maps to province_id in DB, readonly in backend
  provinceName: string // maps to province_name in DB
  totalDistricts: number // maps to total_districts in DB
}

// Extended types for frontend usage
export interface CandidateWithResults extends Candidate {
  voteCount?: number
  percentage?: number
  rank?: number
}

export interface DistrictResultWithDetails extends DistrictResult {
  candidates?: CandidateWithResults[]
  turnoutPercentage?: number
  lastUpdated?: string
}

export interface ElectionResultsOverview {
  election: Election
  summary: ElectionSummary
  districtResults: DistrictResultWithDetails[]
  topCandidates: CandidateWithResults[]
}

// Real-time results types
export interface LiveResultsUpdate {
  electionId: string
  districtCode?: string
  candidateId?: string
  newVoteCount: number
  timestamp: string
  updateType: 'vote_count' | 'district_complete' | 'winner_declared'
}

export interface ResultsFilter {
  electionId?: string
  districtCode?: string
  candidateId?: string
  status?: string
  electionType?: string
}

// API Response types for results
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

// Results-specific API types
export interface ResultsApiResponse extends ApiResponse<ElectionResultsOverview> {}

export interface DistrictResultsApiResponse extends ApiResponse<DistrictResultWithDetails[]> {}

export interface ElectionSummaryApiResponse extends ApiResponse<ElectionSummary> {}

// Vote counting and validation types
export interface VoteValidationResult {
  voteId: string
  isValid: boolean
  rejectionReason?: string
  validatedAt: string
}

export interface BulkVoteProcessingResult {
  totalProcessed: number
  validVotes: number
  rejectedVotes: number
  errors: string[]
  processingTime: number
}

// Results dashboard types
export interface ResultsDashboardData {
  elections: Election[]
  activeElection?: Election
  recentResults: DistrictResult[]
  systemStats: {
    totalVoters: number
    totalVotesCast: number
    activeElections: number
    completedElections: number
  }
}

export interface TransformedCandidate {
  candidateId: string;  // null, undefined හරිම අවස්ථාවල නෙමෙයි, string දාල හොඳයි
  image: string;
  id: string;
  name: string;
  party: string;
  popularVotes: number;
  color: string;
  electoralVotes?: number;
  isWinner?: boolean;
}






