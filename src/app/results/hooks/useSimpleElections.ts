// src/app/results/hooks/useSimpleElections.ts
// Simple elections hook with corrected election status logic

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
  startDate: DateObj; // Election date (when voting happens)
  endDate: DateObj;   // Results display end date
  startTime: TimeOfDay; // Voting start time on election date
  endTime: TimeOfDay;   // Voting end time on election date
  noOfCandidates?: number;
  status?: string;
}

interface ElectionsData {
  activeElections: Election[];           // Currently voting
  upcomingElections: Election[];         // Not started yet
  completedElections: Election[];        // Voting ended, results available
  expiredElections: Election[];          // Past end date, no longer showing results
  upcomingCount: number;
  activeCount: number;
  completedCount: number;
  expiredCount: number;
}

interface UseElectionsResult {
  data: ElectionsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Function to check if voting period has started (election date + start time)
const hasVotingStarted = (election: Election): boolean => {
  if (!election.startDate || !election.startTime) return false;
  
  const votingStartDateTime = new Date(
    election.startDate.year,
    election.startDate.month - 1,
    election.startDate.day,
    election.startTime.hour || 0,
    election.startTime.minute || 0
  );
  
  return new Date() >= votingStartDateTime;
};

// Function to check if voting period has ended (election date + end time)
const hasVotingEnded = (election: Election): boolean => {
  if (!election.startDate || !election.endTime) return false;
  
  // IMPORTANT: Voting ends on the START DATE (election date), not end date
  const votingEndDateTime = new Date(
    election.startDate.year,  // Use startDate (election date)
    election.startDate.month - 1,
    election.startDate.day,
    election.endTime.hour || 23,
    election.endTime.minute || 59
  );
  
  return new Date() > votingEndDateTime;
};

// Function to check if results display period has ended (end date)
const hasResultsExpired = (election: Election): boolean => {
  if (!election.endDate) return false;
  
  // Results expire at end of end date
  const resultsExpiryDate = new Date(
    election.endDate.year,
    election.endDate.month - 1,
    election.endDate.day,
    23, // End of day
    59
  );
  
  return new Date() > resultsExpiryDate;
};

// Function to check if election is currently in voting period
const isElectionActive = (election: Election): boolean => {
  return hasVotingStarted(election) && !hasVotingEnded(election);
};

// Function to check if results should be shown
const areResultsAvailable = (election: Election): boolean => {
  return hasVotingEnded(election) && !hasResultsExpired(election);
};

// Function to categorize elections based on new logic
const categorizeElections = (elections: Election[]): ElectionsData => {
  const activeElections: Election[] = [];        // Currently voting
  const upcomingElections: Election[] = [];      // Not started yet
  const completedElections: Election[] = [];     // Results available
  const expiredElections: Election[] = [];       // No longer showing results

  elections.forEach(election => {
    if (isElectionActive(election)) {
      // Election is currently in voting period
      activeElections.push(election);
    } else if (!hasVotingStarted(election)) {
      // Election hasn't started yet
      upcomingElections.push(election);
    } else if (areResultsAvailable(election)) {
      // Voting ended, results available
      completedElections.push(election);
    } else if (hasResultsExpired(election)) {
      // Results no longer available (past end date)
      expiredElections.push(election);
    }
  });

  // Sort completed elections by voting end time (most recent first)
  completedElections.sort((a, b) => {
    const endDateTimeA = new Date(
      a.startDate.year,
      a.startDate.month - 1,
      a.startDate.day,
      a.endTime.hour || 23,
      a.endTime.minute || 59
    );
    const endDateTimeB = new Date(
      b.startDate.year,
      b.startDate.month - 1,
      b.startDate.day,
      b.endTime.hour || 23,
      b.endTime.minute || 59
    );
    return endDateTimeB.getTime() - endDateTimeA.getTime();
  });

  return {
    activeElections,
    upcomingElections,
    completedElections,
    expiredElections,
    activeCount: activeElections.length,
    upcomingCount: upcomingElections.length,
    completedCount: completedElections.length,
    expiredCount: expiredElections.length,
  };
};

// API configuration - adjust this to match your backend endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const ELECTIONS_ENDPOINT = '/election/api/v1/elections';

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
  hasVotingStarted,
  hasVotingEnded,
  hasResultsExpired,
  isElectionActive,
  areResultsAvailable,
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
