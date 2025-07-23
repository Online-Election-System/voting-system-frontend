import { useState, useEffect, useCallback } from 'react';
import { 
  API_CONFIG, 
  ENDPOINTS, 
  HTTP_STATUS, 
  DEFAULT_HEADERS,
  ApiResponseStatus,
  API_RESPONSE_STATUS 
} from '../service/resultService'; // Update the path if your constants file is in the parent directory


// Types based on your Ballerina service
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
}

export interface DistrictResult {
  id: string;
  electionId: string;
  districtCode: string;
  candidateId: string;
  votesReceived: number;
  winner?: string;
}

export interface Province {
  id: string;
  provinceName: string;
  totalVotes: number;
  registeredVoters: number;
}

export interface District {
  id: string;
  districtName: string;
  provinceId: string;
}

export interface ElectionSummary {
  electionId: string;
  totalVotesCast: number;
  turnoutPercentage: number;
  winnerCandidateId?: string;
  electionStatus: string;
}

export interface ElectionSummaryResponse {
  electionId: string;
  electionName: string;
  totalVotes: number;
  lastUpdated: string;
  candidates: Candidate[];
  districts: DistrictResult[];
  statistics: ElectionSummary;
  provinces?: ProvinceAnalysis[];
  partySummaries?: PartySummary[];
}

export interface ProvinceAnalysis {
  provinceName: string;
  totalVotes: number;
  registeredVoters: number;
  turnoutPercentage: number;
  winningCandidateId: string;
  districts: DistrictResult[];
}

export interface PartySummary {
  partyName: string;
  partyColor: string;
  candidates: Candidate[];
  totalElectoralVotes: number;
  totalPopularVotes: number;
  popularVotePercentage: number;
  districtsWon: number;
}

export interface CandidateMetrics {
  candidateId: string;
  candidateName: string;
  totalVotes: number;
  voteShare: number;
  districtsWon: number;
  position: number;
  strongestDistrict: string;
  weakestDistrict: string;
}

export interface VictoryMargin {
  marginType: string;
  margin: number;
  votes: number;
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

// Generic fetch function with retry logic
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT as number),
    });
    if (!response.ok && retries > 0 && response.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
// Generic API hook
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
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

// Election Hooks

export const useElectionSummary = (electionId: string) => {
  return useApi<ElectionSummaryResponse>(
    ENDPOINTS.ELECTIONS.SUMMARY(electionId),
    {},
    [electionId]
  );
};

export const useElection = (electionId: string) => {
  return useApi<Election>(
    ENDPOINTS.ELECTIONS.BY_ID(electionId),
    {},
    [electionId]
  );
};

export const useElectionWinner = (electionId: string) => {
  return useApi<Candidate>(
    ENDPOINTS.ELECTIONS.WINNER(electionId),
    {},
    [electionId]
  );
};

export const useElectionPopularWinner = (electionId: string) => {
  return useApi<Candidate>(
    ENDPOINTS.ELECTIONS.POPULAR_WINNER(electionId),
    {},
    [electionId]
  );
};

export const useElectionMargin = (electionId: string) => {
  return useApi<VictoryMargin>(
    ENDPOINTS.ELECTIONS.MARGIN(electionId),
    {},
    [electionId]
  );
};

export const useElectionParties = (electionId: string) => {
  return useApi<PartySummary[]>(
    ENDPOINTS.ELECTIONS.PARTIES(electionId),
    {},
    [electionId]
  );
};

export const useElectionSummaryStats = (electionId: string) => {
  return useApi<ElectionSummary>(
    ENDPOINTS.ELECTIONS.SUMMARY_STATS(electionId),
    {},
    [electionId]
  );
};

export const useElectionDistricts = (electionId: string) => {
  return useApi<DistrictResult[]>(
    ENDPOINTS.ELECTIONS.DISTRICTS(electionId),
    {},
    [electionId]
  );
};

// Candidate Hooks

export const useCandidatesByElection = (electionId: string) => {
  return useApi<Candidate[]>(
    ENDPOINTS.CANDIDATES.BY_ELECTION(electionId),
    {},
    [electionId]
  );
};

export const useCandidate = (candidateId: string) => {
  return useApi<Candidate>(
    ENDPOINTS.CANDIDATES.BY_ID(candidateId),
    {},
    [candidateId]
  );
};

export const useCandidateMetrics = (candidateId: string) => {
  return useApi<CandidateMetrics>(
    ENDPOINTS.CANDIDATES.METRICS(candidateId),
    {},
    [candidateId]
  );
};

// District Hooks

export const useDistricts = () => {
  return useApi<District[]>(ENDPOINTS.DISTRICTS.ALL);
};

export const useDistrict = (districtId: string) => {
  return useApi<District>(
    ENDPOINTS.DISTRICTS.BY_ID(districtId),
    {},
    [districtId]
  );
};

export const useDistrictResults = (districtId: string) => {
  return useApi<DistrictResult[]>(
    ENDPOINTS.DISTRICTS.RESULTS(districtId),
    {},
    [districtId]
  );
};

// Province Hooks

export const useProvinces = () => {
  return useApi<Province[]>(ENDPOINTS.PROVINCES.ALL);
};

export const useProvince = (provinceId: string) => {
  return useApi<Province>(
    ENDPOINTS.PROVINCES.BY_ID(provinceId),
    {},
    [provinceId]
  );
};

export const useProvinceDistricts = (provinceId: string) => {
  return useApi<District[]>(
    ENDPOINTS.PROVINCES.DISTRICTS(provinceId),
    {},
    [provinceId]
  );
};

// Voting Hooks

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

// Voter Hooks

export const useVoter = (voterId: string) => {
  return useApi<Voter>(
    ENDPOINTS.VOTERS.PROFILE(voterId),
    {},
    [voterId]
  );
};

// Mutation Hooks (for POST/PUT operations)

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
        throw new Error(`Failed to cast vote: ${response.statusText}`);
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
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.VOTERS.LOGIN}`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
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
      const response = await fetchWithRetry(`${API_CONFIG.BASE_URL}${ENDPOINTS.VOTERS.REGISTER}`, {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
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