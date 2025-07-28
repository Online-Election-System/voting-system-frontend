"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, User } from "lucide-react"
import type { Candidate } from "@/src/app/polling-station/vote/types/voter"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onSelect: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  // Helper functions to safely get candidate data
  const getCandidateName = (): string => {
    return candidate.candidateName || "Unknown Candidate"
  }

  const getPartyName = (): string => {
    return candidate.partyName || "Independent"
  }

  const getPartySymbol = (): string => {
    return candidate.partySymbol || "🏛️"
  }

  const getPartyColor = (): string => {
    return candidate.partyColor || "#6B7280"
  }

  const getCandidateImage = (): string | undefined => {
    return candidate.candidateImage || undefined
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 h-full relative overflow-hidden group ${
        isSelected 
          ? "border-green-500 bg-green-50 shadow-xl ring-4 ring-green-200 ring-opacity-50" 
          : "border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50"
      }`}
      onClick={() => onSelect(candidate)}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-green-500 rounded-full p-1 shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>
      )}

      {/* Hover Indicator */}
      {!isSelected && (
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-blue-500 rounded-full p-1 shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>
      )}

      <CardContent className="p-3 h-full flex flex-col justify-between">
        <div className="flex flex-col items-center text-center space-y-2 flex-1">
          {/* Candidate Image or Party Symbol */}
          <div className="relative flex-shrink-0">
            {getCandidateImage() ? (
              <div className="relative">
                <img 
                  src={getCandidateImage()} 
                  alt={getCandidateName()}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const symbolDiv = target.nextElementSibling as HTMLElement;
                    if (symbolDiv) symbolDiv.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-gray-200 shadow-sm items-center justify-center text-lg md:text-2xl"
                  style={{ 
                    backgroundColor: getPartyColor() + '20',
                    color: getPartyColor()
                  }}
                >
                  {getPartySymbol()}
                </div>
              </div>
            ) : (
              <div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-gray-200 shadow-sm flex items-center justify-center text-lg md:text-2xl"
                style={{ 
                  backgroundColor: getPartyColor() + '20',
                  color: getPartyColor()
                }}
              >
                {getPartySymbol()}
              </div>
            )}
          </div>

          {/* Candidate Information */}
          <div className="space-y-1 flex-1 flex flex-col justify-center min-h-0">
            <h3 className="font-bold text-xs md:text-sm text-gray-800 leading-tight line-clamp-2">
              {getCandidateName()}
            </h3>
            
            <p className="text-xs text-gray-600 leading-tight line-clamp-1">
              {getPartyName()}
            </p>
            
            {/* Party Color and Symbol Indicator */}
            <div className="flex items-center justify-center gap-1 mt-1">
              <div 
                className="w-2 h-2 md:w-3 md:h-3 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: getPartyColor() }}
                title={`Party Color: ${getPartyColor()}`}
              />
              <span className="text-sm md:text-base" title="Party Symbol">
                {getPartySymbol()}
              </span>
            </div>
          </div>

          {/* Vote Count if available */}
          {candidate.popularVotes !== undefined && (
            <div className="pt-2 border-t border-gray-200 w-full flex-shrink-0">
              <div className="text-center">
                <p className="text-xs text-gray-700 font-medium">
                  {candidate.popularVotes.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Click to Vote Instruction */}
        <div className={`mt-2 text-center transition-all duration-200 flex-shrink-0 ${
          isSelected 
            ? "text-green-600 font-semibold" 
            : "text-gray-400 group-hover:text-blue-600"
        }`}>
          <p className="text-xs">
            {isSelected ? "✓ Selected" : "Click to Select"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}