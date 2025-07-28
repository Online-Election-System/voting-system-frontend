"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, MapPin, AlertTriangle, Download, RefreshCw, BarChart3, PieChart } from "lucide-react"
import { CandidateResultsCard } from "@/app/results/(components)/CandidateResultsCard"
import { DistrictAnalysisCard } from "@/app/results/(components)/DistrictAnalysisCard"
import { ElectionSummaryCard } from "@/app/results/(components)/ElectionSummaryCard"
import { ValidationCard } from "@/app/results/(components)/ValidationCard"
import { VoteDistributionChart } from "@/app/results/(components)/VoteDistributionChart"
import { DistrictMapView } from "@/app/results/(components)/DistrictMapView"

// Import the updated hooks with correct path and default election ID
import {
  useElectionSummary,
  useCandidateExportData,
  useDistrictWinners,
  useElectionValidation,
  useDistrictTotals,
  useRefreshCalculations,
  useBatchUpdateTotals,
  useElectionResults, // Added convenience hook
  useDistrictData,    // Added convenience hook  
  useAnalyticsData,   // Added convenience hook
  type ElectionSummary,
  type CandidateExportData,
  type DistrictWinnerAnalysis,
  type ValidationResult,
  type DistrictVoteTotals,
} from "@/app/results/hooks/useReslult" 

// Import the default election ID from config
import { DEFAULT_ELECTION_ID } from "@/app/results/lib/config/api"

export default function ElectionDashboard() {
  // Updated to use the correct election ID for your backend
  const electionId = DEFAULT_ELECTION_ID // This will be "PRE_2024"

  // State for better UX
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false)

  // Use the new hooks with default election ID (they'll use PRE_2024 by default)
  const { 
    data: electionSummary, 
    loading: summaryLoading, 
    error: summaryError, 
    refetch: refetchSummary 
  } = useElectionSummary()

  const { 
    data: candidates, 
    loading: candidatesLoading, 
    error: candidatesError, 
    refetch: refetchCandidates 
  } = useCandidateExportData()

  const { 
    data: districtAnalysis, 
    loading: districtLoading, 
    error: districtError, 
    refetch: refetchDistricts 
  } = useDistrictWinners()

  const { 
    data: validation, 
    loading: validationLoading, 
    error: validationError, 
    refetch: refetchValidation 
  } = useElectionValidation()

  const { 
    data: districtTotals, 
    loading: totalsLoading, 
    error: totalsError, 
    refetch: refetchTotals 
  } = useDistrictTotals()

  // Mutation hooks
  const { refreshCalculations, loading: refreshing, error: refreshError } = useRefreshCalculations()
  const { batchUpdate, loading: updating, error: updateError } = useBatchUpdateTotals()

  

  // Determine overall loading state
  const loading = summaryLoading || candidatesLoading || districtLoading || validationLoading || totalsLoading
  
  // Determine if there are any errors
  const error = summaryError || candidatesError || districtError || validationError || totalsError || refreshError || updateError

  const handleRefreshData = async () => {
    try {
      // Refresh calculations first
      await refreshCalculations()
      
      // Then refetch all data
      refetchSummary()
      refetchCandidates()
      refetchDistricts()
      refetchValidation()
      refetchTotals()
      
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Error refreshing data:", err)
    }
  }

  const handleBatchUpdate = async () => {
    try {
      await batchUpdate()
      // Refetch data after update
      refetchCandidates()
      refetchSummary()
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Error updating totals:", err)
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      electionId,
      electionSummary,
      candidates,
      districtAnalysis,
      validation,
      districtTotals,
      exportedAt: new Date().toISOString(),
      exportedBy: "Election Dashboard",
      version: "1.0"
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `election-${electionId}-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  if (loading && !electionSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-lg font-medium">Loading election data...</p>
            <p className="text-sm text-gray-600">Election ID: {electionId}</p>
            <p className="text-xs text-gray-500">Connecting to Results API...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !electionSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-medium text-red-800">Failed to load election data</p>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600">Election ID: {electionId}</p>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBatchUpdate}
                  className="bg-white border-red-300 text-red-700 hover:bg-red-50"
                  disabled={updating}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
                  {updating ? 'Updating...' : 'Update Totals'}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Election Results Dashboard</h1>
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
            Export Data
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${!error ? 'animate-pulse' : ''}`}></div>
          <span>
            {error ? 'API Connection Issues' : 'Connected to Results API - Live Data'}
            {autoRefresh && <span className="ml-1 text-green-600">(Auto-refresh ON)</span>}
          </span>
        </div>
      </div>

      {/* Show error alert if there are issues but we have some data */}
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

      {/* Validation Status */}
      {validation && <ValidationCard validation={validation} />}

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
                  <span>Top Candidates</span>
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
                        <span className="text-sm font-bold">{candidate.percentage.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={candidate.percentage} className="flex-1" />
                        <span className="text-xs text-gray-600">{candidate.totalVotes.toLocaleString()} votes</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="outline"
                          style={{ borderColor: candidate.partyColor, color: candidate.partyColor }}
                        >
                          {candidate.partyName}
                        </Badge>
                        <Badge variant="secondary">{candidate.districtsWon} districts won</Badge>
                        {!candidate.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No candidate data available</p>
                    <Button variant="outline" size="sm" onClick={handleRefreshData} className="mt-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
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
                <Button variant="outline" onClick={handleRefreshData} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Candidates
                </Button>
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
                  {districtLoading && (
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mt-2 text-blue-600" />
                  )}
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
                <CardTitle>Voter Turnout Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Registered Voters</span>
                    <span className="font-bold">17,140,354</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Votes Cast</span>
                    <span className="font-bold">{electionSummary?.totalVotes.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Turnout Percentage</span>
                    <span className="font-bold text-green-600">
                      {electionSummary ? ((electionSummary.totalVotes / 17140354) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <Progress 
                    value={electionSummary ? (electionSummary.totalVotes / 17140354) * 100 : 0} 
                    className="mt-2" 
                  />
                  
                  {/* Turnout Quality Indicator */}
                  {electionSummary && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Turnout Quality</span>
                        <Badge 
                          variant={
                            (electionSummary.totalVotes / 17140354) * 100 > 70 ? "default" :
                            (electionSummary.totalVotes / 17140354) * 100 > 50 ? "secondary" :
                            "destructive"
                          }
                        >
                          {(electionSummary.totalVotes / 17140354) * 100 > 70 ? "High" :
                           (electionSummary.totalVotes / 17140354) * 100 > 50 ? "Moderate" :
                           "Low"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Victory Margin Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Victory Margin Analysis</CardTitle>
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
                        </div>
                        <span className="text-sm font-bold">{candidate.percentage.toFixed(2)}%</span>
                      </div>
                      {index === 0 && candidates.length > 1 && (
                        <div className="text-sm text-green-600 font-medium pl-5">
                          Victory margin: {(candidates[0].percentage - candidates[1].percentage).toFixed(2)}% 
                          ({(candidates[0].totalVotes - candidates[1].totalVotes).toLocaleString()} votes)
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
                        {districtTotals?.GrandTotal.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-green-800">Total District Votes</div>
                    </div>
                  </div>
                  
                  {/* Districts Won Breakdown */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Districts Won by Top Candidates</h4>
                    {candidates?.slice(0, 3).map((candidate: CandidateExportData) => (
                      <div key={candidate.candidateId} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: candidate.partyColor }}
                          />
                          <span className="text-sm font-medium">{candidate.candidateName}</span>
                        </div>
                        <div className="text-sm font-bold">{candidate.districtsWon} districts</div>
                      </div>
                    )) || <div className="text-sm text-gray-500">No data available</div>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates && candidates.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Leading Candidate</span>
                        <span className="font-bold text-green-600">{candidates[0]?.candidateName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Winning Percentage</span>
                        <span className="font-bold">{candidates[0]?.percentage.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Candidates</span>
                        <span className="font-bold">{candidates.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Candidates</span>
                        <span className="font-bold">
                          {candidates.filter((c: CandidateExportData) => c.isActive).length}
                        </span>
                      </div>
                      
                      {/* Competitive Analysis */}
                      {candidates.length > 1 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2">Competitive Analysis</h4>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Margin over 2nd place: </span>
                              <span className="font-medium">
                                {(candidates[0].percentage - candidates[1].percentage).toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Vote difference: </span>
                              <span className="font-medium">
                                {(candidates[0].totalVotes - candidates[1].totalVotes).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Competition level: </span>
                              <span className={`font-medium ${
                                (candidates[0].percentage - candidates[1].percentage) < 5 
                                  ? 'text-red-600' 
                                  : (candidates[0].percentage - candidates[1].percentage) < 10 
                                    ? 'text-yellow-600' 
                                    : 'text-green-600'
                              }`}>
                                {(candidates[0].percentage - candidates[1].percentage) < 5 
                                  ? 'Highly Competitive' 
                                  : (candidates[0].percentage - candidates[1].percentage) < 10 
                                    ? 'Moderately Competitive' 
                                    : 'Clear Lead'
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
          Last updated: {lastRefresh.toLocaleString()} | 
          Election ID: {electionId} | 
          Data source: Results API v1 | 
          {autoRefresh ? 'Auto-refresh: ON (30s)' : 'Auto-refresh: OFF'}
        </p>
        {validation && (
          <p className="mt-1">
            Data validation: {validation.isValid ? '✅ Passed' : '❌ Failed'} | 
            Errors: {validation.errors.length} | 
            Candidates with issues: {
              validation.statistics.candidatesWithMismatchedTotals + 
              validation.statistics.candidatesWithNegativeVotes + 
              validation.statistics.candidatesWithMissingData
            }
          </p>
        )}
        {candidates && (
          <p className="mt-1 text-xs">
            Showing results for {candidates.length} candidates across {electionSummary?.totalDistrictsConsidered || 25} districts
          </p>
        )}
      </div>
    </div>
  )
}