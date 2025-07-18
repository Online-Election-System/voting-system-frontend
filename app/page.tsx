"use client"

import { useState } from "react"
import type { Screen, Candidate } from "@/types/voter"
import { useCastVote, useVoterValidation, useActiveElections, useCandidatesByElection } from "@/hooks/useVote"

// Components
import { VotingHeader } from "@/components/header"
import { VoterSearch } from "@/components/voter-search"
import { VoterProfile } from "@/components/voter-profile"
import { VotingInterface } from "@/components/voting-interface"
import { VoteConfirmation } from "@/components/vote-confirmation"
import { SuccessMessage } from "@/components/success-message"

export default function VotingSystem() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("validation")
  const [nicNumber, setNicNumber] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [currentElectionId, setCurrentElectionId] = useState<string>("")

  // Hooks
  const { validationStatus, voterProfile, isValidating, validateVoter } = useVoterValidation()
  const { cast, loading: isCasting, error: castError, result } = useCastVote()
  const { elections, loading: electionsLoading } = useActiveElections()
  const { candidates, loading: candidatesLoading } = useCandidatesByElection(currentElectionId)

  const proceedToVoting = () => {
    // Set the current election ID (for now, use the first active election)
    if (elections.length > 0) {
      setCurrentElectionId(elections[0].id)
    }
    setCurrentScreen("voting")
  }

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const confirmVote = () => {
    setCurrentScreen("confirmation")
  }

  const finalizeVote = async () => {
    if (!voterProfile || !selectedCandidate) {
      console.error("Missing voter profile or selected candidate")
      return
    }

    try {
      // Cast the vote with only required fields
      await cast({
        voterId: voterProfile.id,
        electionId: selectedCandidate.electionId,
        candidateId: selectedCandidate.candidateId,
        district: ""
      })

      // If vote was cast successfully, mark as submitted
      setVoteSubmitted(true)
      setCurrentScreen("success")
      
      // Auto-reset after 5 seconds
      setTimeout(() => {
        resetSystem()
      }, 5000)
    } catch (error) {
      console.error("Failed to cast vote:", error)
      // Error is already handled in the hook, just stay on confirmation screen
    }
  }

  const resetSystem = () => {
    // Refresh the page to completely reset the application state
    window.location.reload()
  }

  const goBack = () => {
    if (currentScreen === "confirmation") {
      setCurrentScreen("voting")
    } else if (currentScreen === "voting") {
      setSelectedCandidate(null)
    }
  }

  // --- UI RENDERING ---

  if (currentScreen === "validation") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <VotingHeader />

          <div className="grid md:grid-cols-2 gap-6">
            <VoterSearch
              nationalId={nicNumber}
              setNationalId={setNicNumber}
              password={password}
              setPassword={setPassword}
              onSearch={validateVoter}
              isValidating={isValidating}
              validationStatus={validationStatus}
            />

            <VoterProfile
              validationStatus={validationStatus}
              voterProfile={voterProfile}
              onProceedToVoting={proceedToVoting}
            />
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "voting") {
    if (candidatesLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Loading candidates...</p>
          </div>
        </div>
      )
    }

    return (
      <VotingInterface
        candidates={candidates}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={selectCandidate}
        onConfirmVote={confirmVote}
        onResetSelection={() => setSelectedCandidate(null)}
      />
    )
  }

  if (currentScreen === "confirmation") {
    return (
      <VoteConfirmation
        selectedCandidate={selectedCandidate}
        onConfirm={finalizeVote}
        onGoBack={goBack}
        isSubmitting={isCasting}
        errorMessage={castError?.message}
      />
    )
  }

  if (currentScreen === "success") {
    return <SuccessMessage onReset={resetSystem} />
  }

  return null
}