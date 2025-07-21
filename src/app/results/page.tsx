"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ElectoralMap } from "@/app/results/(components)/electoral-map"
import { CandidateCards } from "@/app/results/(components)/candidate-cards"
import { PopularVoteChart } from "@/app/results/(components)/popular-vote-chart"
import { Loader2 } from "lucide-react"
// Update the import path to the correct location of your types file
// Update the import path to the correct location of your types file
import type { ElectionSummaryResponse, TransformedCandidate } from "@/app/results/types"

// Mock data to simulate API response
const mockElectionData: ElectionSummaryResponse = {
  electionYear: 2024,
  totalVotes: 12500000,
  lastUpdated: new Date().toISOString(),
  candidates: [
    {
      candidateId: "1",
      candidateName: "Anura Kumara Dissanayake",
      partyName: "National People's Power",
      electoralVotes: 145,
      popularVotes: 5200000,
      candidateImage: "/placeholder.svg?height=64&width=64",
      partyColor: "#dc2626",
    },
    {
      candidateId: "2",
      candidateName: "Sajith Premadasa",
      partyName: "Samagi Jana Balawegaya",
      electoralVotes: 89,
      popularVotes: 4100000,
      candidateImage: "/placeholder.svg?height=64&width=64",
      partyColor: "#16a34a",
    },
    {
      candidateId: "3",
      candidateName: "Ranil Wickremesinghe",
      partyName: "United National Party",
      electoralVotes: 52,
      popularVotes: 2800000,
      candidateImage: "/placeholder.svg?height=64&width=64",
      partyColor: "#2563eb",
    },
    {
      candidateId: "4",
      candidateName: "Namal Rajapaksa",
      partyName: "Sri Lanka Podujana Peramuna",
      electoralVotes: 28,
      popularVotes: 400000,
      candidateImage: "/placeholder.svg?height=64&width=64",
      partyColor: "#7c3aed",
    },
  ],
  districts: [
    { districtId: "1", districtName: "Colombo", winningCandidateId: "1", totalVotes: 1200000 },
    { districtId: "2", districtName: "Gampaha", winningCandidateId: "2", totalVotes: 1100000 },
    { districtId: "3", districtName: "Kalutara", winningCandidateId: "1", totalVotes: 650000 },
    { districtId: "4", districtName: "Kandy", winningCandidateId: "1", totalVotes: 800000 },
    { districtId: "5", districtName: "Matale", winningCandidateId: "2", totalVotes: 300000 },
    { districtId: "6", districtName: "Nuwara Eliya", winningCandidateId: "3", totalVotes: 450000 },
    { districtId: "7", districtName: "Galle", winningCandidateId: "1", totalVotes: 700000 },
    { districtId: "8", districtName: "Matara", winningCandidateId: "2", totalVotes: 500000 },
    { districtId: "9", districtName: "Hambantota", winningCandidateId: "1", totalVotes: 350000 },
    { districtId: "10", districtName: "Jaffna", winningCandidateId: "2", totalVotes: 400000 },
    { districtId: "11", districtName: "Kilinochchi", winningCandidateId: "2", totalVotes: 80000 },
    { districtId: "12", districtName: "Mannar", winningCandidateId: "3", totalVotes: 60000 },
    { districtId: "13", districtName: "Vavuniya", winningCandidateId: "1", totalVotes: 120000 },
    { districtId: "14", districtName: "Mullaitivu", winningCandidateId: "2", totalVotes: 70000 },
    { districtId: "15", districtName: "Batticaloa", winningCandidateId: "1", totalVotes: 300000 },
    { districtId: "16", districtName: "Ampara", winningCandidateId: "2", totalVotes: 400000 },
    { districtId: "17", districtName: "Trincomalee", winningCandidateId: "1", totalVotes: 250000 },
    { districtId: "18", districtName: "Kurunegala", winningCandidateId: "1", totalVotes: 900000 },
    { districtId: "19", districtName: "Puttalam", winningCandidateId: "2", totalVotes: 450000 },
    { districtId: "20", districtName: "Anuradhapura", winningCandidateId: "1", totalVotes: 500000 },
    { districtId: "21", districtName: "Polonnaruwa", winningCandidateId: "1", totalVotes: 250000 },
    { districtId: "22", districtName: "Badulla", winningCandidateId: "2", totalVotes: 500000 },
    { districtId: "23", districtName: "Moneragala", winningCandidateId: "1", totalVotes: 280000 },
    { districtId: "24", districtName: "Ratnapura", winningCandidateId: "1", totalVotes: 650000 },
    { districtId: "25", districtName: "Kegalle", winningCandidateId: "2", totalVotes: 500000 },
  ],
  statistics: {
    totalRegisteredVoters: 17000000,
    totalVotesCast: 12500000,
    turnoutPercentage: 73.5,
    electionStatus: "Final",
  },
}

export default function Page() {
  const [currentElectionData, setCurrentElectionData] = useState<ElectionSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true)
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setCurrentElectionData(mockElectionData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchElectionData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading...
      </div>
    )
  }

  if (error || !currentElectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 text-red-600">
        <p>
          ⚠️ Failed to load data. <br />
          {error || "Unknown error"} <br />
          Make sure your Ballerina backend is running.
        </p>
      </div>
    )
  }

  const transformCandidates = (candidates: ElectionSummaryResponse["candidates"]): TransformedCandidate[] => {
    return candidates.map((c) => ({
      id: c.candidateId,
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
          <h1 className="text-4xl font-bold text-gray-900">
            Sri Lanka Presidential Election {currentElectionData.electionYear}
          </h1>
          <p className="text-lg text-gray-600">Live Results Dashboard</p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span>Total Votes: {totalVotes.toLocaleString()}</span>
            <span>•</span>
            <span>{currentElectionData.districts.length} Electoral Districts</span>
            <span>•</span>
            <span>Last Updated: {new Date(currentElectionData.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>

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
            <CardDescription>Popular vote analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularVoteChart data={{ candidates: transformedCandidates, totalVotes }} />
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Election Statistics</CardTitle>
            <CardDescription>Overall metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl text-blue-600 font-bold">
                  {currentElectionData.statistics.totalRegisteredVoters.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Registered Voters</div>
              </div>
              <div>
                <div className="text-2xl text-green-600 font-bold">
                  {currentElectionData.statistics.totalVotesCast.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Votes Cast</div>
              </div>
              <div>
                <div className="text-2xl text-purple-600 font-bold">
                  {currentElectionData.statistics.turnoutPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Turnout</div>
              </div>
              <div>
                <div className="text-2xl text-orange-600 font-bold">
                  {currentElectionData.statistics.electionStatus}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">Election Commission of Sri Lanka • {currentElectionData.electionYear}</p>
        </div>
      </div>
    </div>
  )
}
