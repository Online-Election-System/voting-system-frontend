'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ExternalLink, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { TimeOfDay } from "../election-commission/elections/election.types";

// API Base URL
const API_BASE_URL = 'http://localhost:8080';

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

// Function to handle election click - navigates directly to voter search page
const handleElectionClick = async (electionId: string) => {
  try {
    console.log('Clicking on election with ID:', electionId);
    
    // Navigate directly to the voter search page with election ID as query parameter
    window.location.href = `/polling-station/vote?electionId=${electionId}`;
    
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Polling Station</h1>
      <p className="text-lg text-center mb-4">Welcome to the polling station. Please proceed to cast your vote.</p>
      
      {currentActiveElection ? (
        <Card 
          className="ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-green-600"
          onClick={() => handleElectionClick(currentActiveElection.id)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                  Live Election
                  <ExternalLink className="h-4 w-4" />
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">
                    IN PROGRESS - Click to view details
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
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {currentActiveElection.description}
                    </p>
                  )}
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
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center p-8">
          <p className="text-lg text-gray-600">No active elections at the moment.</p>
          {upcomingElections.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {upcomingCount} upcoming election{upcomingCount !== 1 ? 's' : ''} scheduled.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}