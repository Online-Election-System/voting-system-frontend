"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, MapPin, TrendingUp } from "lucide-react"
import type { ElectionSummary } from "@/app/results/types"

interface ElectionSummaryCardProps {
  summary: ElectionSummary
}

export function ElectionSummaryCard({ summary }: ElectionSummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-500 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Winner</p>
              <p className="text-lg font-bold text-yellow-900">{summary.winner}</p>
              <Badge className="bg-yellow-500 text-white mt-1">{summary.winnerPercentage.toFixed(2)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Votes</p>
              <p className="text-lg font-bold text-blue-900">{summary.totalVotes.toLocaleString()}</p>
              <p className="text-xs text-blue-700">Votes cast</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 p-3 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Candidates</p>
              <p className="text-lg font-bold text-green-900">{summary.totalCandidates}</p>
              <p className="text-xs text-green-700">Total candidates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-500 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Districts</p>
              <p className="text-lg font-bold text-purple-900">{summary.totalDistrictsConsidered}</p>
              <p className="text-xs text-purple-700">Districts covered</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}