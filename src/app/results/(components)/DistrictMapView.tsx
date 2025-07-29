"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, MapPin } from "lucide-react"
import { SRI_LANKAN_DISTRICTS } from "@/app/results/types"
import type { DistrictWinnerAnalysis, CandidateExportData } from "@/app/results/types"

interface DistrictMapViewProps {
  districtAnalysis: DistrictWinnerAnalysis | null
  candidates: CandidateExportData[]
}

export function DistrictMapView({ candidates }: DistrictMapViewProps) {
  // Mock district winners for demonstration
  const mockDistrictWinners = SRI_LANKAN_DISTRICTS.reduce(
    (acc, district, index) => {
      const winnerIndex = index % 3 // Rotate between top 3 candidates
      const candidate = candidates[winnerIndex]
      if (candidate) {
        acc[district] = {
          candidateId: candidate.candidateId,
          candidateName: candidate.candidateName,
          votes: Math.floor(Math.random() * 500000) + 100000,
          margin: Math.floor(Math.random() * 20) + 5,
        }
      }
      return acc
    },
    {} as Record<string, { candidateId: string; candidateName: string; votes: number; margin: number }>,
  )

  const getDistrictColor = (district: string) => {
    const winner = mockDistrictWinners[district]
    if (!winner) return "#e5e7eb"

    const candidate = candidates.find((c) => c.candidateId === winner.candidateId)
    return candidate?.partyColor || "#e5e7eb"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Map className="h-5 w-5" />
          <span>District Map View</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {candidates.slice(0, 4).map((candidate) => (
            <Badge
              key={candidate.candidateId}
              variant="outline"
              style={{
                borderColor: candidate.partyColor,
                color: candidate.partyColor,
              }}
            >
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: candidate.partyColor }} />
              {candidate.candidateName}
            </Badge>
          ))}
        </div>

        {/* District Grid View */}
        <div className="grid grid-cols-5 gap-2">
          {SRI_LANKAN_DISTRICTS.map((district) => {
            const winner = mockDistrictWinners[district]
            const candidate = candidates.find((c) => c.candidateId === winner?.candidateId)

            return (
              <div key={district} className="relative group cursor-pointer">
                <div
                  className="w-full h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: getDistrictColor(district),
                    borderColor: candidate?.partyColor || "#e5e7eb",
                  }}
                >
                  {district}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold">{district}</div>
                  {winner && (
                    <>
                      <div>Winner: {winner.candidateName}</div>
                      <div>Votes: {winner.votes.toLocaleString()}</div>
                      <div>Margin: {winner.margin}%</div>
                    </>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* District Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">25</div>
            <div className="text-sm text-gray-600">Total Districts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Object.keys(mockDistrictWinners).length}</div>
            <div className="text-sm text-gray-600">Results Available</div>
          </div>
        </div>

        {/* Competitive Districts */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Most Competitive Districts</span>
          </h4>
          <div className="space-y-2">
            {SRI_LANKAN_DISTRICTS.slice(0, 5).map((district) => {
              const winner = mockDistrictWinners[district]
              const candidate = candidates.find((c) => c.candidateId === winner?.candidateId)

              return (
                <div key={district} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: candidate?.partyColor || "#e5e7eb" }}
                    />
                    <span className="font-medium">{district}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{winner?.candidateName}</div>
                    <div className="text-gray-600">Margin: {winner?.margin}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}