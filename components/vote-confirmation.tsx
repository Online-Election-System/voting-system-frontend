"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Candidate } from "@/types/voter"

interface VoteConfirmationProps {
  selectedCandidate: Candidate | null
  onConfirm: () => void
  onGoBack: () => void
}

export function VoteConfirmation({ selectedCandidate, onConfirm, onGoBack }: VoteConfirmationProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Confirm Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedCandidate && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-800">
              <div className="text-6xl mb-4">{selectedCandidate.symbol}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedCandidate.nameEn}</h3>
              <p className="text-gray-600">Symbol: {selectedCandidate.symbolName}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">Are you sure you want to vote for this candidate?</p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onGoBack} className="flex-1 bg-transparent">
              No, Go Back
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
              Yes, Confirm Vote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
