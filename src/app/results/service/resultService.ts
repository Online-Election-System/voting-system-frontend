import { 
  API_CONFIG, 
  ENDPOINTS, 
  HTTP_STATUS, 
  DEFAULT_HEADERS,
  ApiResponseStatus,
  API_RESPONSE_STATUS,
  DEFAULT_ELECTION_ID
} from '@/app/results/lib/config/api';

// Types matching your Ballerina backend exactly
export interface CandidateTotal {
  candidateId: string;
  Totals: number; // Note: This matches your Ballerina backend exactly (uppercase T)
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
  Ampara: number;
  Anuradhapura: number;
  Badulla: number;
  Batticaloa: number;
  Colombo: number;
  Galle: number;
  Gampaha: number;
  Hambantota: number;
  Jaffna: number;
  Kalutara: number;
  Kandy: number;
  Kegalle: number;
  Kilinochchi: number;
  Kurunegala: number;
  Mannar: number;
  Matale: number;
  Matara: number;
  Monaragala: number;
  Mullaitivu: number;
  NuwaraEliya: number;
  Polonnaruwa: number;
  Puttalam: number;
  Ratnapura: number;
  Trincomalee: number;
  Vavuniya: number;
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

// Generic API response wrapper
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: ApiResponseStatus;
}

// Generic fetch function with retry logic and better error handling
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
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

// Base API service class
export class ResultsService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetchWithRetry(url, options);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text() as Promise<T>;
    } else {
      return response.text() as Promise<T>;
    }
  }

  // ============================================================================
  // CANDIDATE TOTALS AND RANKINGS
  // ============================================================================

  async getCandidateTotals(electionId: string = DEFAULT_ELECTION_ID): Promise<CandidateTotal[]> {
    return this.makeRequest<CandidateTotal[]>(
      ENDPOINTS.RESULTS.CANDIDATE_TOTALS(electionId)
    );
  }

  async updateCandidateTotal(electionId: string, candidateId: string): Promise<any> {
    return this.makeRequest<any>(
      ENDPOINTS.RESULTS.UPDATE_CANDIDATE_TOTAL(electionId, candidateId),
      { method: 'PUT' }
    );
  }

  async batchUpdateTotals(electionId: string = DEFAULT_ELECTION_ID): Promise<any> {
    return this.makeRequest<any>(
      ENDPOINTS.RESULTS.BATCH_UPDATE_TOTALS(electionId),
      { method: 'POST' }
    );
  }

  // ============================================================================
  // CANDIDATE SUMMARIES AND EXPORT
  // ============================================================================

  async getCandidateSummary(electionId: string = DEFAULT_ELECTION_ID): Promise<CandidateVoteSummary[]> {
    return this.makeRequest<CandidateVoteSummary[]>(
      ENDPOINTS.RESULTS.CANDIDATE_SUMMARY(electionId)
    );
  }

  async getCandidateExportData(electionId: string = DEFAULT_ELECTION_ID): Promise<CandidateExportData[]> {
    return this.makeRequest<CandidateExportData[]>(
      ENDPOINTS.RESULTS.CANDIDATE_EXPORT(electionId)
    );
  }

  async getCandidateExportCSV(electionId: string = DEFAULT_ELECTION_ID): Promise<string> {
    const url = `${this.baseUrl}${ENDPOINTS.RESULTS.CANDIDATE_EXPORT_CSV(electionId)}`;
    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    return response.text();
  }

  // ============================================================================
  // DISTRICT ANALYSIS
  // ============================================================================

  async getDistrictAnalysis(electionId: string = DEFAULT_ELECTION_ID): Promise<CandidateDistrictAnalysis[]> {
    return this.makeRequest<CandidateDistrictAnalysis[]>(
      ENDPOINTS.RESULTS.DISTRICT_ANALYSIS(electionId)
    );
  }

  async getDistrictTotals(electionId: string = DEFAULT_ELECTION_ID): Promise<DistrictVoteTotals> {
    return this.makeRequest<DistrictVoteTotals>(
      ENDPOINTS.RESULTS.DISTRICT_TOTALS(electionId)
    );
  }

  async getDistrictWinners(electionId: string = DEFAULT_ELECTION_ID): Promise<DistrictWinnerAnalysis> {
    return this.makeRequest<DistrictWinnerAnalysis>(
      ENDPOINTS.RESULTS.DISTRICT_WINNERS(electionId)
    );
  }

  // ============================================================================
  // ELECTION SUMMARY
  // ============================================================================

  async getElectionSummary(electionId: string = DEFAULT_ELECTION_ID): Promise<ElectionSummary> {
    return this.makeRequest<ElectionSummary>(
      ENDPOINTS.RESULTS.ELECTION_SUMMARY(electionId)
    );
  }

  // ============================================================================
  // SPECIFIC QUERIES
  // ============================================================================

  async getElectionWinner(electionId: string = DEFAULT_ELECTION_ID): Promise<ElectionWinner> {
    return this.makeRequest<ElectionWinner>(
      ENDPOINTS.RESULTS.WINNER(electionId)
    );
  }

  async getTopCandidates(electionId: string, count: number): Promise<CandidateTotal[]>;
  async getTopCandidates(count: number): Promise<CandidateTotal[]>;
  async getTopCandidates(electionIdOrCount: string | number, count?: number): Promise<CandidateTotal[]> {
    if (typeof electionIdOrCount === 'number') {
      // Called with just count, use default election ID
      return this.makeRequest<CandidateTotal[]>(
        ENDPOINTS.RESULTS.TOP_CANDIDATES(DEFAULT_ELECTION_ID, electionIdOrCount)
      );
    } else {
      // Called with electionId and count
      return this.makeRequest<CandidateTotal[]>(
        ENDPOINTS.RESULTS.TOP_CANDIDATES(electionIdOrCount, count!)
      );
    }
  }

  async getCandidateRank(electionId: string, candidateId: string): Promise<CandidateRank> {
    return this.makeRequest<CandidateRank>(
      ENDPOINTS.RESULTS.CANDIDATE_RANK(electionId, candidateId)
    );
  }

  // ============================================================================
  // ADVANCED ANALYTICS
  // ============================================================================

  async getDistributionStatistics(electionId: string = DEFAULT_ELECTION_ID): Promise<DistributionStatistics> {
    return this.makeRequest<DistributionStatistics>(
      ENDPOINTS.RESULTS.DISTRIBUTION_STATS(electionId)
    );
  }

  async getMarginAnalysis(electionId: string = DEFAULT_ELECTION_ID): Promise<MarginAnalysis> {
    return this.makeRequest<MarginAnalysis>(
      ENDPOINTS.RESULTS.MARGIN_ANALYSIS(electionId)
    );
  }

  // ============================================================================
  // ADMIN UTILITIES
  // ============================================================================

  async refreshCalculations(electionId: string = DEFAULT_ELECTION_ID): Promise<any> {
    return this.makeRequest<any>(
      ENDPOINTS.RESULTS.REFRESH_CALCULATIONS(electionId),
      { method: 'POST' }
    );
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // ============================================================================

  /**
   * Get comprehensive election results including winner, totals, and summary
   */
  async getElectionResults(electionId: string = DEFAULT_ELECTION_ID) {
    try {
      const [summary, winner, totals] = await Promise.all([
        this.getElectionSummary(electionId),
        this.getElectionWinner(electionId),
        this.getCandidateTotals(electionId),
      ]);

      return {
        summary,
        winner,
        candidateTotals: totals,
        electionId
      };
    } catch (error) {
      throw new Error(`Failed to get comprehensive election results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all district-related data in one call
   */
  async getDistrictData(electionId: string = DEFAULT_ELECTION_ID) {
    try {
      const [totals, winners, analysis] = await Promise.all([
        this.getDistrictTotals(electionId),
        this.getDistrictWinners(electionId),
        this.getDistrictAnalysis(electionId)
      ]);

      return {
        totals,
        winners,
        analysis,
        electionId
      };
    } catch (error) {
      throw new Error(`Failed to get district data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all analytics data in one call
   */
  async getAnalyticsData(electionId: string = DEFAULT_ELECTION_ID) {
    try {
      const [distribution, margins] = await Promise.all([
        this.getDistributionStatistics(electionId),
        this.getMarginAnalysis(electionId)
      ]);

      return {
        distribution,
        margins,
        electionId
      };
    } catch (error) {
      throw new Error(`Failed to get analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Default instance with PRE_2024 as default election
export const resultsService = new ResultsService();

// Export for individual function usage
export default resultsService;

// Helper functions for common operations
export const getElectionResults = (electionId: string = DEFAULT_ELECTION_ID) => 
  resultsService.getElectionResults(electionId);

export const getDistrictData = (electionId: string = DEFAULT_ELECTION_ID) => 
  resultsService.getDistrictData(electionId);

export const getAnalyticsData = (electionId: string = DEFAULT_ELECTION_ID) => 
  resultsService.getAnalyticsData(electionId);