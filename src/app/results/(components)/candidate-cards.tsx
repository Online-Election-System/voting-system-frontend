/* eslint-disable @next/next/no-img-element */
import type React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Crown, Trophy, Star, TrendingUp, Award } from "lucide-react"

// Use the TransformedCandidate type - make sure this matches your main page component
export interface TransformedCandidate {
  candidateId: string;
  image: string;
  id: string;
  name: string;
  party: string;
  popularVotes: number;
  color: string;
  electoralVotes?: number;
  isWinner?: boolean;
}

interface CandidateCardsProps {
  candidates: TransformedCandidate[];
  totalVotes: number;
}

export function CandidateCards({ candidates, totalVotes }: CandidateCardsProps) {
  // Sort candidates by electoral votes in descending order
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.electoralVotes ?? 0) - (a.electoralVotes ?? 0)
  );

  return (
    <>
      {sortedCandidates.map((candidate, index) => (
        <CandidateCard
          key={candidate.candidateId} // Use candidateId as the unique key
          candidate={candidate}
          totalVotes={totalVotes}
          isWinner={index === 0}
          position={index + 1}
        />
      ))}
    </>
  )
}

function CandidateCard({
  candidate,
  totalVotes,
  isWinner,
  position,
}: {
  candidate: TransformedCandidate
  totalVotes: number
  isWinner: boolean
  position: number
}) {
  const popularVotePercent = totalVotes > 0 ? (candidate.popularVotes / totalVotes) * 100 : 0

  if (isWinner) {
    return <WinnerCard candidate={candidate} totalVotes={totalVotes} popularVotePercent={popularVotePercent} />
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="h-2 w-full" style={{ backgroundColor: candidate.color }}></div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={candidate.image || "/placeholder.svg"}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {position}
            </div>
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
              <span className="text-sm font-bold">{candidate.electoralVotes ?? 0}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Popular Votes</span>
              <span className="text-sm font-medium">{popularVotePercent.toFixed(1)}%</span>
            </div>
            <Progress
              value={popularVotePercent}
              className="h-2"
              style={
                {
                  backgroundColor: "rgba(0,0,0,0.1)",
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

function WinnerCard({
  candidate,
  popularVotePercent,
}: {
  candidate: TransformedCandidate
  totalVotes: number
  popularVotePercent: number
}) {
  return (
    <Card className="overflow-hidden relative bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 border-2 border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-yellow-300 rounded-full opacity-10 animate-ping"></div>
      </div>
      {/* Winner ribbon */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-1 shadow-lg">
          WINNER
        </div>
      </div>
      {/* Top colored bar with special styling */}
      <div
  className="h-3 w-full relative"
  style={{
    background: `linear-gradient(90deg, ${candidate.color} 0%, ${candidate.color}dd 50%, ${candidate.color} 100%)`,
  }}
>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
</div>

      <CardHeader className="pb-2 pt-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="relative w-16 h-16 rounded-full overflow-hidden border-4 shadow-lg"
              style={{ borderColor: candidate.color }}
            >
              <img
                src={candidate.image || "/placeholder.svg"}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Winner crown */}
            <div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
              style={{ backgroundColor: candidate.color }}
            >
              <Crown className="w-4 h-4 text-white" />
            </div>
            {/* Position badge */}
            <div className="absolute -top-1 -left-1 w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
              1
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-800 uppercase tracking-wide">President Elect</span>
            </div>
            <h3 className="font-bold text-xl text-gray-900">{candidate.name}</h3>
            <p className="text-sm font-semibold" style={{ color: candidate.color }}>
              {candidate.party}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-5">
          {/* Electoral Votes - Special styling for winner */}
          <div className="bg-white/70 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-bold text-gray-700">Electoral Votes</span>
              </div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold" style={{ color: candidate.color }}>
              {candidate.electoralVotes ?? 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Seats Won</p>
          </div>
          {/* Popular Votes with enhanced styling */}
          <div className="bg-white/70 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-gray-700">Popular Votes</span>
              </div>
              <span className="text-lg font-bold text-green-600">{popularVotePercent.toFixed(1)}%</span>
            </div>
            {/* Enhanced progress bar */}
            <div className="relative">
              <Progress
                value={popularVotePercent}
                className="h-3 bg-gray-200"
                style={{
                  backgroundColor: "rgba(0,0,0,0.1)",
                  "--progress-foreground": `linear-gradient(90deg, ${candidate.color}, ${candidate.color}cc)`,
                } as React.CSSProperties}
                
              />
              {/* Glow effect */}
              <div
  className="absolute inset-0 h-3 rounded-full opacity-50 blur-sm"
  style={{
    background: `linear-gradient(90deg, transparent, ${candidate.color}44, transparent)`,
    width: `${popularVotePercent}%`,
  }}
></div>

            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-semibold text-gray-700">{candidate.popularVotes.toLocaleString()} votes</p>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-bold">Leading</span>
              </div>
            </div>
          </div>
          {/* Victory celebration message */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border border-yellow-300">
            <div className="flex items-center gap-2 text-center w-full justify-center">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-800">🎉 Congratulations on your victory! 🎉</span>
              <Trophy className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </CardContent>
      {/* Confetti-like decorative elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-bounce delay-300"></div>
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-yellow-500 rounded-full opacity-60 animate-bounce delay-700"></div>
 </Card>
 )
}