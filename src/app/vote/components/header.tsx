import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export function VotingHeader() {
  return (
    <Card className="mb-6">
      <CardHeader className="text-center bg-gray-800 text-white">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-8 w-8 mr-2" />
          <CardTitle className="text-2xl font-bold">Election Commission of Sri Lanka</CardTitle>
        </div>
        <p className="text-gray-100">Voter Validation System - Polling Officer Use Only</p>
      </CardHeader>
    </Card>
  )
}
