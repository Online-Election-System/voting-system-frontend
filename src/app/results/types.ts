export interface ElectionSummaryResponse {
  electionYear: number
  totalVotes: number
  lastUpdated: string
  candidates: {
    candidateId: string
    candidateName: string
    partyName: string
    electoralVotes: number
    popularVotes: number
    candidateImage?: string
    partyColor?: string
  }[]
  districts: {
    districtId: string
    districtName: string
    winningCandidateId: string
    totalVotes: number
  }[]
  statistics: {
    totalRegisteredVoters: number
    totalVotesCast: number
    turnoutPercentage: number
    electionStatus: string
  }
}

export interface TransformedCandidate {
  id: string
  name: string
  party: string
  electoralVotes: number
  popularVotes: number
  image: string
  color: string
}
