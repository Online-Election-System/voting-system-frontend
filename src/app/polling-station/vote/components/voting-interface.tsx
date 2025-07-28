"use client"

import { Button } from "@/components/ui/button"
import { Vote, RotateCcw, User, CheckCircle2 } from "lucide-react"
import { CandidateCard } from "@/src/app/polling-station/vote/components/candidate-card"
import type { Candidate } from "@/src/app/polling-station/vote/types/voter"

interface VotingInterfaceProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  onSelectCandidate: (candidate: Candidate) => void
  onConfirmVote: () => void
  onResetSelection: () => void
  electionId?: string
}

export function VotingInterface({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  onConfirmVote,
  onResetSelection,
  electionId
}: VotingInterfaceProps) {
  
  // Helper function to get candidate name
  const getCandidateName = (candidate: Candidate) => {
    return candidate.candidateName || "Unknown Candidate"
  }

  // Helper function to get party symbol
  const getPartySymbol = (candidate: Candidate) => {
    return candidate.partySymbol || "🗳️"
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Header Section - Fixed Height */}
      <div className="flex-shrink-0 bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Vote className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Presidential Election 2025
              </h1>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-3 max-w-3xl mx-auto">
              Choose your preferred candidate by clicking on their card below.
            </p>
            
            {/* Election Info Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <User className="h-3 w-3 mr-1" />
                {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
              </div>
              {electionId && (
                <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  ID: {electionId}
                </div>
              )}
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                ✅ Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Voting Area - Flexible Height */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl mx-auto h-full flex flex-col justify-center">
            {candidates.length === 0 ? (
              <div className="flex items-center justify-center">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                  <Vote className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Candidates Available</h3>
                  <p className="text-gray-600">
                    Please contact election officials if you believe this is an error.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                {/* Dynamic Grid Based on Candidate Count */}
                {candidates.length === 1 && (
                  <div className="w-full max-w-sm">
                    <div className="h-96">
                      <CandidateCard
                        candidate={candidates[0]}
                        isSelected={selectedCandidate?.candidateId === candidates[0].candidateId}
                        onSelect={onSelectCandidate}
                      />
                    </div>
                  </div>
                )}
                
                {candidates.length === 2 && (
                  <div className="w-full max-w-4xl grid grid-cols-2 gap-6 h-96">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 3 && (
                  <div className="w-full max-w-5xl grid grid-cols-3 gap-4 h-80">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 4 && (
                  <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 h-80">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 5 && (
                  <div className="w-full max-w-7xl grid grid-cols-5 gap-3 h-72">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 6 && (
                  <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 gap-4 h-96">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 8 && (
                  <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-3 h-96">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {candidates.length === 9 && (
                  <div className="w-full max-w-7xl grid grid-cols-3 gap-3 h-96">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* For 7 candidates or 10+ candidates */}
                {(candidates.length === 7 || candidates.length >= 10) && (
                  <div className={`w-full max-w-7xl grid gap-2 h-80 ${
                    candidates.length <= 12 
                      ? 'grid-cols-3 md:grid-cols-4' 
                      : 'grid-cols-4 md:grid-cols-5'
                  }`}>
                    {candidates.map((candidate) => (
                      <div key={candidate.candidateId} className="h-full">
                        <CandidateCard
                          candidate={candidate}
                          isSelected={selectedCandidate?.candidateId === candidate.candidateId}
                          onSelect={onSelectCandidate}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {selectedCandidate ? (
              <>
                <div className="text-center mb-2 sm:mb-0 sm:mr-4">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-semibold">{getCandidateName(selectedCandidate)}</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onResetSelection}
                  className="w-full sm:w-auto flex items-center gap-2 px-4 py-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Change
                </Button>
                <Button
                  onClick={onConfirmVote}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Vote className="h-4 w-4" />
                  Confirm Vote
                </Button>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-500">
                  👆 Select a candidate above to proceed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}