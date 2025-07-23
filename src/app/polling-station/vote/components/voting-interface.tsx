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
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b-2 border-gray-800">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Presidential Election – Cast Your Vote
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-2">
            Please select one candidate from the list below. Tap the candidate card to vote.
          </p>
          
          {/* Candidates count */}
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Vote className="h-4 w-4 mr-1" />
            {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Available
          </div>
        </div>
      </div>

      {/* Main Content Area - Fixed Height */}
      <div className="flex-1 flex flex-col overflow-hidden">


        {/* Candidates List - All cards visible without scrolling */}
        <div className="flex-1 overflow-hidden p-4 flex items-center">
          <div className="w-full max-w-4xl mx-auto h-full flex items-center">
            {candidates.length === 0 ? (
              <div className="flex items-center justify-center w-full text-gray-500">
                <div className="text-center">
                  <Vote className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No candidates available</p>
                  <p className="text-sm">Please check back later or contact election officials</p>
                </div>
              </div>
            ) : (
              <div className={`w-full grid gap-2 h-full ${
                candidates.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                candidates.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' :
                candidates.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                candidates.length === 4 ? 'grid-cols-1 md:grid-cols-2 grid-rows-2' :
                candidates.length === 5 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5' :
                candidates.length === 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2' :
                candidates.length <= 8 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2' :
                candidates.length <= 9 ? 'grid-cols-1 md:grid-cols-3 grid-rows-3' :
                candidates.length <= 12 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-3' :
                'grid-cols-1 md:grid-cols-4 lg:grid-cols-5'
              } content-center`}>
                {candidates.map((candidate) => (
                  <div key={candidate.candidateId || candidate.candidateId} className="flex items-center">
                    <CandidateCard
                      candidate={candidate}
                      isSelected={selectedCandidate?.candidateId === candidate.candidateId || 
                                 selectedCandidate?.candidateId === candidate.candidateId}
                      onSelect={onSelectCandidate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Candidate Info - Compact */}
        {selectedCandidate && (
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                {/* Candidate Image or Symbol */}
                {selectedCandidate.candidateImage || selectedCandidate.candidateImage ? (
                  <img 
                    src={selectedCandidate.candidateImage || selectedCandidate.candidateImage} 
                    alt={getCandidateName(selectedCandidate)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="text-3xl">{getPartySymbol(selectedCandidate)}</div>
                )}
                
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {getCandidateName(selectedCandidate)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCandidate.partyName || selectedCandidate.partyName || "Independent"}
                  </div>
                </div>

                {/* Party Color Indicator */}
                {(selectedCandidate.partyColor || selectedCandidate.partyColor) && (
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ 
                      backgroundColor: selectedCandidate.partyColor || selectedCandidate.partyColor 
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
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
            <div className="text-center text-gray-500 py-2">
              <p>Select a candidate above to proceed with voting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}