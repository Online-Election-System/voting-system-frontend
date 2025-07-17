"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { Candidate } from "@/types/voter"

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Confirm Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedCandidate && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-gray-800">
              <div className="text-6xl mb-4">{selectedCandidate.symbol}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedCandidate.nameEn}</h3>
              <p className="text-gray-600">Symbol: {selectedCandidate.symbolName}</p>
              {selectedCandidate.party && (
                <p className="text-gray-500 text-sm mt-1">Party: {selectedCandidate.party}</p>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">Are you sure you want to vote for this candidate?</p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>

          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
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
                  Submitting...
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