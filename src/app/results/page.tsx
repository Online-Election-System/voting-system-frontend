"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ElectoralMap } from "@/app/results/(components)/electoral-map"
import { CandidateCards } from "@/app/results/(components)/candidate-cards"
import { PopularVoteChart } from "@/app/results/(components)/popular-vote-chart"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { ElectionStatsCard } from "@/app/results/(components)/election-stats-card"

// Import your fixed API configuration
import { API_CONFIG, ENDPOINTS } from "@/app/results/lib/config/api"

// Backend types (matching your Ballerina types exactly)
interface BackendCandidate {
  candidateId: string;
  electionId: string;
  candidateName: string;
  partyName: string;
  partySymbol?: string;
  partyColor: string;
  candidateImage?: string;
  popularVotes: number;
  electoralVotes: number;
  position?: number;
  isActive: boolean;
}

interface BackendDistrictResult {
  districtCode: string;
  electionId: string;
  districtName: string;
  totalVotes: number;
  votesProcessed: number;
  winner?: string;
  status: string;
}

interface BackendElectionSummary {
  electionId: string;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  totalRejectedVotes: number;
  turnoutPercentage: number;
  winnerCandidateId?: string;
  electionStatus: string;
}

interface BackendElection {
  id: string;
  electionName: string;
  description: string;
  startDate: string;
  enrolDdl: string;
  electionDate: string;
  endDate: string;
  noOfCandidates: number;
  electionType: string;
  startTime: string;
  endTime: string;
  status: string;
}

// Frontend component types
export interface TransformedCandidate {
  candidateId: string;
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
  candidates: TransformedCandidate[]
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

// API Service for Ballerina backend
class ElectionApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
  }

  async getElectionSummary(electionId: string): Promise<ElectionSummaryApiResponse> {
    try {
      // Try to get the complete summary from your backend
      const summaryResponse = await this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.ELECTIONS.SUMMARY(electionId)}`)
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        return this.transformBackendSummaryResponse(summaryData, electionId)
      }

      // Fallback: fetch data separately if summary endpoint doesn't exist
      console.log('Summary endpoint not available, fetching data separately...')
      
      const [candidatesResponse, electionResponse, statsResponse] = await Promise.all([
        this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.CANDIDATES.BY_ELECTION(electionId)}`),
        this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.ELECTIONS.BY_ID(electionId)}`),
        this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.ELECTIONS.SUMMARY_STATS(electionId)}`).catch(() => null)
      ])

      if (!candidatesResponse.ok) {
        throw new Error(`Failed to fetch candidates: ${candidatesResponse.status}`)
      }
      if (!electionResponse.ok) {
        throw new Error(`Failed to fetch election: ${electionResponse.status}`)
      }

      const candidates: BackendCandidate[] = await candidatesResponse.json()
      const election: BackendElection = await electionResponse.json()
      const stats: BackendElectionSummary | null = statsResponse?.ok ? await statsResponse.json() : null

      // Try to get district results
      let districts: BackendDistrictResult[] = []
      try {
        const districtsResponse = await this.fetchWithTimeout(`${this.baseUrl}${ENDPOINTS.ELECTIONS.DISTRICTS(electionId)}`)
        if (districtsResponse.ok) {
          districts = await districtsResponse.json()
        }
      } catch (e) {
        console.log('Districts endpoint not available')
      }

      return this.transformSeparateResponses(candidates, election, stats, districts)

    } catch (error) {
      console.error('Error fetching election data:', error)
      throw error
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private transformBackendSummaryResponse(data: any, electionId: string): ElectionSummaryApiResponse {
    // Handle your backend's ElectionSummaryResponse structure
    const candidates = data.candidates || []
    const districts = data.districts || []
    const statistics = data.statistics || {}
    
    return {
      electionYear: new Date().getFullYear(),
      totalVotes: data.totalVotes || candidates.reduce((sum: number, c: any) => sum + (c.popularVotes || 0), 0),
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      candidates: this.transformCandidates(candidates),
      districts: this.transformDistricts(districts),
      statistics: {
        totalRegisteredVoters: statistics.totalRegisteredVoters || 17000000,
        totalVotesCast: statistics.totalVotesCast || data.totalVotes || 0,
        turnoutPercentage: statistics.turnoutPercentage || 0,
        electionStatus: statistics.electionStatus || 'Live',
      },
    }
  }

  private transformSeparateResponses(
    candidates: BackendCandidate[], 
    election: BackendElection, 
    stats: BackendElectionSummary | null, 
    districts: BackendDistrictResult[]
  ): ElectionSummaryApiResponse {
    const totalVotes = candidates.reduce((sum, c) => sum + (c.popularVotes || 0), 0)
    
    return {
      electionYear: new Date(election.electionDate).getFullYear(),
      totalVotes,
      lastUpdated: new Date().toISOString(),
      candidates: this.transformCandidates(candidates),
      districts: this.transformDistricts(districts),
      statistics: {
        totalRegisteredVoters: stats?.totalRegisteredVoters || 17000000,
        totalVotesCast: stats?.totalVotesCast || totalVotes,
        turnoutPercentage: stats?.turnoutPercentage || ((totalVotes / 17000000) * 100),
        electionStatus: stats?.electionStatus || election.status || 'Live',
      },
    }
  }

  private transformCandidates(candidates: BackendCandidate[]): TransformedCandidate[] {
    return candidates.map((c) => ({
      candidateId: c.candidateId,
      id: c.candidateId,
      name: c.candidateName,
      party: c.partyName,
      electoralVotes: c.electoralVotes || 0,
      popularVotes: c.popularVotes || 0,
      image: c.candidateImage || "/placeholder.svg?height=64&width=64",
      color: c.partyColor || this.getPartyColor(c.partyName),
    }))
  }

  private transformDistricts(districts: BackendDistrictResult[]) {
    return districts.map((d) => ({
      districtId: d.districtCode,
      districtName: d.districtName,
      winningCandidateId: d.winner || '',
      totalVotes: d.totalVotes || 0,
    }))
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
}

// Configuration
const ELECTION_ID = process.env.NEXT_PUBLIC_ELECTION_ID || 'elec-2020'
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
                  Make sure your Ballerina backend is running on {API_CONFIG.BASE_URL}
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

  const transformedCandidates = currentElectionData.candidates
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