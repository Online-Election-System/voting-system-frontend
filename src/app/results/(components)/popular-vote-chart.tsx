"use client"

interface PopularVoteChartProps {
  data: any
}

export function PopularVoteChart({ data }: PopularVoteChartProps) {
  // Sort candidates by popular votes in descending order
  const sortedCandidates = [...data.candidates].sort((a, b) => b.popularVotes - a.popularVotes)

  return (
    <div className="space-y-6">
      <div className="h-16 flex rounded-lg overflow-hidden">
        {sortedCandidates.map((candidate) => {
          const percent = (candidate.popularVotes / data.totalVotes) * 100

          return (
            <div
              key={candidate.id}
              className="flex items-center justify-center text-white font-medium"
              style={{
                backgroundColor: candidate.color,
                width: `${percent}%`,
                minWidth: percent > 1 ? "auto" : "0",
              }}
            >
              {percent > 5 ? `${percent.toFixed(1)}%` : ""}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCandidates.map((candidate) => {
          const percent = (candidate.popularVotes / data.totalVotes) * 100

          return (
            <div key={candidate.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: candidate.color }}></div>
                <span className="font-medium">{candidate.name}</span>
              </div>
              <p className="text-2xl font-bold">{candidate.popularVotes.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{percent.toFixed(1)}% of total votes</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
