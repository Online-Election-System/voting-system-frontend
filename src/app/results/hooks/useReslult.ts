// hooks/useResult.ts
// React hooks for election results data management

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  candidates as candidateService,
  districts as districtService,
  elections as electionService,
  statistics as statisticsService,
  resultService,
  serviceUtils,
} from '../service/resultService';
import { DEFAULT_ELECTION_ID } from '../lib/config/api';
import { ElectionSummary, ElectionWinner, CandidateExportData, CandidateRank, CandidateDistrictAnalysis, DistrictWinnerAnalysis, DistributionStatistics, MarginAnalysis } from '../types';

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

// Export backend-compatible types
export type {
  BackendCandidateTotal,
  BackendDistrictVoteTotals,
};

// Backend-compatible types (matching actual API responses)
export interface BackendCandidateTotal {
  candidateId: string;
  totals: number; // lowercase to match backend
}

export interface BackendDistrictVoteTotals {
  electionId: string;
  ampara: number;
  anuradhapura: number;
  badulla: number;
  batticaloa: number;
  colombo: number;
  galle: number;
  gampaha: number;
  hambantota: number;
  jaffna: number;
  kalutara: number;
  kandy: number;
  kegalle: number;
  kilinochchi: number;
  kurunegala: number;
  mannar: number;
  matale: number;
  matara: number;
  monaragala: number;
  mullaitivu: number;
  nuwaraeliya: number;
  polonnaruwa: number;
  puttalam: number;
  ratnapura: number;
  trincomalee: number;
  vavuniya: number;
  grandTotal: number; // camelCase to match backend
}

// Hook state interface
interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Generic hook for API calls
function useApiCall<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = [],
  autoFetch: boolean = true
): HookState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: false,
    error: null,
    status: 'idle',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
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
  }, dependencies);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, autoFetch]);

  return {
    ...state,
    refetch,
  };
}

// ELECTION SUMMARY HOOKS

export function useElectionSummary(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<ElectionSummary>(
    () => electionService.getElectionSummary(electionId),
    [electionId]
  );
}

export function useElectionWinner(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<ElectionWinner>(
    () => electionService.getElectionWinner(electionId),
    [electionId]
  );
}

// CANDIDATE HOOKS

export function useCandidateExportData(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<CandidateExportData[]>(
    () => candidateService.getCandidateExportData(electionId),
    [electionId]
  );
}

export function useCandidateTotals(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<BackendCandidateTotal[]>(
    () => candidateService.getCandidateTotals(electionId),
    [electionId]
  );
}

export function useTopCandidates(count: number = 5, electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<BackendCandidateTotal[]>(
    () => candidateService.getTopCandidates(count, electionId),
    [count, electionId]
  );
}

export function useCandidateRank(candidateId: string, electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<CandidateRank>(
    () => candidateService.getCandidateRank(candidateId, electionId),
    [candidateId, electionId],
    !!candidateId // Only auto-fetch if candidateId is provided
  );
}

export function useCandidateCSV(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<string>(
    () => candidateService.getCandidateExportCSV(electionId),
    [electionId],
    false // Don't auto-fetch CSV
  );
}

// DISTRICT HOOKS

export function useDistrictAnalysis(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<CandidateDistrictAnalysis[]>(
    () => districtService.getDistrictAnalysis(electionId),
    [electionId]
  );
}

export function useDistrictTotals(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<BackendDistrictVoteTotals>(
    () => districtService.getDistrictTotals(electionId),
    [electionId]
  );
}

export function useDistrictWinners(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<DistrictWinnerAnalysis>(
    () => districtService.getDistrictWinners(electionId),
    [electionId]
  );
}

// STATISTICS HOOKS

export function useDistributionStatistics(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<DistributionStatistics>(
    () => statisticsService.getDistributionStatistics(electionId),
    [electionId]
  );
}

export function useMarginAnalysis(electionId: string = DEFAULT_ELECTION_ID) {
  return useApiCall<MarginAnalysis>(
    () => statisticsService.getMarginAnalysis(electionId),
    [electionId]
  );
}

// MUTATION HOOKS (for actions that modify data)

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

export function useBatchUpdateTotals(electionId: string = DEFAULT_ELECTION_ID) {
  const mutation = useMutation<{ message: string }, void>(
    () => candidateService.batchUpdateTotals(electionId)
  );

  const batchUpdate = useCallback(async () => {
    return await mutation.mutate();
  }, [mutation.mutate]);

  return {
    ...mutation,
    batchUpdate,
  };
}

export function useRefreshCalculations(electionId: string = DEFAULT_ELECTION_ID) {
  const mutation = useMutation<{ message: string }, void>(
    () => resultService.refreshCalculations(electionId)
  );

  const refreshCalculations = useCallback(async () => {
    return await mutation.mutate();
  }, [mutation.mutate]);

  return {
    ...mutation,
    refreshCalculations,
  };
}

// COMBINED HOOKS FOR DASHBOARD

export function useElectionResults(electionId: string = DEFAULT_ELECTION_ID) {
  const electionSummary = useElectionSummary(electionId);
  const candidates = useCandidateExportData(electionId);
  const districtWinners = useDistrictWinners(electionId);
  const districtTotals = useDistrictTotals(electionId);

  const loading = electionSummary.loading || candidates.loading || 
                 districtWinners.loading || districtTotals.loading;

  const error = electionSummary.error || candidates.error || 
               districtWinners.error || districtTotals.error;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      electionSummary.refetch(),
      candidates.refetch(),
      districtWinners.refetch(),
      districtTotals.refetch(),
    ]);
  }, [electionSummary.refetch, candidates.refetch, districtWinners.refetch, districtTotals.refetch]);

  return {
    electionSummary: electionSummary.data,
    candidates: candidates.data,
    districtWinners: districtWinners.data,
    districtTotals: districtTotals.data as BackendDistrictVoteTotals | null,
    loading,
    error,
    refetchAll,
  };
}

export function useDistrictData(electionId: string = DEFAULT_ELECTION_ID) {
  const analysis = useDistrictAnalysis(electionId);
  const winners = useDistrictWinners(electionId);
  const totals = useDistrictTotals(electionId);

  const loading = analysis.loading || winners.loading || totals.loading;
  const error = analysis.error || winners.error || totals.error;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      analysis.refetch(),
      winners.refetch(),
      totals.refetch(),
    ]);
  }, [analysis.refetch, winners.refetch, totals.refetch]);

  return {
    analysis: analysis.data,
    winners: winners.data,
    totals: totals.data as BackendDistrictVoteTotals | null,
    loading,
    error,
    refetchAll,
  };
}

export function useAnalyticsData(electionId: string = DEFAULT_ELECTION_ID) {
  const distributionStats = useDistributionStatistics(electionId);
  const marginAnalysis = useMarginAnalysis(electionId);

  const loading = distributionStats.loading || marginAnalysis.loading;
  const error = distributionStats.error || marginAnalysis.error;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      distributionStats.refetch(),
      marginAnalysis.refetch(),
    ]);
  }, [distributionStats.refetch, marginAnalysis.refetch]);

  return {
    distributionStats: distributionStats.data,
    marginAnalysis: marginAnalysis.data,
    loading,
    error,
    refetchAll,
  };
}

// HEALTH CHECK HOOK

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

// POLLING HOOK FOR REAL-TIME UPDATES

export function usePolling<T>(
  hookFn: () => HookState<T> & { refetch: () => Promise<void> },
  interval: number = 10000, // 10 seconds default
  enabled: boolean = false
): HookState<T> & { 
  refetch: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
} {
  const hook = hookFn();
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPolling(true);
    intervalRef.current = setInterval(() => {
      hook.refetch();
    }, interval);
  }, [hook.refetch, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    ...hook,
    startPolling,
    stopPolling,
    isPolling,
  };
}

// CACHED DATA HOOK

export function useCachedElectionData(electionId: string = DEFAULT_ELECTION_ID) {
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  const getCachedData = useCallback(<T>(key: string): T | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }
    return null;
  }, [cache, cacheTimeout]);

  const setCachedData = useCallback(<T>(key: string, data: T) => {
    setCache(prev => new Map(prev.set(key, { data, timestamp: Date.now() })));
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    cacheSize: cache.size,
  };
}

// LOCAL STORAGE PERSISTENCE HOOK

export function usePersistedElectionData(electionId: string = DEFAULT_ELECTION_ID) {
  const storageKey = `election_data_${electionId}`;

  const saveToStorage = useCallback((data: any) => {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        electionId,
      });
      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [storageKey, electionId]);

  const loadFromStorage = useCallback(<T>(): T | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if data is not too old (1 hour)
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }, [storageKey]);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [storageKey]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
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

// EXPORT DEFAULT HOOK FOR MAIN DASHBOARD

export default function useElectionDashboard(electionId: string = DEFAULT_ELECTION_ID) {
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
    try {
      await Promise.all([
        electionResults.refetchAll(),
        analyticsData.refetchAll(),
        districtData.refetchAll(),
      ]);
    } catch (err) {
      errorHandler.addError('Failed to refresh all data');
    }
  }, [electionResults.refetchAll, analyticsData.refetchAll, districtData.refetchAll, errorHandler.addError]);

  // Refresh calculations and data
  const refreshCalculations = useCallback(async () => {
    try {
      await refreshMutation.refreshCalculations();
      await refetchAll();
    } catch (err) {
      errorHandler.addError('Failed to refresh calculations');
    }
  }, [refreshMutation.refreshCalculations, refetchAll, errorHandler.addError]);

  // Batch update totals
  const batchUpdateTotals = useCallback(async () => {
    try {
      await batchUpdateMutation.batchUpdate();
      await refetchAll();
    } catch (err) {
      errorHandler.addError('Failed to update totals');
    }
  }, [batchUpdateMutation.batchUpdate, refetchAll, errorHandler.addError]);

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