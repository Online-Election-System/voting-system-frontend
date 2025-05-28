import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface Candidate {
  id: string
  name: string
  party: string
  electoralVotes: number
  popularVotes: number
  image: string
  color: string
}

interface CandidateCardsProps {
  candidates: Candidate[]
  totalVotes: number
}

export function CandidateCards({ candidates, totalVotes }: CandidateCardsProps) {
  // Sort candidates by electoral votes in descending order
  const sortedCandidates = [...candidates].sort((a, b) => b.electoralVotes - a.electoralVotes)

  return (
    <>
      {sortedCandidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} totalVotes={totalVotes} />
      ))}
    </>
  )
}

function CandidateCard({ candidate, totalVotes }: { candidate: Candidate; totalVotes: number }) {
  const popularVotePercent = (candidate.popularVotes / totalVotes) * 100

  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full" style={{ backgroundColor: candidate.color }}></div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border">
            <Image src={candidate.image || "/placeholder.svg"} alt={candidate.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{candidate.name}</h3>
            <p className="text-sm font-medium" style={{ color: candidate.color }}>
              {candidate.party}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Electoral Votes</span>
              <span className="text-sm font-medium">{candidate.electoralVotes}</span>
            </div>
            <Progress
              value={(candidate.electoralVotes / 225) * 100}
              className="h-2 bg-gray-100"
              indicatorClassName={`bg-[${candidate.color}]`}
              style={
                {
                  "--progress-background": "rgba(0,0,0,0.1)",
                  "--progress-foreground": candidate.color,
                } as React.CSSProperties
              }
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Popular Vote</span>
              <span className="text-sm font-medium">{popularVotePercent.toFixed(1)}%</span>
            </div>
            <Progress
              value={popularVotePercent}
              className="h-2 bg-gray-100"
              indicatorClassName={`bg-[${candidate.color}]`}
              style={
                {
                  "--progress-background": "rgba(0,0,0,0.1)",
                  "--progress-foreground": candidate.color,
                } as React.CSSProperties
              }
            />
            <p className="text-xs text-muted-foreground mt-1">{candidate.popularVotes.toLocaleString()} votes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
