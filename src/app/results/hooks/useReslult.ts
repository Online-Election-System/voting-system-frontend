// hooks/useResult.ts
// React hooks for election results data management - No default election IDs

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  candidates as candidateService,
  districts as districtService,
  elections as electionService,
  statistics as statisticsService,
  resultService,
  serviceUtils,
} from '../service/resultService';
import { validateElectionId, ERROR_MESSAGES } from '../lib/config/api';
import { ElectionSummary, ElectionWinner, CandidateExportData, CandidateRank, CandidateDistrictAnalysis, DistrictWinnerAnalysis, DistributionStatistics, MarginAnalysis, BackendCandidateTotal, BackendDistrictVoteTotals } from '../types';

// Re-export types for convenience
export type {
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
  ValidationResult,
} from '../types';

// Import and re-export backend-compatible types from main types file
export type {
  BackendCandidateTotal,
  BackendDistrictVoteTotals,
} from '../types';

// Hook state interface
interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Generic hook for API calls - now requires election ID
function useApiCall<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = [],
  enabled: boolean = true // Allow manual enabling/disabling
): HookState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if disabled
    if (!enabled) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        status: 'idle',
      }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      status: 'loading',
    }));

    try {
      const response = await apiCall();
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (serviceUtils.hasError(response)) {
        setState({
          data: null,
          loading: false,
          error: serviceUtils.getErrorMessage(response),
          status: 'error',
        });
      } else {
        setState({
          data: response.data,
          loading: false,
          error: null,
          status: 'success',
        });
      }
    } catch (error) {
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      });
    }
  }, [...dependencies, enabled]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

// ELECTION SUMMARY HOOKS - Now require election ID

export function useElectionSummary(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<ElectionSummary>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return electionService.getElectionSummary(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useElectionWinner(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<ElectionWinner>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return electionService.getElectionWinner(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

// CANDIDATE HOOKS - Now require election ID

export function useCandidateExportData(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<CandidateExportData[]>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return candidateService.getCandidateExportData(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useCandidateTotals(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<BackendCandidateTotal[]>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return candidateService.getCandidateTotals(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useTopCandidates(electionId?: string, count: number = 5) {
  const isEnabled = !!electionId;
  
  return useApiCall<BackendCandidateTotal[]>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return candidateService.getTopCandidates(count, validElectionId);
    },
    [electionId, count],
    isEnabled
  );
}

export function useCandidateRank(electionId?: string, candidateId?: string) {
  const isEnabled = !!electionId && !!candidateId;
  
  return useApiCall<CandidateRank>(
    () => {
      const validElectionId = validateElectionId(electionId);
      if (!candidateId) throw new Error('Candidate ID is required');
      return candidateService.getCandidateRank(candidateId, validElectionId);
    },
    [electionId, candidateId],
    isEnabled
  );
}

export function useCandidateCSV(electionId?: string, autoFetch: boolean = false) {
  const isEnabled = !!electionId && autoFetch;
  
  return useApiCall<string>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return candidateService.getCandidateExportCSV(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

// DISTRICT HOOKS - Now require election ID

export function useDistrictAnalysis(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<CandidateDistrictAnalysis[]>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return districtService.getDistrictAnalysis(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useDistrictTotals(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<BackendDistrictVoteTotals>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return districtService.getDistrictTotals(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useDistrictWinners(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<DistrictWinnerAnalysis>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return districtService.getDistrictWinners(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

// STATISTICS HOOKS - Now require election ID

export function useDistributionStatistics(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<DistributionStatistics>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return statisticsService.getDistributionStatistics(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

export function useMarginAnalysis(electionId?: string) {
  const isEnabled = !!electionId;
  
  return useApiCall<MarginAnalysis>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return statisticsService.getMarginAnalysis(validElectionId);
    },
    [electionId],
    isEnabled
  );
}

// MUTATION HOOKS (for actions that modify data) - Now require election ID

interface MutationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<any>
): MutationState & {
  mutate: (params: P) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<MutationState>({
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    setState({
      loading: true,
      error: null,
      success: false,
    });

    try {
      const response = await mutationFn(params);
      
      if (serviceUtils.hasError(response)) {
        setState({
          loading: false,
          error: serviceUtils.getErrorMessage(response),
          success: false,
        });
        return null;
      }

      setState({
        loading: false,
        error: null,
        success: true,
      });

      return response.data;
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
      return null;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

export function useBatchUpdateTotals(electionId?: string) {
  const mutation = useMutation<{ message: string }, void>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return candidateService.batchUpdateTotals(validElectionId);
    }
  );

  const batchUpdate = useCallback(async () => {
    if (!electionId) {
      throw new Error(ERROR_MESSAGES.NO_ELECTION_SELECTED);
    }
    return await mutation.mutate();
  }, [mutation.mutate, electionId]);

  return {
    ...mutation,
    batchUpdate,
  };
}

export function useRefreshCalculations(electionId?: string) {
  const mutation = useMutation<{ message: string }, void>(
    () => {
      const validElectionId = validateElectionId(electionId);
      return resultService.refreshCalculations(validElectionId);
    }
  );

  const refreshCalculations = useCallback(async () => {
    if (!electionId) {
      throw new Error(ERROR_MESSAGES.NO_ELECTION_SELECTED);
    }
    return await mutation.mutate();
  }, [mutation.mutate, electionId]);

  return {
    ...mutation,
    refreshCalculations,
  };
}

// COMBINED HOOKS FOR DASHBOARD - Now require election ID

export function useElectionResults(electionId?: string) {
  const electionSummary = useElectionSummary(electionId);
  const candidates = useCandidateExportData(electionId);
  const districtWinners = useDistrictWinners(electionId);
  const districtTotals = useDistrictTotals(electionId);

  const loading = electionSummary.loading || candidates.loading || 
                 districtWinners.loading || districtTotals.loading;

  const error = electionSummary.error || candidates.error || 
               districtWinners.error || districtTotals.error;

  const refetchAll = useCallback(async () => {
    if (!electionId) return;
    
    await Promise.all([
      electionSummary.refetch(),
      candidates.refetch(),
      districtWinners.refetch(),
      districtTotals.refetch(),
    ]);
  }, [electionSummary.refetch, candidates.refetch, districtWinners.refetch, districtTotals.refetch, electionId]);

  return {
    electionSummary: electionSummary.data,
    candidates: candidates.data,
    districtWinners: districtWinners.data,
    districtTotals: districtTotals.data as BackendDistrictVoteTotals | null,
    loading,
    error,
    refetchAll,
    hasData: !!electionId && (!!electionSummary.data || !!candidates.data),
  };
}

export function useDistrictData(electionId?: string) {
  const analysis = useDistrictAnalysis(electionId);
  const winners = useDistrictWinners(electionId);
  const totals = useDistrictTotals(electionId);

  const loading = analysis.loading || winners.loading || totals.loading;
  const error = analysis.error || winners.error || totals.error;

  const refetchAll = useCallback(async () => {
    if (!electionId) return;
    
    await Promise.all([
      analysis.refetch(),
      winners.refetch(),
      totals.refetch(),
    ]);
  }, [analysis.refetch, winners.refetch, totals.refetch, electionId]);

  return {
    analysis: analysis.data,
    winners: winners.data,
    totals: totals.data as BackendDistrictVoteTotals | null,
    loading,
    error,
    refetchAll,
    hasData: !!electionId && (!!analysis.data || !!winners.data),
  };
}

export function useAnalyticsData(electionId?: string) {
  const distributionStats = useDistributionStatistics(electionId);
  const marginAnalysis = useMarginAnalysis(electionId);

  const loading = distributionStats.loading || marginAnalysis.loading;
  const error = distributionStats.error || marginAnalysis.error;

  const refetchAll = useCallback(async () => {
    if (!electionId) return;
    
    await Promise.all([
      distributionStats.refetch(),
      marginAnalysis.refetch(),
    ]);
  }, [distributionStats.refetch, marginAnalysis.refetch, electionId]);

  return {
    distributionStats: distributionStats.data,
    marginAnalysis: marginAnalysis.data,
    loading,
    error,
    refetchAll,
    hasData: !!electionId && (!!distributionStats.data || !!marginAnalysis.data),
  };
}

// HEALTH CHECK HOOK (doesn't require election ID)

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const healthy = await resultService.healthCheck();
      setIsHealthy(healthy);
      setLastCheck(new Date());
    } catch {
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth,
  };
}

// AUTO-REFRESH HOOK

export function useAutoRefresh(
  refetchFn: () => Promise<void>,
  interval: number = 30000, // 30 seconds default
  enabled: boolean = false
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(refetchFn, interval);
  }, [refetchFn, interval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return stopAutoRefresh;
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
    isRunning: intervalRef.current !== null,
  };
}

// ERROR BOUNDARY HOOK

export function useErrorHandler() {
  const [errors, setErrors] = useState<Array<{ id: string; message: string; timestamp: Date }>>([]);

  const addError = useCallback((message: string) => {
    const error = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date(),
    };
    setErrors(prev => [...prev, error]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors: errors.length > 0,
  };
}

// EXPORT DEFAULT HOOK FOR MAIN DASHBOARD - Now requires election ID

export default function useElectionDashboard(electionId?: string) {
  const electionResults = useElectionResults(electionId);
  const analyticsData = useAnalyticsData(electionId);
  const districtData = useDistrictData(electionId);
  const batchUpdateMutation = useBatchUpdateTotals(electionId);
  const refreshMutation = useRefreshCalculations(electionId);
  const apiHealth = useApiHealth();
  const errorHandler = useErrorHandler();

  // Combined loading state
  const loading = electionResults.loading || analyticsData.loading || districtData.loading;

  // Combined error state
  const error = electionResults.error || analyticsData.error || districtData.error;

  // Combined refetch function
  const refetchAll = useCallback(async () => {
    if (!electionId) {
      errorHandler.addError(ERROR_MESSAGES.NO_ELECTION_SELECTED);
      return;
    }
    
    try {
      await Promise.all([
        electionResults.refetchAll(),
        analyticsData.refetchAll(),
        districtData.refetchAll(),
      ]);
    } catch (err) {
      errorHandler.addError('Failed to refresh all data');
    }
  }, [electionResults.refetchAll, analyticsData.refetchAll, districtData.refetchAll, errorHandler.addError, electionId]);

  // Refresh calculations and data
  const refreshCalculations = useCallback(async () => {
    if (!electionId) {
      errorHandler.addError(ERROR_MESSAGES.NO_ELECTION_SELECTED);
      return;
    }
    
    try {
      await refreshMutation.refreshCalculations();
      await refetchAll();
    } catch (err) {
      errorHandler.addError('Failed to refresh calculations');
    }
  }, [refreshMutation.refreshCalculations, refetchAll, errorHandler.addError, electionId]);

  // Batch update totals
  const batchUpdateTotals = useCallback(async () => {
    if (!electionId) {
      errorHandler.addError(ERROR_MESSAGES.NO_ELECTION_SELECTED);
      return;
    }
    
    try {
      await batchUpdateMutation.batchUpdate();
      await refetchAll();
    } catch (err) {
      errorHandler.addError('Failed to update totals');
    }
  }, [batchUpdateMutation.batchUpdate, refetchAll, errorHandler.addError, electionId]);

  return {
    // Data
    electionSummary: electionResults.electionSummary,
    candidates: electionResults.candidates,
    districtWinners: electionResults.districtWinners,
    districtTotals: electionResults.districtTotals,
    distributionStats: analyticsData.distributionStats,
    marginAnalysis: analyticsData.marginAnalysis,
    districtAnalysis: districtData.analysis,

    // States
    loading,
    error,
    isApiHealthy: apiHealth.isHealthy,
    hasElectionSelected: !!electionId,
    hasData: electionResults.hasData || analyticsData.hasData || districtData.hasData,
    
    // Actions
    refetchAll,
    refreshCalculations,
    batchUpdateTotals,
    
    // Mutation states
    isRefreshing: refreshMutation.loading,
    isUpdating: batchUpdateMutation.loading,
    refreshError: refreshMutation.error,
    updateError: batchUpdateMutation.error,
    
    // Error handling
    errors: errorHandler.errors,
    addError: errorHandler.addError,
    removeError: errorHandler.removeError,
    clearErrors: errorHandler.clearErrors,
    
    // Health check
    checkApiHealth: apiHealth.checkHealth,
    lastHealthCheck: apiHealth.lastCheck,
  };
}
