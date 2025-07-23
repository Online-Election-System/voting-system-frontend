import { Card, CardContent } from "@/components/ui/card"



export interface ElectionStatsCardProps {
  statistics: {
    totalRegisteredVoters: number;
    totalVotesCast: number;
    turnoutPercentage: number;
    electionStatus: string;
  };
}

export function ElectionStatsCard({
  statistics,
}: ElectionStatsCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Election Statistics</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Registered Voters</span>
          <span className="font-semibold">{statistics.totalRegisteredVoters.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Votes Cast</span>
          <span className="font-semibold">{statistics.totalVotesCast.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Turnout</span>
          <span className="font-semibold">{statistics.turnoutPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Election Status</span>
          <span className="font-semibold">{statistics.electionStatus}</span>
        </div>
      </CardContent>
    </Card>
  )
}