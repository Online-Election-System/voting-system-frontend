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
import type {
  ElectionSummary,
  CandidateExportData,
  DistrictWinnerAnalysis,
  ValidationResult,
  DistrictVoteTotals,
  CandidateDistrictAnalysis,
} from "@/app/results/types"

export default function ElectionDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [electionSummary, setElectionSummary] = useState<ElectionSummary | null>(null)
  const [candidates, setCandidates] = useState<CandidateExportData[]>([])
  const [districtAnalysis, setDistrictAnalysis] = useState<DistrictWinnerAnalysis | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [districtTotals, setDistrictTotals] = useState<DistrictVoteTotals | null>(null)
  const [candidateDistrictData, setCandidateDistrictData] = useState<CandidateDistrictAnalysis[]>([])

  const electionId = "PRES2024" // Default election ID
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090"

  useEffect(() => {
    loadElectionData()
  }, [])

  const loadElectionData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch from API first, but fall back to mock data if it fails
      let useMockData = true

      try {
        // Test if API is available
        const testResponse = await fetch(`${apiUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        })
        if (testResponse.ok) {
          useMockData = false
        }
      } catch (apiError) {
        console.log("API not available, using mock data")
        useMockData = true
      }

      if (useMockData) {
        // Use mock data directly
        const mockSummary: ElectionSummary = {
          electionId,
          totalCandidates: 38,
          totalVotes: 17140354,
          winner: "Anura Kumara Dissanayake",
          winnerPercentage: 42.31,
          totalDistrictsConsidered: 25,
        }

        const mockCandidates: CandidateExportData[] = [
          {
            candidateId: "AKD",
            candidateName: "Anura Kumara Dissanayake",
            partyName: "National People's Power",
            partyColor: "#FF6B6B",
            totalVotes: 7251956,
            percentage: 42.31,
            position: 1,
            districtsWon: 21,
            isActive: true,
          },
          {
            candidateId: "SP",
            candidateName: "Sajith Premadasa",
            partyName: "Samagi Jana Balawegaya",
            partyColor: "#4ECDC4",
            totalVotes: 6863186,
            percentage: 40.04,
            position: 2,
            districtsWon: 4,
            isActive: true,
          },
          {
            candidateId: "RW",
            candidateName: "Ranil Wickremesinghe",
            partyName: "Independent",
            partyColor: "#45B7D1",
            totalVotes: 2299767,
            percentage: 13.42,
            position: 3,
            districtsWon: 0,
            isActive: true,
          },
          {
            candidateId: "NR",
            candidateName: "Namal Rajapaksa",
            partyName: "Sri Lanka Podujana Peramuna",
            partyColor: "#8B5CF6",
            totalVotes: 342781,
            percentage: 2.0,
            position: 4,
            districtsWon: 0,
            isActive: true,
          },
          {
            candidateId: "WD",
            candidateName: "Wijeyadasa Rajapakshe",
            partyName: "Independent",
            partyColor: "#F59E0B",
            totalVotes: 267551,
            percentage: 1.56,
            position: 5,
            districtsWon: 0,
            isActive: true,
          },
          {
            candidateId: "PS",
            candidateName: "P. Ariyanethran",
            partyName: "Tamil National Alliance",
            partyColor: "#EF4444",
            totalVotes: 48944,
            percentage: 0.29,
            position: 6,
            districtsWon: 0,
            isActive: true,
          },
        ]

        const mockValidation: ValidationResult = {
          isValid: true,
          errors: [],
          statistics: {
            candidatesWithMismatchedTotals: 0,
            candidatesWithNegativeVotes: 0,
            candidatesWithMissingData: 1,
          },
        }

        // Simulate loading delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setElectionSummary(mockSummary)
        setCandidates(mockCandidates)
        setValidation(mockValidation)
      } else {
        // Make actual API calls
        const [summaryRes, candidatesRes, districtRes, validationRes, totalsRes] = await Promise.all([
          fetch(`${apiUrl}/election/${electionId}/summary`),
          fetch(`${apiUrl}/election/${electionId}/candidates`),
          fetch(`${apiUrl}/election/${electionId}/district-winners`),
          fetch(`${apiUrl}/election/${electionId}/validation`),
          fetch(`${apiUrl}/election/${electionId}/district-totals`),
        ])

        if (!summaryRes.ok || !candidatesRes.ok) {
          throw new Error("Failed to fetch election data from API")
        }

        const summary = await summaryRes.json()
        const candidates = await candidatesRes.json()
        const validation = await validationRes.json()

        setElectionSummary(summary)
        setCandidates(candidates)
        setValidation(validation)
      }
    } catch (err) {
      console.error("Error loading election data:", err)
      setError("Unable to load election data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    const dataToExport = {
      electionSummary,
      candidates,
      districtAnalysis,
      validation,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `election-${electionId}-results.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-lg font-medium">Loading election data...</p>
            <p className="text-sm text-gray-600">Election ID: {electionId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
            <Button variant="outline" size="sm" onClick={loadElectionData} className="ml-4 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
          <p className="text-gray-600">Real-time analysis for {electionId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadElectionData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Using demo data - API connection not required</span>
        </div>
      </div>

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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates.slice(0, 5).map((candidate, index) => (
                  <div key={candidate.candidateId} className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
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
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vote Distribution Chart */}
            <VoteDistributionChart candidates={candidates.slice(0, 6)} />
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <CandidateResultsCard candidates={candidates} />
        </TabsContent>

        <TabsContent value="districts" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DistrictAnalysisCard districtAnalysis={districtAnalysis} candidates={candidates} />
            <DistrictMapView districtAnalysis={districtAnalysis} candidates={candidates} />
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
                    <span className="font-bold">{electionSummary?.totalVotes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Turnout Percentage</span>
                    <span className="font-bold text-green-600">76.8%</span>
                  </div>
                  <Progress value={76.8} className="mt-2" />
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
                  {candidates.slice(0, 3).map((candidate, index) => (
                    <div key={candidate.candidateId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{candidate.candidateName}</span>
                        <span className="text-sm">{candidate.percentage.toFixed(2)}%</span>
                      </div>
                      {index === 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Victory margin: {(candidates[0].percentage - candidates[1].percentage).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}