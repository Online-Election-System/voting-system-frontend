// service/resultService.ts
// Service layer for election results API calls - No default election ID

import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  validateElectionId,
  ERROR_MESSAGES,
  HTTP_STATUS,
  debugLog,
  errorLog,
  DEFAULT_HEADERS,
} from '../lib/config/api';

import type {
  CandidateExportData,
  CandidateTotal,
  CandidateVoteSummary,
  CandidateDistrictAnalysis,
  DistrictVoteTotals,
  DistrictWinnerAnalysis,
  ElectionSummary,
  DistributionStatistics,
  MarginAnalysis,
  CandidateRank,
  ElectionWinner,
  BackendCandidateTotal,
  BackendDistrictVoteTotals,
} from '../types';

// Generic API response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Retry configuration
interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: API_CONFIG.RETRY_ATTEMPTS,
  delay: API_CONFIG.RETRY_DELAY,
  backoff: true,
};

// Base fetch wrapper with retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    signal: controller.signal,
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
    try {
      debugLog(`Attempting request to ${url} (attempt ${attempt}/${retryConfig.attempts})`);

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      debugLog(`Response status: ${response.status} for ${url}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        errorLog(`HTTP Error ${response.status} for ${url}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      debugLog(`Request successful for ${url}`, data);

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      lastError = error as Error;
      errorLog(`Request failed for ${url} (attempt ${attempt}):`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // Don't retry on the last attempt
      if (attempt === retryConfig.attempts) {
        break;
      }

      // Calculate delay with optional backoff
      const delay = retryConfig.backoff 
        ? retryConfig.delay * Math.pow(2, attempt - 1) 
        : retryConfig.delay;

      debugLog(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  clearTimeout(timeoutId);

  // Handle specific error types
  let errorMessage: string = ERROR_MESSAGES.SERVER_ERROR;
  if (lastError) {
    if (lastError.name === 'AbortError') {
      errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (lastError.message.includes('fetch')) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  return {
    error: errorMessage,
    status: 0,
  };
}

// CANDIDATE SERVICES - Now require election ID validation

export const candidateService = {
  // Get candidate totals (sorted by votes)
  async getCandidateTotals(electionId: string): Promise<ApiResponse<BackendCandidateTotal[]>> {
    debugLog('Getting candidate totals for election:', electionId);
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.CANDIDATE_TOTALS(validElectionId));
    debugLog('Built URL for candidate totals:', url);
    return fetchWithRetry<BackendCandidateTotal[]>(url);
  },

  // Get comprehensive candidate export data
  async getCandidateExportData(electionId: string): Promise<ApiResponse<CandidateExportData[]>> {
    debugLog('Getting candidate export data for election:', electionId);
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.CANDIDATE_EXPORT(validElectionId));
    debugLog('Built URL for candidate export:', url);
    return fetchWithRetry<CandidateExportData[]>(url);
  },

  // Get candidate data as CSV
  async getCandidateExportCSV(electionId: string): Promise<ApiResponse<string>> {
    debugLog('Getting candidate CSV for election:', electionId);
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.CANDIDATE_EXPORT_CSV(validElectionId));
    debugLog('Built URL for candidate CSV:', url);
    return fetchWithRetry<string>(url);
  },

  // Get top N candidates
  async getTopCandidates(count: number, electionId: string): Promise<ApiResponse<BackendCandidateTotal[]>> {
    debugLog('Getting top candidates for election:', { electionId, count });
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.CANDIDATE_TOP(validElectionId, count));
    debugLog('Built URL for top candidates:', url);
    return fetchWithRetry<BackendCandidateTotal[]>(url);
  },

  // Get candidate rank
  async getCandidateRank(candidateId: string, electionId: string): Promise<ApiResponse<CandidateRank>> {
    debugLog('Getting candidate rank:', { candidateId, electionId });
    const validElectionId = validateElectionId(electionId);
    if (!candidateId) throw new Error('Candidate ID is required');
    const url = buildApiUrl(API_ENDPOINTS.CANDIDATE_RANK(validElectionId, candidateId));
    debugLog('Built URL for candidate rank:', url);
    return fetchWithRetry<CandidateRank>(url);
  },

  // Batch update candidate totals
  async batchUpdateTotals(electionId: string): Promise<ApiResponse<{ message: string }>> {
    debugLog('Batch updating totals for election:', electionId);
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.BATCH_UPDATE_TOTALS(validElectionId));
    debugLog('Built URL for batch update:', url);
    return fetchWithRetry<{ message: string }>(url, {
      method: 'POST',
    });
  },
};

// DISTRICT SERVICES - Now require election ID validation

export const districtService = {
  // Get district-wise analysis
  async getDistrictAnalysis(electionId: string): Promise<ApiResponse<CandidateDistrictAnalysis[]>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.DISTRICT_ANALYSIS(validElectionId));
    return fetchWithRetry<CandidateDistrictAnalysis[]>(url);
  },

  // Get district vote totals
  async getDistrictTotals(electionId: string): Promise<ApiResponse<BackendDistrictVoteTotals>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.DISTRICT_TOTALS(validElectionId));
    return fetchWithRetry<BackendDistrictVoteTotals>(url);
  },

  // Get district winners analysis
  async getDistrictWinners(electionId: string): Promise<ApiResponse<DistrictWinnerAnalysis>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.DISTRICT_WINNERS(validElectionId));
    return fetchWithRetry<DistrictWinnerAnalysis>(url);
  },
};

// ELECTION SERVICES - Now require election ID validation

export const electionService = {
  // Get election summary
  async getElectionSummary(electionId: string): Promise<ApiResponse<ElectionSummary>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.ELECTION_SUMMARY(validElectionId));
    return fetchWithRetry<ElectionSummary>(url);
  },

  // Get election winner
  async getElectionWinner(electionId: string): Promise<ApiResponse<ElectionWinner>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.ELECTION_WINNER(validElectionId));
    return fetchWithRetry<ElectionWinner>(url);
  },
};

// STATISTICS SERVICES - Now require election ID validation

export const statisticsService = {
  // Get vote distribution statistics
  async getDistributionStatistics(electionId: string): Promise<ApiResponse<DistributionStatistics>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.STATISTICS_DISTRIBUTION(validElectionId));
    return fetchWithRetry<DistributionStatistics>(url);
  },

  // Get margin analysis
  async getMarginAnalysis(electionId: string): Promise<ApiResponse<MarginAnalysis>> {
    const validElectionId = validateElectionId(electionId);
    const url = buildApiUrl(API_ENDPOINTS.STATISTICS_MARGINS(validElectionId));
    return fetchWithRetry<MarginAnalysis>(url);
  },
};

// COMBINED SERVICES - Now require election ID validation

export const resultService = {
  // Get all election results data
  async getAllElectionResults(electionId: string): Promise<{
    electionSummary: ApiResponse<ElectionSummary>;
    candidates: ApiResponse<CandidateExportData[]>;
    districtWinners: ApiResponse<DistrictWinnerAnalysis>;
    districtTotals: ApiResponse<BackendDistrictVoteTotals>;
    distributionStats: ApiResponse<DistributionStatistics>;
    marginAnalysis: ApiResponse<MarginAnalysis>;
  }> {
    const validElectionId = validateElectionId(electionId);
    
    debugLog(`Loading all election results for ${validElectionId}`);
    
    // Fetch all data in parallel
    const [
      electionSummary,
      candidates,
      districtWinners,
      districtTotals,
      distributionStats,
      marginAnalysis,
    ] = await Promise.all([
      electionService.getElectionSummary(validElectionId),
      candidateService.getCandidateExportData(validElectionId),
      districtService.getDistrictWinners(validElectionId),
      districtService.getDistrictTotals(validElectionId),
      statisticsService.getDistributionStatistics(validElectionId),
      statisticsService.getMarginAnalysis(validElectionId),
    ]);

    return {
      electionSummary,
      candidates,
      districtWinners,
      districtTotals,
      distributionStats,
      marginAnalysis,
    };
  },

  // Refresh all calculations
  async refreshCalculations(electionId: string): Promise<ApiResponse<{ message: string }>> {
    const validElectionId = validateElectionId(electionId);
    debugLog(`Refreshing calculations for election ${validElectionId}`);
    
    // First batch update candidate totals
    const updateResult = await candidateService.batchUpdateTotals(validElectionId);
    
    if (updateResult.error) {
      return {
        error: ERROR_MESSAGES.CALCULATION_REFRESH_FAILED,
        status: 0,
      };
    }

    return {
      data: { message: 'Calculations refreshed successfully' },
      status: HTTP_STATUS.OK,
    };
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const url = buildApiUrl('');
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Export individual services and the combined service
export default resultService;

// Export all services for granular access with renamed exports to avoid conflicts
export {
  candidateService as candidates,
  districtService as districts,
  electionService as elections,
  statisticsService as statistics,
};

// Utility functions for service consumers
export const serviceUtils = {
  // Check if response has error
  hasError: <T>(response: ApiResponse<T>): response is { error: string; status: number } => {
    return !!response.error;
  },

  // Check if response has data
  hasData: <T>(response: ApiResponse<T>): response is { data: T; status: number } => {
    return !!response.data && !response.error;
  },

  // Get error message from response
  getErrorMessage: <T>(response: ApiResponse<T>): string => {
    return response.error || ERROR_MESSAGES.SERVER_ERROR;
  },

  // Get data from response or throw error
  getDataOrThrow: <T>(response: ApiResponse<T>): T => {
    if (serviceUtils.hasError(response)) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error(ERROR_MESSAGES.NO_DATA);
    }
    return response.data;
  },
};
