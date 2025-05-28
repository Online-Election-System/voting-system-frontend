import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface Candidate {
  name: string
  electoralVotes: number
  popularVotes: number
  image: string
}

interface CandidateCardProps {
  candidate: Candidate
  party: "democrat" | "republican"
}

export function CandidateCard({ candidate, party }: CandidateCardProps) {
  const partyColor = party === "democrat" ? "bg-blue-500" : "bg-red-500"
  const partyLightColor = party === "democrat" ? "bg-blue-100" : "bg-red-100"
  const partyTextColor = party === "democrat" ? "text-blue-700" : "text-red-700"
  const partyName = party === "democrat" ? "Democratic" : "Republican"

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${partyColor}`}></div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border">
            <Image src={candidate.image || "/placeholder.svg"} alt={candidate.name} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{candidate.name}</h3>
            <p className={`text-sm font-medium ${partyTextColor}`}>{partyName} Party</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Electoral Votes</span>
              <span className="text-sm font-medium">{candidate.electoralVotes}/538</span>
            </div>
            <Progress
              value={(candidate.electoralVotes / 538) * 100}
              className={`h-2 ${partyLightColor}`}
              indicatorClassName={partyColor}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Popular Vote</span>
              <span className="text-sm font-medium">{Math.round((candidate.popularVotes / 150000000) * 100)}%</span>
            </div>
            <Progress
              value={(candidate.popularVotes / 150000000) * 100}
              className={`h-2 ${partyLightColor}`}
              indicatorClassName={partyColor}
            />
            <p className="text-xs text-muted-foreground mt-1">{candidate.popularVotes.toLocaleString()} votes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
