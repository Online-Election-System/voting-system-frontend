"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { Candidate } from "@/src/app/vote/types/voter"

interface VoteConfirmationProps {
  selectedCandidate: Candidate | null
  onConfirm: () => Promise<void>
  onGoBack: () => void
  isSubmitting?: boolean
  errorMessage?: string
}

export function VoteConfirmation({ 
  selectedCandidate, 
  onConfirm, 
  onGoBack, 
  isSubmitting = false,
  errorMessage 
}: VoteConfirmationProps) {
  
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      // Error is handled by the parent component
      console.error("Vote confirmation failed:", error)
    }
  }

  // Helper function to get candidate name (uses backend structure)
  const getCandidateName = (candidate: Candidate) => {
    return candidate.candidateName || "Unknown Candidate"
  }

  // Helper function to get party symbol (uses backend structure)
  const getPartySymbol = (candidate: Candidate) => {
    return candidate.partySymbol || "🏛️"
  }

  // Helper function to get party name (uses backend structure)
  const getPartyName = (candidate: Candidate) => {
    return candidate.partyName || "Unknown Party"
  }

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-gray-800 mb-4">No candidate selected</p>
            <Button onClick={onGoBack} className="w-full">
              Go Back to Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Confirm Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-800">
            {/* Candidate Image if available */}
            {selectedCandidate.candidateImage && (
              <div className="mb-4">
                <img 
                  src={selectedCandidate.candidateImage} 
                  alt={getCandidateName(selectedCandidate)}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-300"
                />
              </div>
            )}
            
            {/* Party Symbol */}
            <div className="text-6xl mb-4">{getPartySymbol(selectedCandidate)}</div>
            
            {/* Candidate Name */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {getCandidateName(selectedCandidate)}
            </h3>
            
            {/* Party Name */}
            <p className="text-gray-600">Party: {getPartyName(selectedCandidate)}</p>
            
            {/* Candidate ID for debugging (can be removed in production) */}
            <p className="text-gray-400 text-xs mt-2">
              Candidate ID: {selectedCandidate.candidateId}
            </p>
            
            {/* Party Color Badge */}
            {selectedCandidate.partyColor && (
              <div className="mt-3 flex items-center justify-center">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: selectedCandidate.partyColor }}
                  title={`Party Color: ${selectedCandidate.partyColor}`}
                />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">
              Are you sure you want to vote for this candidate?
            </p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Vote Failed:</strong> {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onGoBack} 
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              No, Go Back
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Vote...
                </>
              ) : (
                "Yes, Confirm Vote"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}