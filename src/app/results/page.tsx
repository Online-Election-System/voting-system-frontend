"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ElectoralMap } from "@/app/results/(components)/electoral-map"
import { CandidateCards } from "@/app/results/(components)/candidate-cards"
import { PopularVoteChart } from "@/app/results/(components)/popular-vote-chart"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { ElectionStatsCard } from "@/app/results/(components)/election-stats-card"
import type { 
  ElectionResultsOverview, 
  Candidate, 
  DistrictResult,
  ElectionSummary,
  Election,
  District
} from "@/app/results/types"

// Frontend-specific types for component compatibility
export interface TransformedCandidate {
  candidateId: string;  // null, undefined හරිම අවස්ථාවල නෙමෙයි, string දාල හොඳයි
  image: string;
  id: string;
  name: string;
  party: string;
  popularVotes: number;
  color: string;
  electoralVotes?: number;
  isWinner?: boolean;
}


export interface ElectionSummaryApiResponse {
  electionYear: number
  totalVotes: number
  lastUpdated: string
  candidates: {
    candidateId: string
    candidateName: string
    partyName: string
    electoralVotes: number
    popularVotes: number
    candidateImage: string
    partyColor: string
  }[]
  districts: {
    districtId: string
    districtName: string
    winningCandidateId: string
    totalVotes: number
  }[]
  statistics: {
    totalRegisteredVoters: number
    totalVotesCast: number
    turnoutPercentage: number
    electionStatus: string
  }
}

type CandidateCardsProps = {
  candidates: TransformedCandidate[];
  totalVotes: number;
}

// API Service for Ballerina backend
class ElectionApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/result/api/v1'
  }

  async getElectionSummary(electionId: string): Promise<ElectionSummaryApiResponse> {
    const response = await fetch(`${this.baseUrl}/election/${electionId}/summary`)
    if (!response.ok) {
      throw new Error(`Failed to fetch election summary: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return this.transformApiResponse(data, electionId)
  }

  async getElectionDetails(electionId: string): Promise<Election> {
    const response = await fetch(`${this.baseUrl}/election/${electionId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch election details: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async getDistrictResults(electionId: string): Promise<DistrictResult[]> {
    const response = await fetch(`${this.baseUrl}/election/${electionId}/districts`)
    if (!response.ok) {
      throw new Error(`Failed to fetch district results: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async getCandidates(electionId: string): Promise<Candidate[]> {
    const response = await fetch(`${this.baseUrl}/election/${electionId}/candidates`)
    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async getElectionWinner(electionId: string): Promise<{ winnerCandidateId: string }> {
    const response = await fetch(`${this.baseUrl}/election/${electionId}/winner`)
    if (!response.ok) {
      throw new Error(`Failed to fetch election winner: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  async getElectionStats(electionId: string): Promise<ElectionSummary> {
  const response = await fetch(`${this.baseUrl}/election/${electionId}/summary-stats`)
  if (!response.ok) {
    throw new Error(`Failed to fetch election stats: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async getDistricts(): Promise<District[]> {
  const response = await fetch(`${this.baseUrl}/districts`)
  if (!response.ok) {
    throw new Error(`Failed to fetch districts: ${response.status} ${response.statusText}`)
  }
  return response.json()
}


  // Transform Ballerina API response to match the component's expected format
  private transformApiResponse(apiData: any, electionId: string): ElectionSummaryApiResponse {
    // Handle different possible API response structures
    const candidates = apiData.candidates || apiData.data?.candidates || []
    const districts = apiData.districts || apiData.data?.districts || []
    const election = apiData.election || apiData.data?.election || {}
    const statistics = apiData.statistics || apiData.summary || apiData.data?.summary || {}

    // Calculate total votes from candidates if not provided
    const totalVotes = statistics.totalVotesCast || 
      candidates.reduce((sum: number, candidate: any) => 
        sum + (candidate.popularVotes || 0), 0) || 0

    return {
      electionYear: new Date(election.electionDate || election.date || Date.now()).getFullYear(),
      totalVotes,
      lastUpdated: new Date().toISOString(),
      candidates: candidates.map((candidate: any) => ({
        candidateId: candidate.candidateId || candidate.id,
        candidateName: candidate.candidateName || candidate.name,
        partyName: candidate.partyName || candidate.party,
        electoralVotes: candidate.electoralVotes || 0,
        popularVotes: candidate.popularVotes || 0,
        candidateImage: candidate.candidateImage || candidate.image || "/placeholder.svg?height=64&width=64",
        partyColor: candidate.partyColor || candidate.color || this.getPartyColor(candidate.partyName || candidate.party),
      })),
      districts: districts.map((district: any) => ({
        districtId: district.districtCode || district.districtId || district.id,
        districtName: district.districtName || district.name,
        winningCandidateId: district.winner || district.winningCandidateId || this.determineWinner(district),
        totalVotes: district.totalVotes || 0,
      })),
      statistics: {
        totalRegisteredVoters: statistics.totalRegisteredVoters || 17000000,
        totalVotesCast: totalVotes,
        turnoutPercentage: statistics.turnoutPercentage || 
          ((totalVotes / (statistics.totalRegisteredVoters || 17000000)) * 100),
        electionStatus: statistics.electionStatus || election.status || "Live",
      },
    }
  }

  private getPartyColor(partyName: string): string {
    const partyColors: Record<string, string> = {
      'National People\'s Power': '#dc2626',
      'NPP': '#dc2626',
      'Samagi Jana Balawegaya': '#16a34a', 
      'SJB': '#16a34a',
      'United National Party': '#2563eb',
      'UNP': '#2563eb',
      'Sri Lanka Podujana Peramuna': '#7c3aed',
      'SLPP': '#7c3aed',
      'Jathika Jana Balawegaya': '#f59e0b',
      'JJB': '#f59e0b',
    }
    return partyColors[partyName] || '#6b7280'
  }

  private determineWinner(district: any): string {
    // If API doesn't provide winner, try to determine from results
    if (district.results && Array.isArray(district.results)) {
      const winner = district.results.reduce((prev: any, current: any) => 
        (current.votes > prev.votes) ? current : prev
      )
      return winner.candidateId
    }
    return '1' // Default fallback
  }
}

// Configuration
const ELECTION_ID = process.env.NEXT_PUBLIC_ELECTION_ID || '2024-presidential'
const REFRESH_INTERVAL = 30000 // 30 seconds for live updates

export default function Page() {
  const [currentElectionData, setCurrentElectionData] = useState<ElectionSummaryApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const electionApi = new ElectionApiService()

  const fetchElectionData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const data = await electionApi.getElectionSummary(ELECTION_ID)
      setCurrentElectionData(data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching election data:', err)
      setError(err instanceof Error ? err.message : "Failed to load election data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchElectionData()
  }, [])

  // Auto-refresh for live updates
  useEffect(() => {
    if (!currentElectionData) return

    const interval = setInterval(() => {
      fetchElectionData(true)
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [currentElectionData])

  const handleManualRefresh = () => {
    fetchElectionData(true)
  }

  if (loading && !currentElectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading election data...
      </div>
    )
  }

  if (error && !currentElectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Failed to load election data</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Make sure your Ballerina backend is running on {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}
                </p>
                <button 
                  onClick={() => fetchElectionData()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentElectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 text-gray-600">
        <p>No election data available</p>
      </div>
    )
  }

  const transformCandidates = (candidates: ElectionSummaryApiResponse["candidates"]): TransformedCandidate[] => {
    return candidates.map((c) => ({
      candidateId: c.candidateId,  // මෙතන අනිවාර්යයෙන් එකතු කරන්න
      id: c.candidateId,           // මේක optional, තියන්න පුළුවන්
      name: c.candidateName,
      party: c.partyName,
      electoralVotes: c.electoralVotes,
      popularVotes: c.popularVotes,
      image: c.candidateImage || "/placeholder.svg?height=64&width=64",
      color: c.partyColor || "#6b7280",
    }))
  }
  

  const transformedCandidates = transformCandidates(currentElectionData.candidates)
  const totalVotes = currentElectionData.totalVotes

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Sri Lanka Presidential Election {currentElectionData.electionYear}
            </h1>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
             <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />

            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              currentElectionData.statistics.electionStatus === 'Live' ? 'bg-red-500 animate-pulse' : 
              currentElectionData.statistics.electionStatus === 'Final' ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <p className="text-lg text-gray-600">
              {currentElectionData.statistics.electionStatus} Results Dashboard
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span>Total Votes: {totalVotes.toLocaleString()}</span>
            <span>•</span>
            <span>{currentElectionData.districts.length} Electoral Districts</span>
            <span>•</span>
            <span>
              Turnout: {currentElectionData.statistics.turnoutPercentage.toFixed(1)}%
            </span>
            {lastRefresh && (
              <>
                <span>•</span>
                <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Error banner for refresh errors */}
        {error && currentElectionData && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Unable to refresh data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidates */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Presidential Candidates</CardTitle>
            <CardDescription>Ranked by electoral votes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CandidateCards candidates={transformedCandidates} totalVotes={totalVotes} />
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">District Results</CardTitle>
            <CardDescription>
              Click on districts to see detailed results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ElectoralMap
              data={{
                candidates: transformedCandidates,
                districts: currentElectionData.districts,
              }}
            />
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Election Summary</CardTitle>
            <CardDescription>Popular vote analysis and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularVoteChart data={{ candidates: transformedCandidates, totalVotes }} />
          </CardContent>
        </Card>

        {/* Stats */}
        <ElectionStatsCard statistics={currentElectionData.statistics} />

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Election Commission of Sri Lanka • {currentElectionData.electionYear}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data provided via Ballerina Election API • Auto-refreshes every {REFRESH_INTERVAL/1000} seconds
          </p>
        </div>
      </div>
    </div>
)
}