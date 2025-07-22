"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { Candidate } from "@/src/app/vote/types/voter"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onSelect: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  // Helper functions to safely get candidate data
  const getCandidateName = () => {
    return candidate.candidateName || candidate.candidateName || "Unknown Candidate"
  }

  const getPartyName = () => {
    return candidate.partyName || candidate.partyName || "Unknown Party"
  }

  const getPartySymbol = () => {
    return candidate.partySymbol || candidate.partySymbol || "🏛️"
  }

  const getPartyColor = () => {
    return candidate.partyColor || candidate.partyColor || "#6B7280"
  }

  const getCandidateImage = () => {
    return candidate.candidateImage || candidate.candidateImage || null
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
        isSelected ? "border-gray-800 bg-gray-50 shadow-lg" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(candidate)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Party Symbol or Candidate Image */}
          <div className="min-w-[80px] text-center">
            {getCandidateImage() ? (
              <img 
                src={getCandidateImage()} 
                alt={getCandidateName()}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 mx-auto"
                onError={(e) => {
                  // Fallback to party symbol if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const symbolDiv = target.nextElementSibling as HTMLElement;
                  if (symbolDiv) symbolDiv.style.display = 'block';
                }}
              />
            ) : null}
            <div 
              className={`text-4xl bg-gray-100 p-3 rounded-lg ${getCandidateImage() ? 'hidden' : 'block'}`}
              style={{ 
                backgroundColor: getPartyColor() + '20', // 20% opacity
                color: getPartyColor()
              }}
            >
              {getPartySymbol()}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1">
              {getCandidateName()}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {getPartyName()}
            </p>
            
            {/* Party Color Indicator */}
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: getPartyColor() }}
                title={`Party Color: ${getPartyColor()}`}
              />
              <span className="text-xs text-gray-500">
                {getPartySymbol()} {getPartyName()}
              </span>
            </div>

            {/* Debug Info (can be removed in production) */}
            <div className="text-xs text-gray-400 mt-1">
              ID: {candidate.candidateId || 'N/A'}
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && <CheckCircle className="h-8 w-8 text-gray-800 flex-shrink-0" />}
        </div>

        {/* Additional candidate info if available - UPDATED: Removed position */}
        {candidate.popularVotes !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Votes: {candidate.popularVotes}</span>
              {/* Position display removed as it's no longer calculated automatically */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}