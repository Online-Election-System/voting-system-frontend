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

// Storage keys for maintaining election selection
const STORAGE_KEYS = {
  SELECTED_ELECTION_ID: 'votingSystem_selectedElectionId',
  ELECTION_END_TIME: 'votingSystem_electionEndTime',
  ELECTION_NAME: 'votingSystem_electionName'
}

// Utility functions for election storage management
const saveElectionToSession = (electionId: string, electionName?: string, endTime?: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_ELECTION_ID, electionId)
    if (electionName) {
      sessionStorage.setItem(STORAGE_KEYS.ELECTION_NAME, electionName)
    }
    if (endTime) {
      sessionStorage.setItem(STORAGE_KEYS.ELECTION_END_TIME, endTime)
    }
    console.log('Election saved to session:', { electionId, electionName, endTime })
  }
}

const getElectionFromSession = () => {
  if (typeof window !== 'undefined') {
    const electionId = sessionStorage.getItem(STORAGE_KEYS.SELECTED_ELECTION_ID)
    const electionName = sessionStorage.getItem(STORAGE_KEYS.ELECTION_NAME)
    const endTime = sessionStorage.getItem(STORAGE_KEYS.ELECTION_END_TIME)
    
    // Check if election has ended
    if (endTime) {
      const endDate = new Date(endTime)
      const now = new Date()
      if (now > endDate) {
        console.log('Election has ended, clearing session storage')
        clearElectionFromSession()
        return null
      }
    }
    
    return electionId ? { electionId, electionName, endTime } : null
  }
  return null
}

const clearElectionFromSession = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_ELECTION_ID)
    sessionStorage.removeItem(STORAGE_KEYS.ELECTION_NAME)
    sessionStorage.removeItem(STORAGE_KEYS.ELECTION_END_TIME)
    console.log('Election session data cleared')
  }
}

const resetVotingSystem = () => {
  console.log("=== RESETTING TO VOTE SEARCH ===")
  // Clear form data but keep election selection
  const currentUrl = new URL(window.location.href)
  const electionId = currentUrl.searchParams.get('electionId')
  
  if (electionId) {
    // If there's an election ID in URL, redirect to vote search with same election
    window.location.href = `/polling-station/vote?electionId=${electionId}`
  } else {
    // Try to get from session storage
    const sessionElection = getElectionFromSession()
    if (sessionElection?.electionId) {
      window.location.href = `/polling-station/vote?electionId=${sessionElection.electionId}`
    } else {
      // Fallback to basic vote search page
      window.location.href = '/polling-station/vote'
    }
  }
}

export default function VotingSystem() {
  const searchParams = useSearchParams()
  const electionIdFromUrl = searchParams.get('electionId')
  
  const [currentScreen, setCurrentScreen] = useState<Screen>("validation")
  const [nicNumber, setNicNumber] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [currentElectionId, setCurrentElectionId] = useState<string>("")
  const [persistentElectionName, setPersistentElectionName] = useState<string>("")

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

  // Initialize election ID from URL or session storage
  useEffect(() => {
    if (electionIdFromUrl) {
      console.log('Setting election ID from URL:', electionIdFromUrl)
      setCurrentElectionId(electionIdFromUrl)
      // Save to session storage for persistence
      saveElectionToSession(electionIdFromUrl)
    } else {
      // Try to get from session storage
      const sessionElection = getElectionFromSession()
      if (sessionElection?.electionId) {
        console.log('Setting election ID from session:', sessionElection.electionId)
        setCurrentElectionId(sessionElection.electionId)
        setPersistentElectionName(sessionElection.electionName || "")
      }
    }
  }, [electionIdFromUrl])

  // Save election info when enrolled elections are loaded
  useEffect(() => {
    if (currentElectionId && enrolledElections.length > 0) {
      const currentElection = enrolledElections.find(e => e.id === currentElectionId)
      if (currentElection) {
        const electionName = currentElection.electionName || currentElection.election_name
        setPersistentElectionName(electionName)
        // Calculate end time if available
        let endTime = null
        if (currentElection.endDate && currentElection.endTime) {
          // Construct end datetime (this depends on your date/time structure)
          const endDate = new Date(
            currentElection.endDate.year,
            currentElection.endDate.month - 1,
            currentElection.endDate.day,
            currentElection.endTime.hour || 23,
            currentElection.endTime.minute || 59
          )
          endTime = endDate.toISOString()
        }
        saveElectionToSession(currentElectionId, electionName)
      }
    }
  }, [currentElectionId, enrolledElections])

  // Auto-select the first enrolled election when elections are loaded (only if no URL election ID and no session)
  useEffect(() => {
    if (enrolledElections.length > 0 && !currentElectionId && !electionIdFromUrl) {
      console.log('Auto-selecting first enrolled election:', enrolledElections[0])
      const firstElection = enrolledElections[0]
      setCurrentElectionId(firstElection.id)
      const electionName = firstElection.electionName || firstElection.election_name
      setPersistentElectionName(electionName)
      saveElectionToSession(firstElection.id, electionName)
    }
  }, [enrolledElections, currentElectionId, electionIdFromUrl])

  // Debug logging
  useEffect(() => {
    console.log('=== SYSTEM STATE DEBUG ===')
    console.log('Election ID from URL:', electionIdFromUrl)
    console.log('Session Election:', getElectionFromSession())
    console.log('Voter Profile:', voterProfile)
    console.log('District:', voterProfile?.district)
    console.log('Enrolled Elections:', enrolledElections)
    console.log('Current Election ID:', currentElectionId)
    console.log('Persistent Election Name:', persistentElectionName)
    console.log('Candidates:', candidates)
    console.log('Eligibility:', eligibility)
  }, [voterProfile, enrolledElections, currentElectionId, persistentElectionName, candidates, eligibility, electionIdFromUrl])

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
        saveElectionToSession(electionIdFromUrl)
      } else if (enrolledElections.length > 0) {
        console.log('Setting election ID to first enrolled election:', enrolledElections[0].id)
        const firstElection = enrolledElections[0]
        setCurrentElectionId(firstElection.id)
        const electionName = firstElection.electionName || firstElection.election_name
        setPersistentElectionName(electionName)
        saveElectionToSession(firstElection.id, electionName)
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
      
      // Auto-refresh after successful vote casting - return to vote search
      setTimeout(() => {
        console.log("=== AUTO-REFRESHING TO VOTE SEARCH ===")
        resetVotingSystem()
      }, 3000) // Show success message for 3 seconds before redirect
    } catch (error) {
      console.error("Failed to cast vote:", error)
    }
  }

  const resetSystem = () => {
    // Reset to vote search page instead of polling station
    resetVotingSystem()
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
          {(currentElectionId || persistentElectionName) && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                🗳️ Selected Election: {persistentElectionName || currentElectionId}
              </p>
              <p className="text-blue-600 text-sm">
                Please validate your voter credentials to proceed with voting.
              </p>
              {persistentElectionName && (
                <p className="text-blue-500 text-xs mt-1">
                  Election selection will be maintained throughout your voting session.
                </p>
              )}
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

          {/* Reset Vote Search Button - stays in voting system */}
          <div className="mt-6 text-center">
            <button
              onClick={resetVotingSystem}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors mr-4"
            >
              🔄 New Vote Search
            </button>
            <button
              onClick={() => window.location.href = '/polling-station'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
      // Auto-refresh after showing ineligibility message - return to vote search
      setTimeout(() => {
        console.log("=== VOTER NOT ELIGIBLE - RETURNING TO VOTE SEARCH ===")
        resetVotingSystem()
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
              Returning to vote search in a few seconds...
            </p>
            <button 
              onClick={resetVotingSystem}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Return to Vote Search
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
            <p className="mt-2 text-sm text-gray-600">
              Election: {persistentElectionName || currentElectionId}
            </p>
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
            <p className="text-gray-600 text-sm mb-4">
              Election: {persistentElectionName || currentElectionId}
            </p>
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
            <p className="text-gray-500 text-sm mb-4">
              Election: {persistentElectionName || currentElectionId}
            </p>
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