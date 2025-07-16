"use client"

import { Button } from "@/components/ui/button"
import { Vote } from "lucide-react"
import { CandidateCard } from "./candidate-card"
import type { Candidate } from "@/types/voter"

interface VotingInterfaceProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  onSelectCandidate: (candidate: Candidate) => void
  onConfirmVote: () => void
  onResetSelection: () => void
}

export function VotingInterface({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onConfirmVote,
  onResetSelection,
}: VotingInterfaceProps) {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Presidential Election – Cast Your Vote</h1>
          <p className="text-lg text-gray-600">
            Please select one candidate from the list below. Tap the symbol to vote.
          </p>
        </div>

        <div className="grid gap-3 max-w-2xl mx-auto">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onSelect={onSelectCandidate}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onResetSelection} disabled={!selectedCandidate}>
            Reset Selection
          </Button>
          <Button
            onClick={onConfirmVote}
            disabled={!selectedCandidate}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            <Vote className="h-4 w-4 mr-2" />
            Confirm Vote
          </Button>
        </div>
      </div>
    </div>
  )
}
