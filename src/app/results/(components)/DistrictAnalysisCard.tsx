"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Trophy, TrendingUp } from "lucide-react"
import { SRI_LANKAN_DISTRICTS } from "../types"
import type { DistrictWinnerAnalysis, CandidateExportData } from "../types"

interface DistrictAnalysisCardProps {
  districtAnalysis: DistrictWinnerAnalysis | null
  candidates: CandidateExportData[]
}

export function DistrictAnalysisCard({ districtAnalysis, candidates }: DistrictAnalysisCardProps) {
  if (!districtAnalysis) return <div>No data available</div>;

  const { districtWinners } = districtAnalysis;

  // Calculate how many districts each candidate won
  const districtWinnerCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.candidateId] = Object.values(districtWinners).filter(
      (winner) => winner.candidateId === candidate.candidateId
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>District Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* District Winners Summary */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span>Districts Won by Candidate</span>
          </h3>
          {candidates.slice(0, 5).map((candidate) => (
            <div key={candidate.candidateId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    style={{
                      backgroundColor: candidate.partyColor + "20",
                      borderColor: candidate.partyColor,
                      color: candidate.partyColor,
                    }}
                  >
                    {candidate.candidateName}
                  </Badge>
                </div>
                <span className="font-bold">{districtWinnerCounts[candidate.candidateId] || 0} districts</span>
              </div>
              <Progress value={((districtWinnerCounts[candidate.candidateId] || 0) / 25) * 100} className="h-2" />
            </div>
          ))}
        </div>

        {/* Top Performing Districts */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>District Results</span>
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {Object.keys(districtWinners).slice(0, 10).map((district) => {
              const winner = districtWinners[district];
              const candidate = candidates.find((c) => c.candidateId === winner?.candidateId);
              return (
                <div key={district} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <span className="font-medium">{district}</span>
                    {winner && <p className="text-sm text-gray-600">Winner: {winner.candidateName}</p>}
                  </div>
                  <div className="text-right">
                    {winner && (
                      <>
                        <p className="text-sm font-bold">{winner.votes.toLocaleString()} votes</p>
                        {candidate && (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: candidate.partyColor + "20",
                              borderColor: candidate.partyColor,
                              color: candidate.partyColor,
                            }}
                          >
                            {candidate.partyName}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}