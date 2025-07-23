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
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 h-full ${
        isSelected ? "border-gray-800 bg-gray-50 shadow-lg" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(candidate)}
    >
      <CardContent className="p-3 h-full flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Party Symbol or Candidate Image */}
          <div className="min-w-[60px] flex flex-col items-center">
            {getCandidateImage() ? (
              <img 
                src={getCandidateImage()} 
                alt={getCandidateName()}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
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
              className={`text-2xl bg-gray-100 p-2 rounded-lg ${getCandidateImage() ? 'hidden' : 'block'}`}
              style={{ 
                backgroundColor: getPartyColor() + '20', // 20% opacity
                color: getPartyColor()
              }}
            >
              {getPartySymbol()}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-sm text-gray-800 leading-tight">
              {getCandidateName()}
            </h3>
            <p className="text-xs text-gray-600 leading-tight">
              {getPartyName()}
            </p>
            
            {/* Party Color Indicator */}
            <div className="flex items-center justify-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: getPartyColor() }}
                title={`Party Color: ${getPartyColor()}`}
              />
              <span className="text-xs text-gray-500 truncate max-w-[100px]">
                {getPartySymbol()}
              </span>
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-5 w-5 text-gray-800" />
            </div>
          )}
        </div>

        {/* Additional candidate info if available - Compact version */}
        {candidate.popularVotes !== undefined && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-center">
              <span className="text-xs text-gray-500">Votes: {candidate.popularVotes}</span>
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  )
}