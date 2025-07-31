"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, MapPin, AlertTriangle, Download, RefreshCw, BarChart3, PieChart, Clock, ArrowLeft, CheckCircle } from "lucide-react"
import { CandidateResultsCard } from "./(components)/CandidateResultsCard"
import { DistrictAnalysisCard } from "./(components)/DistrictAnalysisCard"
import { ElectionSummaryCard } from "./(components)/ElectionSummaryCard"
import { VoteDistributionChart } from "./(components)/VoteDistributionChart"
import { DistrictMapView } from "./(components)/DistrictMapView"

// Import hooks
import {
  useElectionSummary,
  useCandidateExportData,
  useDistrictWinners,
  useDistrictTotals,
  useRefreshCalculations,
  useBatchUpdateTotals,
  type ElectionSummary,
  type CandidateExportData,
  type DistrictWinnerAnalysis,
  type BackendDistrictVoteTotals,
} from "./hooks/useReslult"

// Import simple elections hook (no React Query dependency)
import { useSimpleElections, hasElectionEnded, type TimeOfDay } from "./hooks/useSimpleElections"

// Utility functions
const safeNumber = (value: number | undefined | null): number => value || 0;
const safeLocaleString = (value: number | undefined | null): string => (value || 0).toLocaleString();
const safePercentage = (value: number | undefined | null): string => (value || 0).toFixed(2);

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

// Function to check if election has ended is now imported from useSimpleElections

// Election Selection Component
function ElectionSelection({ onElectionSelect }: { onElectionSelect: (election: any) => void }) {
  const { data: electionsData, isLoading, error, refetch } = useSimpleElections();

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Election Results</h1>
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-lg">Loading elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Election Results</h1>
        <Card className="text-center p-8 border-red-200">
          <p className="text-lg text-red-600 mb-4">Error: {error?.message || 'Failed to fetch elections'}</p>
          <Button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const {
    completedElections = [],
    activeElections = [],
    upcomingElections = [],
  } = electionsData || {};

  // Filter only elections that have ended
  const endedElections = [
    ...completedElections,
    ...activeElections.filter(hasElectionEnded),
  ].sort((a, b) => {
    // Sort by end date, most recent first
    const endDateA = new Date(a.endDate?.year || 0, (a.endDate?.month || 1) - 1, a.endDate?.day || 1);
    const endDateB = new Date(b.endDate?.year || 0, (b.endDate?.month || 1) - 1, b.endDate?.day || 1);
    return endDateB.getTime() - endDateA.getTime();
  });

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Election Results</h1>
        <p className="text-lg text-gray-600">Select a completed election to view its results</p>
      </div>

      {endedElections.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-lg text-gray-600 mb-4">No completed elections available for viewing results.</p>
          <p className="text-sm text-gray-500">Results will be available after elections have concluded.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              {endedElections.length} completed election{endedElections.length !== 1 ? 's' : ''} available
            </Badge>
          </div>

          <div className="grid gap-4 max-w-4xl mx-auto">
            {endedElections.map((election: any) => (
              <Card 
                key={election.id}
                className="ring-1 ring-green-400 bg-green-50 dark:bg-green-950/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-green-600"
                onClick={() => onElectionSelect(election)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        {election.electionName}
                        <Badge variant="outline" className="ml-2 border-green-500 text-green-700">
                          Completed
                        </Badge>
                      </CardTitle>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {election.electionType}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {election.description && (
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {election.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-green-600">
                          <span className="font-medium">Started:</span>
                          <span className="ml-2">{formatDate(election.startDate)} at {formatTime(election.startTime)}</span>
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <span className="font-medium">Ended:</span>
                          <span className="ml-2">{formatDate(election.endDate)} at {formatTime(election.endTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                          <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Candidates
                          </p>
                          <p className="text-sm font-bold text-green-800 dark:text-green-300">
                            {election.noOfCandidates || 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                          <BarChart3 className="h-4 w-4 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            View Results
                          </p>
                          <p className="text-sm font-bold text-green-800 dark:text-green-300">
                            Click Here
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      📊 Click to view complete election results and analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show ongoing elections info */}
      {activeElections.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Note:</strong> There {activeElections.length === 1 ? 'is' : 'are'} {activeElections.length} ongoing election{activeElections.length !== 1 ? 's' : ''}. 
              Results will be available after {activeElections.length === 1 ? 'it concludes' : 'they conclude'}.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

// Results Dashboard Component (moved from main component)
function ResultsDashboard({ selectedElection, onBack }: { selectedElection: any; onBack: () => void }) {
  const electionId = selectedElection.id;
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Use hooks with the selected election ID
  const { 
    data: electionSummary, 
    loading: summaryLoading, 
    error: summaryError, 
    refetch: refetchSummary 
  } = useElectionSummary(electionId);

  const { 
    data: candidates, 
    loading: candidatesLoading, 
    error: candidatesError, 
    refetch: refetchCandidates 
  } = useCandidateExportData(electionId);

  const { 
    data: districtAnalysis, 
    loading: districtLoading, 
    error: districtError, 
    refetch: refetchDistricts 
  } = useDistrictWinners(electionId);

  const { 
    data: districtTotals, 
    loading: totalsLoading, 
    error: totalsError, 
    refetch: refetchTotals 
  } = useDistrictTotals(electionId);

  const { refreshCalculations, loading: refreshing, error: refreshError } = useRefreshCalculations(electionId);
  const { batchUpdate, loading: updating, error: updateError } = useBatchUpdateTotals(electionId);

  const loading = summaryLoading || candidatesLoading || districtLoading || totalsLoading;
  const error = summaryError || candidatesError || districtError || totalsError || refreshError || updateError;

  const handleRefreshData = async () => {
    try {
      await refreshCalculations();
      refetchSummary();
      refetchCandidates();
      refetchDistricts();
      refetchTotals();
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleBatchUpdate = async () => {
    try {
      await batchUpdate();
      refetchCandidates();
      refetchSummary();
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error updating totals:", err);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      electionId,
      electionName: selectedElection.electionName,
      electionType: selectedElection.electionType,
      electionSummary,
      candidates,
      districtAnalysis,
      districtTotals,
      exportedAt: new Date().toISOString(),
      exportedBy: "Election Results Dashboard",
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `election-${selectedElection.electionName.replace(/\s+/g, '-')}-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !electionSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Elections
          </Button>
          <h1 className="text-2xl font-bold">Loading Results for {selectedElection.electionName}</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-lg font-medium">Loading election results...</p>
            <p className="text-sm text-gray-600">Election: {selectedElection.electionName}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !electionSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Elections
          </Button>
          <h1 className="text-2xl font-bold">Results for {selectedElection.electionName}</h1>
        </div>
        <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-medium text-red-800">Failed to load results data</p>
              <p className="text-sm text-red-700">{error}</p>
              <div className="flex items-center space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData} 
                  className="bg-white border-red-300 text-red-700 hover:bg-red-50"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Retrying...' : 'Retry'}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Elections
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Results: {selectedElection.electionName}
            </h1>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Badge variant="outline" className="mr-2">{selectedElection.electionType}</Badge>
              Ended: {formatDate(selectedElection.endDate)} at {formatTime(selectedElection.endTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleBatchUpdate}
            disabled={updating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Updating...' : 'Update Totals'}
          </Button>
          <Button onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${!error ? 'animate-pulse' : ''}`}></div>
          <span>
            {error ? 'API Connection Issues' : 'Connected to Results API'}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && electionSummary && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Some data may be outdated due to API issues: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Election Summary */}
      {electionSummary && <ElectionSummaryCard summary={electionSummary} />}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Candidates</span>
          </TabsTrigger>
          <TabsTrigger value="districts" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Districts</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Final Results - Top Candidates</span>
                  {candidates && (
                    <Badge variant="secondary" className="ml-auto">
                      {candidates.length} candidates
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates?.slice(0, 5).map((candidate: CandidateExportData, index: number) => ( 
                  <div key={candidate.candidateId} className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{candidate.candidateName}</span>
                        <span className="text-sm font-bold">{safePercentage(candidate.percentage)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={candidate.percentage || 0} className="flex-1" />
                        <span className="text-xs text-gray-600">{safeLocaleString(candidate.totalVotes)} votes</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="outline"
                          style={{ borderColor: candidate.partyColor, color: candidate.partyColor }}
                        >
                          {candidate.partyName}
                        </Badge>
                        <Badge variant="secondary">{safeNumber(candidate.districtsWon)} districts won</Badge>
                        {index === 0 && (
                          <Badge variant="default" className="bg-green-600">Winner</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No candidate data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vote Distribution Chart */}
            {candidates && <VoteDistributionChart candidates={candidates.slice(0, 6) as CandidateExportData[]} />}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {candidates ? (
            <CandidateResultsCard candidates={candidates as CandidateExportData[]} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No candidate data available</p>
              </CardContent>  
            </Card>
          )}
        </TabsContent>

        <TabsContent value="districts" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {candidates && districtAnalysis ? (
              <>
                <DistrictAnalysisCard districtAnalysis={districtAnalysis} candidates={candidates as CandidateExportData[]} />
                <DistrictMapView districtAnalysis={districtAnalysis} candidates={candidates as CandidateExportData[]} />
              </>
            ) : (
              <Card className="xl:col-span-2">    
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading district data...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnout Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Final Voter Turnout Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Registered Voters</span>
                    <span className="font-bold">17,140,354</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Votes Cast</span>
                    <span className="font-bold">{safeLocaleString(electionSummary?.totalVotes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Final Turnout Percentage</span>
                    <span className="font-bold text-green-600">
                      {electionSummary ? ((electionSummary.totalVotes / 17140354) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <Progress 
                    value={electionSummary ? (electionSummary.totalVotes / 17140354) * 100 : 0} 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Victory Margin Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Final Victory Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates?.slice(0, 3).map((candidate: CandidateExportData, index: number) => (
                    <div key={candidate.candidateId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: candidate.partyColor }}
                          />
                          <span className="font-medium">{candidate.candidateName}</span>
                          {index === 0 && <Badge className="bg-green-600">Winner</Badge>}
                        </div>
                        <span className="text-sm font-bold">{safePercentage(candidate.percentage)}%</span>
                      </div>
                      {index === 0 && candidates.length > 1 && (
                        <div className="text-sm text-green-600 font-medium pl-5">
                          Victory margin: {((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)).toFixed(2)}% 
                          ({safeLocaleString((candidates[0]?.totalVotes || 0) - (candidates[1]?.totalVotes || 0))} votes)
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No candidate data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* District Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>District Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {electionSummary?.totalDistrictsConsidered || 25}
                      </div>
                      <div className="text-sm text-blue-800">Total Districts</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {safeLocaleString(districtTotals?.grandTotal)}
                      </div>
                      <div className="text-sm text-green-800">Total District Votes</div>
                    </div>
                  </div>
                  
                  {/* Districts Won Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Final Districts Won</h4>
                    {candidates?.slice(0, 3).map((candidate: CandidateExportData) => (
                      <div key={candidate.candidateId} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: candidate.partyColor }}
                          />
                          <span className="text-sm font-medium">{candidate.candidateName}</span>
                        </div>
                        <div className="text-sm font-bold">{safeNumber(candidate.districtsWon)} districts</div>
                      </div>
                    )) || <div className="text-sm text-gray-500">No data available</div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Final Election Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates && candidates.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Winning Candidate</span>
                        <span className="font-bold text-green-600">{candidates[0]?.candidateName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Winning Percentage</span>
                        <span className="font-bold">{safePercentage(candidates[0]?.percentage)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Candidates</span>
                        <span className="font-bold">{candidates.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Election Status</span>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                      
                      {/* Competitive Analysis */}
                      {candidates.length > 1 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2">Final Competition Analysis</h4>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Margin over 2nd place: </span>
                              <span className="font-medium">
                                {((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)).toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Vote difference: </span>
                              <span className="font-medium">
                                {safeLocaleString((candidates[0]?.totalVotes || 0) - (candidates[1]?.totalVotes || 0))}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Victory type: </span>
                              <span className={`font-medium ${
                                ((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)) < 5 
                                  ? 'text-red-600' 
                                  : ((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)) < 10 
                                    ? 'text-yellow-600' 
                                    : 'text-green-600'
                              }`}>
                                {((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)) < 5 
                                  ? 'Narrow Victory' 
                                  : ((candidates[0]?.percentage || 0) - (candidates[1]?.percentage || 0)) < 10 
                                    ? 'Moderate Victory' 
                                    : 'Decisive Victory'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Loading performance data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <div className="text-center text-sm text-gray-500 py-4 border-t">
        <p>
          Results last updated: {lastRefresh.toLocaleString()} | 
          Election: {selectedElection.electionName} | 
          Status: Completed | 
          Data source: Results API v1
        </p>
        
        {candidates && (
          <p className="mt-1 text-xs">
            Final results for {candidates.length} candidates across {electionSummary?.totalDistrictsConsidered || 25} districts
          </p>
        )}
      </div>
    </div>
  );
}

// Main Results Page Component
export default function ResultsPage() {
  const [selectedElection, setSelectedElection] = useState<any>(null);

  const handleElectionSelect = (election: any) => {
    // Double-check that the election has ended before allowing results viewing
    if (hasElectionEnded(election)) {
      setSelectedElection(election);
    } else {
      alert('Results are only available for completed elections.');
    }
  };

  const handleBackToElections = () => {
    setSelectedElection(null);
  };

  if (selectedElection) {
    return (
      <ResultsDashboard 
        selectedElection={selectedElection} 
        onBack={handleBackToElections}
      />
    );
  }

  return (
    <ElectionSelection onElectionSelect={handleElectionSelect} />
  );
}
