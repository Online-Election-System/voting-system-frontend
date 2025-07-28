'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ExternalLink, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { TimeOfDay } from "../election-commission/elections/election.types";

// API Base URL
const API_BASE_URL = 'http://localhost:8080';

// Storage keys for maintaining election selection across pages
const STORAGE_KEYS = {
  SELECTED_ELECTION_ID: 'votingSystem_selectedElectionId',
  ELECTION_END_TIME: 'votingSystem_electionEndTime',
  ELECTION_NAME: 'votingSystem_electionName'
}

// Utility function to save election to session storage
const saveElectionToSession = (election: any) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_ELECTION_ID, election.id)
    sessionStorage.setItem(STORAGE_KEYS.ELECTION_NAME, election.electionName)
    
    // Calculate and store end time
    if (election.endDate && election.endTime) {
      const endDate = new Date(
        election.endDate.year,
        election.endDate.month - 1,
        election.endDate.day,
        election.endTime.hour || 23,
        election.endTime.minute || 59
      )
      sessionStorage.setItem(STORAGE_KEYS.ELECTION_END_TIME, endDate.toISOString())
    }
    
    console.log('Election saved to session from polling station:', {
      id: election.id,
      name: election.electionName,
      endTime: election.endDate
    })
  }
}

// Get all elections
const getElections = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add CORS mode if needed
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch elections: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Raw election data:', data);
    
    // Calculate stats client-side using the status field
    const activeElections = data.filter((election: any) => election.status === "Active");
    const upcomingElections = data.filter((election: any) => election.status === "Upcoming");
    
    console.log('Active elections:', activeElections);
    console.log('Upcoming elections:', upcomingElections);
    
    // Alternative: If you want to calculate based on dates, use this instead:
    /*
    const now = new Date();
    const activeElections = data.filter((election: any) => {
      // Convert the date objects to Date instances
      const startDate = new Date(election.startDate.year, election.startDate.month - 1, election.startDate.day);
      const endDate = new Date(election.endDate.year, election.endDate.month - 1, election.endDate.day);
      return now >= startDate && now <= endDate;
    });

    const upcomingElections = data.filter((election: any) => {
      const startDate = new Date(election.startDate.year, election.startDate.month - 1, election.startDate.day);
      return now < startDate;
    });
    */

    return {
      elections: data,
      totalCount: data.length,
      activeElections,
      upcomingElections,
      activeCount: activeElections.length,
      upcomingCount: upcomingElections.length,
    };
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
}

// Function to handle election click - navigates to voter search page with election data saved
const handleElectionClick = async (election: any) => {
  try {
    console.log('Clicking on election:', election);
    
    // Save complete election data to session storage
    saveElectionToSession(election);
    
    // Navigate to the voter search page with election ID as query parameter
    window.location.href = `/polling-station/vote?electionId=${election.id}`;
    
  } catch (error) {
    console.error('Error navigating to voting page:', error);
  }
};

const formatTime = (timeOfDay?: TimeOfDay): string => {
  if (
    !timeOfDay ||
    timeOfDay.hour === undefined ||
    timeOfDay.minute === undefined
  ) {
    return "N/A";
  }

  const hours = timeOfDay.hour % 12 || 12;
  const minutes = timeOfDay.minute.toString().padStart(2, "0");
  const ampm = timeOfDay.hour >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${ampm}`;
};

const formatDate = (dateObj?: any): string => {
  if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day) {
    return "N/A";
  }
  
  const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function PollingStationPage() {
  const [electionsData, setElectionsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getElections();
        setElectionsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch elections');
        console.error('Error loading elections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElections();

    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchElections, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Polling Station</h1>
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="ml-2 text-lg">Loading election data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Polling Station</h1>
        <Card className="text-center p-8 border-red-200">
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const {
    activeElections = [],
    upcomingElections = [],
    upcomingCount = 0,
  } = electionsData || {};

  const currentActiveElection = activeElections[0] || null;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Polling Station</h1>
      <p className="text-lg text-center mb-8">Welcome to the polling station. Please proceed to cast your vote.</p>
      
      {/* Active Election Card - Centered */}
      <div className="flex justify-center mb-6">
        {currentActiveElection ? (
          <Card 
            className="ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-green-600 w-full max-w-3xl"
            onClick={() => handleElectionClick(currentActiveElection)}
          >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                  🔴 Live Election
                  <ExternalLink className="h-4 w-4" />
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">
                    IN PROGRESS - Click to vote
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                    {currentActiveElection.electionName}
                  </h3>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-300">
                    {currentActiveElection.electionType}
                  </p>
                  {currentActiveElection.description && (
                    <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                      {currentActiveElection.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <span className="font-medium">Start:</span>
                    <span className="ml-2">{formatDate(currentActiveElection.startDate)} at {formatTime(currentActiveElection.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <span className="font-medium">End:</span>
                    <span className="ml-2">{formatDate(currentActiveElection.endDate)} at {formatTime(currentActiveElection.endTime)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                    <Clock className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Start Time
                    </p>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      {formatTime(currentActiveElection.startTime)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                    <Clock className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      End Time
                    </p>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      {formatTime(currentActiveElection.endTime)}
                    </p>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                  <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Candidates
                  </p>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    {currentActiveElection.noOfCandidates || 0}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Click to vote prompt */}
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
              <p className="text-green-800 dark:text-green-300 font-medium">
                🗳️ Click anywhere on this card to start voting
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Your election selection will be maintained throughout the voting process
              </p>
            </div>
          </CardContent>
        </Card>
        ) : (
          <Card className="text-center p-8 w-full max-w-3xl">
            <p className="text-lg text-gray-600">No active elections at the moment.</p>
            {upcomingElections.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {upcomingCount} upcoming election{upcomingCount !== 1 ? 's' : ''} scheduled.
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Show additional active elections if any */}
      {activeElections.length > 1 && (
        <div className="mb-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Other Active Elections</h2>
          <div className="grid gap-4 max-w-3xl mx-auto">
            {activeElections.slice(1).map((election: any, index: number) => (
              <Card 
                key={election.id}
                className="ring-1 ring-orange-400 bg-orange-50 dark:bg-orange-950/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-orange-500"
                onClick={() => handleElectionClick(election)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                        {election.electionName}
                      </h3>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        {election.electionType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-orange-600">ACTIVE</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-1">
                        Ends: {formatTime(election.endTime)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Elections Section */}
      {upcomingElections.length > 0 && (
        <div className="mb-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Upcoming Elections</h2>
          <div className="grid gap-4 max-w-3xl mx-auto">
            {upcomingElections.slice(0, 3).map((election: any) => (
              <Card 
                key={election.id}
                className="ring-1 ring-blue-300 bg-blue-50 dark:bg-blue-950/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                        {election.electionName}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {election.electionType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-blue-600">UPCOMING</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Starts: {formatDate(election.startDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {upcomingElections.length > 3 && (
            <p className="text-center text-gray-500 text-sm mt-4">
              + {upcomingElections.length - 3} more upcoming elections
            </p>
          )}
        </div>
      )}

      {/* Additional Navigation */}
      <div className="text-center mt-8">
        <button 
          onClick={() => window.location.href = '/polling-station/vote'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Vote Search Page
        </button>
      </div>
    </div>
  );
}