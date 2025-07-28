"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import type { Screen, Candidate } from "@/src/app/polling-station/vote/types/voter"
import { 
  useCastVote, 
  useVoterValidation, 
  useVoterEnrolledElections, 
  useCandidatesByElection,
  useVotingEligibility 
} from "@/src/app/polling-station/vote/hooks/useVote"

// Components
import { VotingHeader } from "@/src/app/polling-station/vote/components/header"
import { VoterSearch } from "@/src/app/polling-station/vote/components/voter-search"
import { VoterProfile } from "@/src/app/polling-station/vote/components/voter-profile"
import { VotingInterface } from "@/src/app/polling-station/vote/components/voting-interface"
import { VoteConfirmation } from "@/src/app/polling-station/vote/components/vote-confirmation"
import { SuccessMessage } from "@/src/app/polling-station/vote/components/success-message"

export default function VotingSystem() {
  const searchParams = useSearchParams()
  const electionIdFromUrl = searchParams.get('electionId')
  
  const [currentScreen, setCurrentScreen] = useState<Screen>("validation")
  const [nicNumber, setNicNumber] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [currentElectionId, setCurrentElectionId] = useState<string>(electionIdFromUrl || "")

  // Hooks
  const { validationStatus, voterProfile, isValidating, validateVoter } = useVoterValidation()
  const { cast, loading: isCasting, error: castError, result } = useCastVote()
  
  // Get voter's enrolled elections (only fetch if voter is found)
  const { enrolledElections, loading: electionsLoading, error: electionsError } = useVoterEnrolledElections(
    voterProfile?.id || ""
  )
  
  // Get candidates for current election (with enrollment check)
  const { candidates, loading: candidatesLoading, error: candidatesError } = useCandidatesByElection(
    currentElectionId, 
    voterProfile?.id
  )
  
  // Check voting eligibility for current election
  const { eligibility, loading: eligibilityLoading } = useVotingEligibility(
    voterProfile?.id || "", 
    currentElectionId
  )

  // Set election ID from URL parameter
  useEffect(() => {
    if (electionIdFromUrl && !currentElectionId) {
      console.log('Setting election ID from URL:', electionIdFromUrl)
      setCurrentElectionId(electionIdFromUrl)
    }
  }, [electionIdFromUrl, currentElectionId])

  // Auto-select the first enrolled election when elections are loaded (only if no URL election ID)
  useEffect(() => {
    if (enrolledElections.length > 0 && !currentElectionId && !electionIdFromUrl) {
      console.log('Auto-selecting first enrolled election:', enrolledElections[0])
      setCurrentElectionId(enrolledElections[0].id)
    }
  }, [enrolledElections, currentElectionId, electionIdFromUrl])

  // Debug logging
  useEffect(() => {
    console.log('=== SYSTEM STATE DEBUG ===')
    console.log('Election ID from URL:', electionIdFromUrl)
    console.log('Voter Profile:', voterProfile)
    console.log('District:', voterProfile?.district)
    console.log('Enrolled Elections:', enrolledElections)
    console.log('Current Election ID:', currentElectionId)
    console.log('Candidates:', candidates)
    console.log('Eligibility:', eligibility)
  }, [voterProfile, enrolledElections, currentElectionId, candidates, eligibility, electionIdFromUrl])

  const proceedToVoting = () => {
    console.log('=== PROCEEDING TO VOTING ===')
    console.log('Available enrolled elections:', enrolledElections)
    console.log('Current election ID:', currentElectionId)
    console.log('Election ID from URL:', electionIdFromUrl)
    
    // Use URL election ID if available, otherwise use first enrolled election
    if (!currentElectionId) {
      if (electionIdFromUrl) {
        console.log('Setting election ID from URL:', electionIdFromUrl)
        setCurrentElectionId(electionIdFromUrl)
      } else if (enrolledElections.length > 0) {
        console.log('Setting election ID to first enrolled election:', enrolledElections[0].id)
        setCurrentElectionId(enrolledElections[0].id)
      }
    }
    
    setCurrentScreen("voting")
  }

  const selectCandidate = (candidate: Candidate) => {
    console.log('=== CANDIDATE SELECTED ===')
    console.log('Selected candidate:', candidate)
    setSelectedCandidate(candidate)
  }

  const confirmVote = () => {
    console.log('=== CONFIRMING VOTE ===')
    console.log('Selected candidate for confirmation:', selectedCandidate)
    setCurrentScreen("confirmation")
  }

  const finalizeVote = async () => {
    if (!voterProfile || !selectedCandidate) {
      console.error("Missing voter profile or selected candidate")
      return
    }

    if (!voterProfile.district || voterProfile.district === "District Not Available") {
      console.error("Voter profile missing district information:", voterProfile.district)
      return
    }

    try {
      console.log("=== FINALIZING VOTE ===")
      console.log("Voter ID:", voterProfile.id)
      console.log("Election ID:", selectedCandidate.electionId || currentElectionId)
      console.log("Candidate ID:", selectedCandidate.candidateId)
      console.log("District:", voterProfile.district)

      await cast({
        voterId: voterProfile.id,
        electionId: selectedCandidate.electionId || currentElectionId,
        candidateId: selectedCandidate.candidateId,
        district: voterProfile.district
      })

      setVoteSubmitted(true)
      setCurrentScreen("success")
      
      // Auto-refresh after successful vote casting
      setTimeout(() => {
        console.log("=== AUTO-REFRESHING TO POLLING STATION ===")
        // Navigate back to polling station after successful vote
        window.location.href = '/polling-station'
      }, 3000) // Show success message for 3 seconds before redirect
    } catch (error) {
      console.error("Failed to cast vote:", error)
    }
  }

  const resetSystem = () => {
    // Navigate back to polling station
    console.log("=== MANUAL RESET - RETURNING TO POLLING STATION ===")
    window.location.href = '/polling-station'
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

          {/* Show current election info */}
          {currentElectionId && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                🗳️ Selected Election: {currentElectionId}
              </p>
              <p className="text-blue-600 text-sm">
                Please validate your voter credentials to proceed with voting.
              </p>
            </div>
          )}

          {/* Show enrollment loading state */}
          {voterProfile && electionsLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Loading your enrolled elections...</p>
            </div>
          )}

          {/* Show enrollment error */}
          {voterProfile && electionsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Error loading enrolled elections: {electionsError.message}</p>
            </div>
          )}

          {/* Show enrolled elections */}
          {voterProfile && enrolledElections.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ You are enrolled in: {enrolledElections[0].electionName || enrolledElections[0].election_name}
              </p>
              <p className="text-green-600 text-sm">
                {enrolledElections[0].description}
              </p>
              {enrolledElections.length > 1 && (
                <p className="text-green-600 text-xs mt-1">
                  + {enrolledElections.length - 1} more election(s)
                </p>
              )}
            </div>
          )}

          {/* Show no enrollment warning */}
          {voterProfile && !electionsLoading && enrolledElections.length === 0 && !electionIdFromUrl && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ No Elections Available</p>
              <p className="text-yellow-700 text-sm">
                You are not currently enrolled in any active elections. Please contact election officials for enrollment.
              </p>
            </div>
          )}

          {/* Show district warning */}
          {voterProfile && (!voterProfile.district || voterProfile.district === "District Not Available") && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ District Information Missing</p>
              <p className="text-red-700 text-sm">
                Your electoral district information is not available. This is required for voting. Please contact election officials.
              </p>
            </div>
          )}

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

          {/* Return to Polling Station Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/polling-station'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              ← Return to Polling Station
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "voting") {
    // Check eligibility first
    if (eligibility && !eligibility.eligible) {
      // Auto-refresh after showing ineligibility message
      setTimeout(() => {
        console.log("=== VOTER NOT ELIGIBLE - RETURNING TO POLLING STATION ===")
        window.location.href = '/polling-station'
      }, 4000) // Show message for 4 seconds before redirect

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Not Eligible to Vote</h2>
            {!eligibility.isEnrolled && (
              <p className="text-red-600 mb-4">❌ You are not enrolled in this election.</p>
            )}
            {eligibility.alreadyVoted && (
              <p className="text-orange-600 mb-4">🗳️ You have already voted in this election.</p>
            )}
            <p className="text-gray-500 text-sm mb-4">
              Returning to polling station in a few seconds...
            </p>
            <button 
              onClick={() => window.location.href = '/polling-station'}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Return to Polling Station
            </button>
          </div>
        </div>
      )
    }

    if (candidatesLoading || eligibilityLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Loading candidates...</p>
            <p className="mt-2 text-sm text-gray-600">Election ID: {currentElectionId}</p>
          </div>
        </div>
      )
    }

    if (candidatesError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Candidates</h2>
            <p className="text-red-600 mb-4">{candidatesError.message}</p>
            <p className="text-gray-600 text-sm mb-4">Election ID: {currentElectionId}</p>
            <button 
              onClick={() => setCurrentScreen("validation")}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    }

    if (candidates.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-gray-400 text-6xl mb-4">🗳️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Candidates Available</h2>
            <p className="text-gray-600 mb-4">There are no active candidates for this election.</p>
            <p className="text-gray-500 text-sm mb-4">Election ID: {currentElectionId}</p>
            <button 
              onClick={() => setCurrentScreen("validation")}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Go Back
            </button>
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