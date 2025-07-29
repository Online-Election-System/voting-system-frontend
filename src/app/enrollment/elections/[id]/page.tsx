"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CandidateCard } from "@/src/app/enrollment/candidate-card"
import { Calendar, Clock, Users, Vote, Info } from "lucide-react"

// Backend candidate structure
interface BackendCandidate {
  candidateId: string
  candidateName: string
  partyName: string
  partySymbol: string
  partyColor: string
  candidateImage: string
  isActive: boolean
}

// Frontend candidate structure 
interface FrontendCandidate {
  id: string
  name: string
  party: string
  bio: string
  image: string
  alt?: string
  partySymbol?: string
  partyColor?: string
}

interface ElectionDetails {
  id: string
  name: string
  description: string
  startDate: {
    year: number
    month: number
    day: number
  }
  enrolDeadline: {
    year: number
    month: number
    day: number
  }
  electionDate: {
    year: number
    month: number
    day: number
  }
  endDate: {
    year: number
    month: number
    day: number
  }
  noOfCandidates: number
  type: string
  startTime: {
    hour: number
    minute: number
    second: number
  }
  endTime: {
    hour: number
    minute: number
    second: number
  }
  status: string
  candidates: BackendCandidate[]
}

export default function ElectionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [election, setElection] = useState<ElectionDetails | null>(null)
  const [candidates, setCandidates] = useState<FrontendCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to format date objects to readable strings
  const formatDate = (dateObj: { year: number; month: number; day: number }) => {
    return new Date(dateObj.year, dateObj.month - 1, dateObj.day).toLocaleDateString()
  }

  // Helper function to format time objects to readable strings
  const formatTime = (timeObj: { hour: number; minute: number; second: number }) => {
    return `${timeObj.hour.toString().padStart(2, "0")}:${timeObj.minute.toString().padStart(2, "0")}`
  }

  // Function to convert backend candidate to frontend candidate
  const convertCandidateData = (backendCandidate: BackendCandidate): FrontendCandidate => {
    return {
      id: backendCandidate.candidateId,
      name: backendCandidate.candidateName,
      party: backendCandidate.partyName,
      bio: `Candidate from ${backendCandidate.partyName}. Running for the ${election?.name || "election"}.`,
      image: backendCandidate.candidateImage || "/images/candidate.png",
      alt: `Photo of ${backendCandidate.candidateName} - ${backendCandidate.partyName} candidate`,
      partySymbol: backendCandidate.partySymbol,
      partyColor: backendCandidate.partyColor,
    }
  }

  useEffect(() => {
    async function fetchElectionAndCandidates() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/elections/${id}/candidates`)

        if (!res.ok) {
          if (res.status === 404) {
            setError("Election not found.")
          } else {
            setError(`HTTP error! status: ${res.status}`)
          }
          return
        }

        const data: ElectionDetails = await res.json()

        console.log("API Response:", data) 
        console.log("Backend Candidates:", data.candidates) 

        setElection(data)

        // Convert backend candidate structure to frontend structure
        const convertedCandidates = (data.candidates || [])
        // Only show active candidates
          .filter((candidate) => candidate.isActive) 
          .map(convertCandidateData)

        console.log("Converted Candidates:", convertedCandidates) 
        setCandidates(convertedCandidates)
      } catch (err: any) {
        console.error("Error fetching election details:", err)
        setError("Failed to fetch election details.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchElectionAndCandidates()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading election details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Vote className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Election Not Found</h2>
          <p className="text-gray-600 text-lg">The requested election could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Vote className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{election.name}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{election.description}</p>
          </div>
        </div>
      </div>

      {/* Election Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Info className="w-6 h-6" />
            Election Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dates */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Start Date</h3>
                  <p className="text-gray-600">{formatDate(election.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Election Date</h3>
                  <p className="text-gray-600">{formatDate(election.electionDate)}</p>
                </div>
              </div>
            </div>

            {/* Deadlines & Times */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Enrollment Deadline</h3>
                  <p className="text-gray-600">{formatDate(election.enrolDeadline)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Voting Hours</h3>
                  <p className="text-gray-600">
                    {formatTime(election.startTime)} - {formatTime(election.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Candidates</h3>
                  <p className="text-gray-600">{election.noOfCandidates} registered</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Election Type</h3>
                  <p className="text-gray-600">{election.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Candidates</h2>
            <p className="text-lg text-gray-600">Learn about the candidates running in this election</p>
          </div>

          {candidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {candidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
              <p className="text-gray-600">No candidates are currently registered for this election.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
