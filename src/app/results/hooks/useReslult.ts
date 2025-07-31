import { useState, useEffect, useCallback } from 'react';
import { 
  API_CONFIG, 
  ENDPOINTS,  
  DEFAULT_HEADERS,
  ApiResponseStatus,
  API_RESPONSE_STATUS,
  DEFAULT_ELECTION_ID
} from '../lib/config/api';

// Import types from the result service
export interface CandidateTotal {
  candidateId: string;
  Totals: number; // Note: Uppercase T to match Ballerina backend exactly
}

export interface CandidateVoteSummary {
  candidateId: string;
  candidateName?: string | null; // Updated to handle null values from backend  
  totalVotes: number;
  percentage: number;
  rank: number;
}

export interface CandidateExportData {
  candidateId: string;
  candidateImage?: string | null;
  position: number;
  candidateName: string;
  partyName: string;
  partyColor: string;
  totalVotes: number;
  percentage: number;
  districtsWon: number;
  partySymbol?: string | null;
  isActive: boolean;
}

export interface CandidateDistrictAnalysis {
  candidateId: string;
  candidateName?: string | null;
  districtVotes: Record<string, number>;
  districtPercentages: Record<string, number>;
  totalVotes: number;
}

export interface DistrictVoteTotals {
  electionId: string;
  [key: string]: number | string; // For district names and values
  GrandTotal: number;
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

// Election and candidate types for other services
export interface Election {
  id: string;
  electionName: string;
  electionDate: string;
  status: string;
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

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: ApiResponseStatus;
}

// Enhanced fetch function with better timeout and error handling
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT as number);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok && retries > 0 && response.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Generic API hook with better error handling
const useApi = <T>(
  endpoint: string,
  options: RequestInit = {},
  dependencies: any[] = []
): ApiState<T> & { refetch: () => void } => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    status: API_RESPONSE_STATUS.LOADING,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        status: API_RESPONSE_STATUS.ERROR,
      });
    }
  }, [endpoint, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch };
};

// ============================================================================
// RESULTS SERVICE HOOKS - UPDATED WITH DEFAULT ELECTION ID
// ============================================================================

// Candidate totals and rankings
export const useCandidateTotals = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateTotal[]>(
    ENDPOINTS.RESULTS.CANDIDATE_TOTALS(electionId),
    {},
    [electionId]
  );
};

export const useCandidateSummary = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateVoteSummary[]>(
    ENDPOINTS.RESULTS.CANDIDATE_SUMMARY(electionId),
    {},
    [electionId]
  );
};

export const useCandidateExportData = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateExportData[]>(
    ENDPOINTS.RESULTS.CANDIDATE_EXPORT(electionId),
    {},
    [electionId]
  );
};

// District analysis
export const useDistrictAnalysis = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateDistrictAnalysis[]>(
    ENDPOINTS.RESULTS.DISTRICT_ANALYSIS(electionId),
    {},
    [electionId]
  );
};

export const useDistrictTotals = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<DistrictVoteTotals>(
    ENDPOINTS.RESULTS.DISTRICT_TOTALS(electionId),
    {},
    [electionId]
  );
};

export const useDistrictWinners = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<DistrictWinnerAnalysis>(
    ENDPOINTS.RESULTS.DISTRICT_WINNERS(electionId),
    {},
    [electionId]
  );
};

// Election summary
export const useElectionSummary = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<ElectionSummary>(
    ENDPOINTS.RESULTS.ELECTION_SUMMARY(electionId),
    {},
    [electionId]
  );
};

// Specific queries
export const useElectionWinner = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<ElectionWinner>(
    ENDPOINTS.RESULTS.WINNER(electionId),
    {},
    [electionId]
  );
};

export const useTopCandidates = (count: number, electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateTotal[]>(
    ENDPOINTS.RESULTS.TOP_CANDIDATES(electionId, count),
    {},
    [electionId, count]
  );
};

export const useCandidateRank = (candidateId: string, electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<CandidateRank>(
    ENDPOINTS.RESULTS.CANDIDATE_RANK(electionId, candidateId),
    {},
    [electionId, candidateId]
  );
};

// Advanced analytics
export const useDistributionStatistics = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<DistributionStatistics>(
    ENDPOINTS.RESULTS.DISTRIBUTION_STATS(electionId),
    {},
    [electionId]
  );
};

export const useMarginAnalysis = (electionId: string = DEFAULT_ELECTION_ID) => {
  return useApi<MarginAnalysis>(
    ENDPOINTS.RESULTS.MARGIN_ANALYSIS(electionId),
    {},
    [electionId]
  );
};

// ============================================================================
// ELECTION SERVICE HOOKS
// ============================================================================

export const useElections = () => {
  return useApi<Election[]>(ENDPOINTS.ELECTIONS.ALL);
};

export const useElection = (electionId: string) => {
  return useApi<Election>(
    ENDPOINTS.ELECTIONS.BY_ID(electionId),
    {},
    [electionId]
  );
};

export const useVoterElections = (voterId: string) => {
  return useApi<Election[]>(
    ENDPOINTS.ELECTIONS.VOTER_ELECTIONS(voterId),
    {},
    [voterId]
  );
};

export const useVoterEnrollment = (voterId: string, electionId: string) => {
  return useApi<any>(
    ENDPOINTS.ELECTIONS.VOTER_ENROLLED(voterId, electionId),
    {},
    [voterId, electionId]
  );
};

// ============================================================================
// CANDIDATE SERVICE HOOKS
// ============================================================================

export const useCandidates = (activeOnly?: boolean) => {
  const endpoint = activeOnly 
    ? `${ENDPOINTS.CANDIDATES.ALL}?activeOnly=true`
    : ENDPOINTS.CANDIDATES.ALL;
  
  return useApi<Candidate[]>(endpoint, {}, [activeOnly]);
};

export const useCandidate = (candidateId: string) => {
  return useApi<Candidate>(
    ENDPOINTS.CANDIDATES.BY_ID(candidateId),
    {},
    [candidateId]
  );
};

export const useCandidatesByElection = (electionId: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.BY_ELECTION(electionId),
    {},
    [electionId]
  );
};

export const useActiveCandidatesByElection = (electionId: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.ACTIVE_BY_ELECTION(electionId),
    {},
    [electionId]
  );
};

export const useCandidatesForVoter = (voterId: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.FOR_VOTER(voterId),
    {},
    [voterId]
  );
};

export const useCandidatesForVoterElection = (voterId: string, electionId: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.FOR_VOTER_ELECTION(voterId, electionId),
    {},
    [voterId, electionId]
  );
};

export const useCandidatesByParty = (partyName: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.BY_PARTY(partyName),
    {},
    [partyName]
  );
};

export const useCandidateActive = (candidateId: string) => {
  return useApi<boolean>(
    ENDPOINTS.CANDIDATES.IS_ACTIVE(candidateId),
    {},
    [candidateId]
  );
};

// ============================================================================
// VOTING SERVICE HOOKS
// ============================================================================

export const useVotesByElection = (electionId: string) => {
  return useApi<Vote[]>(
    ENDPOINTS.VOTES.BY_ELECTION(electionId),
    {},
    [electionId]
  );
};

export const useVotesByVoter = (voterId: string) => {
  return useApi<Vote[]>(
    ENDPOINTS.VOTES.BY_VOTER(voterId),
    {},
    [voterId]
  );
};

export const useVotesByElectionAndDistrict = (electionId: string, district: string) => {
  return useApi<Vote[]>(
    ENDPOINTS.VOTES.BY_ELECTION_AND_DISTRICT(electionId, district),
    {},
    [electionId, district]
  );
};

export const useVotingEligibility = (voterId: string, electionId: string) => {
  return useApi<any>(
    ENDPOINTS.VOTES.ELIGIBILITY(voterId, electionId),
    {},
    [voterId, electionId]
  );
};

export const useVotesByHousehold = (chiefOccupantId: string, electionId: string) => {
  return useApi<Vote[]>(
    ENDPOINTS.VOTES.BY_HOUSEHOLD(chiefOccupantId, electionId),
    {},
    [chiefOccupantId, electionId]
  );
};

// ============================================================================
// VOTER REGISTRATION HOOKS
// ============================================================================

export const useVoterProfile = (voterId: string) => {
  return useApi<any>(
    ENDPOINTS.VOTER_REGISTRATION.PROFILE(voterId),
    {},
    [voterId]
  );
};

export const useVoterRegistrationElections = (voterId: string) => {
  return useApi<Election[]>(
    ENDPOINTS.VOTER_REGISTRATION.VOTER_ELECTIONS(voterId),
    {},
    [voterId]
  );
};

// ============================================================================
// MUTATION HOOKS (for POST/PUT operations)
// ============================================================================

export const useUpdateCandidateTotal = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const updateTotal = useCallback(async (electionId: string, candidateId: string) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.RESULTS.UPDATE_CANDIDATE_TOTAL(electionId, candidateId)}`,
        { method: 'PUT' }
      );
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to update candidate total: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update candidate total',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, updateTotal };
};

export const useBatchUpdateTotals = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const batchUpdate = useCallback(async (electionId: string = DEFAULT_ELECTION_ID) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.RESULTS.BATCH_UPDATE_TOTALS(electionId)}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to batch update totals: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to batch update totals',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, batchUpdate };
};

export const useRefreshCalculations = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const refreshCalculations = useCallback(async (electionId: string = DEFAULT_ELECTION_ID) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.RESULTS.REFRESH_CALCULATIONS(electionId)}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to refresh calculations: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh calculations',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, refreshCalculations };
};

export const useCastVote = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const castVote = useCallback(async (voteData: {
    voterId: string;
    electionId: string;
    candidateId: string;
    districtCode: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.VOTES.CAST}`, {
        method: 'POST',
        body: JSON.stringify(voteData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to cast vote: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to cast vote',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, castVote };
};

export const useVoterLogin = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.VOTER_REGISTRATION.LOGIN}`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, login };
};

export const useVoterRegistration = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const register = useCallback(async (registrationData: {
    name: string;
    email: string;
    password: string;
    district: string;
    province: string;
  }) => {      
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.VOTER_REGISTRATION.REGISTER}`, {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Registration failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, register };
};

export const useCreateElection = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const createElection = useCallback(async (electionData: any) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.ELECTIONS.CREATE}`, {
        method: 'POST',
        body: JSON.stringify(electionData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create election: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create election',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, createElection };
};

export const useCreateCandidate = () => {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
    status: API_RESPONSE_STATUS.SUCCESS,
  });

  const createCandidate = useCallback(async (candidateData: any) => {
    setState(prev => ({ ...prev, loading: true, status: API_RESPONSE_STATUS.LOADING }));
    
    try {
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.CANDIDATES.CREATE}`, {
        method: 'POST',
        body: JSON.stringify(candidateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create candidate: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setState({
        data,
        loading: false,
        error: null,
        status: API_RESPONSE_STATUS.SUCCESS,
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create candidate',
        status: API_RESPONSE_STATUS.ERROR,
      });
      throw error;
    }
  }, []);

  return { ...state, createCandidate };
};

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Hook to get comprehensive election results
 */
export const useElectionResults = (electionId: string = DEFAULT_ELECTION_ID) => {
  const summary = useElectionSummary(electionId);
  const winner = useElectionWinner(electionId);
  const totals = useCandidateTotals(electionId);
  
  return {
    summary,
    winner,
    totals,
    loading: summary.loading || winner.loading || totals.loading ,
    error: summary.error || winner.error || totals.error ,
    refetch: () => {
      summary.refetch();
      winner.refetch();
      totals.refetch();
    }
  };
};

/**
 * Hook to get all district data
 */
export const useDistrictData = (electionId: string = DEFAULT_ELECTION_ID) => {
  const totals = useDistrictTotals(electionId);
  const winners = useDistrictWinners(electionId);
  const analysis = useDistrictAnalysis(electionId);

  return {
    totals,
    winners,
    analysis,
    loading: totals.loading || winners.loading || analysis.loading,
    error: totals.error || winners.error || analysis.error,
    refetch: () => {
      totals.refetch();
      winners.refetch();
      analysis.refetch();
    }
  };
};

/**
 * Hook to get all analytics data
 */
export const useAnalyticsData = (electionId: string = DEFAULT_ELECTION_ID) => {
  const distribution = useDistributionStatistics(electionId);
  const margins = useMarginAnalysis(electionId);

  return {
    distribution,
    margins,
    loading: distribution.loading || margins.loading,
    error: distribution.error || margins.error,
    refetch: () => {
      distribution.refetch();
      margins.refetch();
    }
  };
};