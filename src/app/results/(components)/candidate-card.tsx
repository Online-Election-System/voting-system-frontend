import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Users, Vote } from "lucide-react"
// Ensure TransformedCandidate is exported from "@/app/results/types"
// If not, update the import to use the correct type name, e.g. CandidateType
import type { TransformedCandidate } from "@/app/results/types"
// If the correct type is CandidateType, use:
// import type { CandidateType } from "@/app/results/types"



interface CandidateCardsProps {
  candidates: TransformedCandidate[]
  totalVotes: number
}

export function CandidateCards({ candidates, totalVotes }: CandidateCardsProps) {
  const sortedCandidates = [...candidates].sort(
  (a, b) => (b.electoralVotes ?? 0) - (a.electoralVotes ?? 0)
);

  return (
    <>
      {sortedCandidates.map((candidate, index) => {
        const votePercentage = ((candidate.popularVotes / totalVotes) * 100).toFixed(1)
        const isWinner = index === 0

        return (
          <Card
            key={candidate.id}
            className={`relative transition-all hover:shadow-md ${
              isWinner ? "ring-2 ring-yellow-400 bg-yellow-50" : ""
            }`}
          >
            {isWinner && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-yellow-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Winner
                </Badge>
              </div>
            )}

            <CardContent className="p-4 text-center space-y-3">
              <Avatar className="w-16 h-16 mx-auto">
                <AvatarImage src={candidate.image || "/placeholder.svg"} alt={candidate.name} />
                <AvatarFallback style={{ backgroundColor: candidate.color, color: "white" }}>
                  {candidate.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg text-gray-900">{candidate.name}</h3>
                <p className="text-sm text-gray-600">{candidate.party}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Vote className="w-4 h-4 text-blue-600" />
                  <span className="text-xl font-bold text-blue-600">{candidate.electoralVotes}</span>
                  <span className="text-sm text-gray-500">electoral</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    {candidate.popularVotes.toLocaleString()}
                  </span>
                </div>

                <div className="text-sm text-gray-600">{votePercentage}% of popular vote</div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${votePercentage}%`,
                    backgroundColor: candidate.color,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
