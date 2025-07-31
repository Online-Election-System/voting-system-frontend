// src/app/results/hooks/useSimpleElections.ts
// Simple elections hook without React Query dependency for results page

import { useState, useEffect, useCallback } from 'react';

// Types matching your election structure
interface TimeOfDay {
  hour: number;
  minute: number;
}

interface DateObj {
  year: number;
  month: number;
  day: number;
}

interface Election {
  id: string;
  electionName: string;
  electionType: string;
  description?: string;
  startDate: DateObj;
  endDate: DateObj;
  startTime: TimeOfDay;
  endTime: TimeOfDay;
  noOfCandidates?: number;
  status?: string;
}

interface ElectionsData {
  activeElections: Election[];
  upcomingElections: Election[];
  completedElections: Election[];
  upcomingCount: number;
  activeCount: number;
  completedCount: number;
}

interface UseElectionsResult {
  data: ElectionsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Function to check if election has ended
const hasElectionEnded = (election: Election): boolean => {
  if (!election.endDate || !election.endTime) return false;
  
  const endDate = new Date(
    election.endDate.year,
    election.endDate.month - 1,
    election.endDate.day,
    election.endTime.hour || 23,
    election.endTime.minute || 59
  );
  
  return new Date() > endDate;
};

// Function to check if election has started
const hasElectionStarted = (election: Election): boolean => {
  if (!election.startDate || !election.startTime) return false;
  
  const startDate = new Date(
    election.startDate.year,
    election.startDate.month - 1,
    election.startDate.day,
    election.startTime.hour || 0,
    election.startTime.minute || 0
  );
  
  return new Date() >= startDate;
};

// Function to categorize elections
const categorizeElections = (elections: Election[]): ElectionsData => {
  const activeElections: Election[] = [];
  const upcomingElections: Election[] = [];
  const completedElections: Election[] = [];

  elections.forEach(election => {
    const started = hasElectionStarted(election);
    const ended = hasElectionEnded(election);

    if (ended) {
      completedElections.push(election);
    } else if (started && !ended) {
      activeElections.push(election);
    } else {
      upcomingElections.push(election);
    }
  });

  return {
    activeElections,
    upcomingElections,
    completedElections,
    activeCount: activeElections.length,
    upcomingCount: upcomingElections.length,
    completedCount: completedElections.length,
  };
};

// API configuration - adjust this to match your backend endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const ELECTIONS_ENDPOINT = '/election/api/v1/elections'; // Adjust this to your actual elections endpoint

// Simple fetch function for elections
const fetchElections = async (): Promise<Election[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${ELECTIONS_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.elections && Array.isArray(data.elections)) {
      return data.elections;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
};

// Main hook
export const useSimpleElections = (): UseElectionsResult => {
  const [data, setData] = useState<ElectionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const elections = await fetchElections();
      const categorizedData = categorizeElections(elections);
      
      setData(categorizedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

// Export utility functions for external use
export {
  hasElectionEnded,
  hasElectionStarted,
  categorizeElections,
};

// Export types for external use
export type {
  Election,
  ElectionsData,
  TimeOfDay,
  DateObj,
  UseElectionsResult,
};
