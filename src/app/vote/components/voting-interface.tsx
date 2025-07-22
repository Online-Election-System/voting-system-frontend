"use client"

import { Button } from "@/components/ui/button"
import { Vote, ArrowLeft, RotateCcw } from "lucide-react"
import { CandidateCard } from "@/src/app/vote/components/candidate-card"
import type { Candidate } from "@/src/app/vote/types/voter"

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
  
  // Helper function to get candidate name
  const getCandidateName = (candidate: Candidate) => {
    return candidate.candidateName || candidate.candidateName || "Unknown Candidate"
  }

  // Helper function to get party symbol
  const getPartySymbol = (candidate: Candidate) => {
    return candidate.partySymbol || candidate.partySymbol || "🗳️"
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Presidential Election – Cast Your Vote
          </h1>
          <p className="text-lg text-gray-600">
            Please select one candidate from the list below. Tap the candidate card to vote.
          </p>
          
          {/* Candidates count */}
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Vote className="h-4 w-4 mr-1" />
            {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Available
          </div>
        </div>

        {/* Debug info for candidates */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p className="font-bold mb-2">Debug Info:</p>
            <p>Candidates loaded: {candidates.length}</p>
            <p>Selected: {selectedCandidate ? getCandidateName(selectedCandidate) : 'None'}</p>
          </div>
        )}

        {/* Candidates List */}
        <div className="grid gap-3 max-w-2xl mx-auto mb-8">
          {candidates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Vote className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No candidates available</p>
              <p className="text-sm">Please check back later or contact election officials</p>
            </div>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.candidateId || candidate.candidateId}
                candidate={candidate}
                isSelected={selectedCandidate?.candidateId === candidate.candidateId || 
                           selectedCandidate?.candidateId === candidate.candidateId}
                onSelect={onSelectCandidate}
              />
            ))
          )}
        </div>

        {/* Selected Candidate Info */}
        {selectedCandidate && (
          <div className="mt-8 text-center bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Selected Candidate</h2>
            
            <div className="flex flex-col items-center gap-3">
              {/* Candidate Image or Symbol */}
              {selectedCandidate.candidateImage || selectedCandidate.candidateImage ? (
                <img 
                  src={selectedCandidate.candidateImage || selectedCandidate.candidateImage} 
                  alt={getCandidateName(selectedCandidate)}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-300"
                />
              ) : (
                <div className="text-6xl">{getPartySymbol(selectedCandidate)}</div>
              )}
              
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800 mb-1">
                  {getCandidateName(selectedCandidate)}
                </div>
                <div className="text-gray-600">
                  {selectedCandidate.partyName || selectedCandidate.partyName || "Independent"}
                </div>
              </div>

              {/* Party Color Indicator */}
              {(selectedCandidate.partyColor || selectedCandidate.partyColor) && (
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ 
                      backgroundColor: selectedCandidate.partyColor || selectedCandidate.partyColor 
                    }}
                  />
                  <span className="text-sm text-gray-600">Party Color</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex justify-center gap-4">
            {selectedCandidate ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={onResetSelection}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Selection
                </Button>
                <Button
                  onClick={onConfirmVote}
                  className="bg-green-600 hover:bg-green-700 px-8 flex items-center gap-2"
                  size="lg"
                >
                  <Vote className="h-4 w-4" />
                  Confirm Vote
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>Select a candidate above to proceed with voting</p>
              </div>
            )}
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-20"></div>
      </div>
    </div>
  )
}