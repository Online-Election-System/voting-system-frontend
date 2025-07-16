"use client"

import { useState } from "react"
import type { Screen, Candidate } from "@/types/voter"
import { candidates } from "@/data/mockData"
import { useVoterValidation } from "@/hooks/use-voter-validation"

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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const { validationStatus, voterProfile, isValidating, validateVoter } = useVoterValidation()

  const proceedToVoting = () => {
    setCurrentScreen("voting")
  }

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const confirmVote = () => {
    if (selectedCandidate) {
      setCurrentScreen("confirmation")
    }
  }

  const finalizeVote = () => {
    setCurrentScreen("success")
    // Auto logout after 5 seconds
    setTimeout(() => {
      resetSystem()
    }, 5000)
  }

  const resetSystem = () => {
    setCurrentScreen("validation")
    setNicNumber("")
    setSelectedCandidate(null)
  }

  const goBack = () => {
    if (currentScreen === "confirmation") {
      setCurrentScreen("voting")
    } else if (currentScreen === "voting") {
      setSelectedCandidate(null)
    }
  }

  // Screen 1: Voter Validation Interface
  if (currentScreen === "validation") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <VotingHeader />

          <div className="grid md:grid-cols-2 gap-6">
            <VoterSearch
              nicNumber={nicNumber}
              setNicNumber={setNicNumber}
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

  // Screen 2: Voting Interface
  if (currentScreen === "voting") {
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

  // Screen 3: Vote Confirmation
  if (currentScreen === "confirmation") {
    return <VoteConfirmation selectedCandidate={selectedCandidate} onConfirm={finalizeVote} onGoBack={goBack} />
  }

  // Screen 4: Success Message
  if (currentScreen === "success") {
    return <SuccessMessage onReset={resetSystem} />
  }

  return null
}
