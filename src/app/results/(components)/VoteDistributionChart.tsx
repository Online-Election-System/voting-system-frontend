"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart } from "lucide-react"
import type { CandidateExportData } from "@/app/results/types"

interface VoteDistributionChartProps {
  candidates: CandidateExportData[]
}

export function VoteDistributionChart({ candidates }: VoteDistributionChartProps) {
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.totalVotes, 0)

  // Calculate angles for pie chart
  let currentAngle = 0
  const chartData = candidates.map((candidate) => {
    const percentage = (candidate.totalVotes / totalVotes) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    currentAngle += angle

    return {
      ...candidate,
      percentage,
      angle,
      startAngle,
      endAngle: currentAngle,
    }
  })

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle)
    const end = polarToCartesian(centerX, centerY, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ")
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Vote Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {chartData.map((candidate) => (
                <path
                  key={candidate.candidateId}
                  d={createArcPath(150, 150, 120, candidate.startAngle, candidate.endAngle)}
                  fill={candidate.partyColor}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
              <circle cx="150" cy="150" r="60" fill="white" />
              <text x="150" y="145" textAnchor="middle" className="text-sm font-bold fill-gray-800">
                Total Votes
              </text>
              <text x="150" y="160" textAnchor="middle" className="text-xs fill-gray-600">
                {totalVotes.toLocaleString()}
              </text>
            </svg>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {chartData.map((candidate) => (
            <div key={candidate.candidateId} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: candidate.partyColor }} />
                <span className="text-sm font-medium">{candidate.candidateName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{candidate.percentage.toFixed(1)}%</span>
                <div className="text-xs text-gray-600">{candidate.totalVotes.toLocaleString()} votes</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}