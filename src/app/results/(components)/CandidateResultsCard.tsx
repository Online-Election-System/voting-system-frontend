"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Search, Medal, TrendingUp, MapPin } from "lucide-react"
import type { CandidateExportData } from "@/app/results/types"

interface CandidateResultsCardProps {
  candidates: CandidateExportData[]
}

export function CandidateResultsCard({ candidates }: CandidateResultsCardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"votes" | "percentage" | "districts">("votes")

  const filteredCandidates = candidates
    .filter(
      (candidate) =>
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.partyName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.totalVotes - a.totalVotes
        case "percentage":
          return b.percentage - a.percentage
        case "districts":
          return b.districtsWon - a.districtsWon
        default:
          return a.position - b.position
      }
    })

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Medal className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{position}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Candidate Results</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex space-x-1">
              <Button variant={sortBy === "votes" ? "default" : "outline"} size="sm" onClick={() => setSortBy("votes")}>
                Votes
              </Button>
              <Button
                variant={sortBy === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("percentage")}
              >
                %
              </Button>
              <Button
                variant={sortBy === "districts" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("districts")}
              >
                Districts
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.candidateId}
              className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12">{getPositionIcon(candidate.position)}</div>

              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.candidateImage || "/placeholder.svg"} alt={candidate.candidateName} />
                <AvatarFallback>
                  {candidate.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.candidateName}</h3>
                    <p className="text-sm text-gray-600">{candidate.partyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{candidate.percentage.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">{candidate.totalVotes.toLocaleString()} votes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    value={candidate.percentage}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: candidate.partyColor,
                          color: candidate.partyColor,
                        }}
                      >
                        {candidate.partyName}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">{candidate.districtsWon} districts won</span>
                      </div>
                    </div>
                    <div className="text-gray-500">Rank #{candidate.position}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No candidates found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}