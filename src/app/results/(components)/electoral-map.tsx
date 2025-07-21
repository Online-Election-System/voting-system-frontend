import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TransformedCandidate } from "@/types/election"

interface ElectoralMapProps {
  data: {
    candidates: TransformedCandidate[]
    districts: {
      districtId: string
      districtName: string
      winningCandidateId: string
      totalVotes: number
    }[]
  }
}

export function ElectoralMap({ data }: ElectoralMapProps) {
  const { candidates, districts } = data

  const getWinningCandidate = (candidateId: string) => {
    return candidates.find((c) => c.id === candidateId)
  }

  const getCandidateStats = () => {
    const stats = candidates.map((candidate) => ({
      ...candidate,
      districtsWon: districts.filter((d) => d.winningCandidateId === candidate.id).length,
    }))
    return stats.sort((a, b) => b.districtsWon - a.districtsWon)
  }

  const candidateStats = getCandidateStats()

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {candidateStats.map((candidate) => (
          <Card key={candidate.id} className="text-center">
            <CardContent className="p-4">
              <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: candidate.color }} />
              <div className="font-semibold text-sm">{candidate.name}</div>
              <div className="text-2xl font-bold" style={{ color: candidate.color }}>
                {candidate.districtsWon}
              </div>
              <div className="text-xs text-gray-500">districts won</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* District Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {districts.map((district) => {
          const winner = getWinningCandidate(district.winningCandidateId)
          return (
            <Card key={district.districtId} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 text-center">
                <div className="w-full h-2 rounded-full mb-2" style={{ backgroundColor: winner?.color || "#6b7280" }} />
                <div className="font-medium text-sm text-gray-900">{district.districtName}</div>
                <div className="text-xs text-gray-600 mt-1">{district.totalVotes.toLocaleString()} votes</div>
                {winner && (
                  <Badge
                    variant="secondary"
                    className="mt-2 text-xs"
                    style={{
                      backgroundColor: `${winner.color}20`,
                      color: winner.color,
                      border: `1px solid ${winner.color}40`,
                    }}
                  >
                    {winner.name.split(" ")[0]}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: candidate.color }} />
            <span className="text-sm text-gray-700">{candidate.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
