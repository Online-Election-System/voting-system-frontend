"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import type { Candidate } from "@/types/voter"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onSelect: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
        isSelected ? "border-gray-800 bg-gray-50 shadow-lg" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(candidate)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl bg-gray-100 p-3 rounded-lg min-w-[80px] text-center">{candidate.symbol}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">{candidate.nameEn}</h3>
            <p className="text-sm text-gray-600">Symbol: {candidate.symbolName}</p>
          </div>
          {isSelected && <CheckCircle className="h-8 w-8 text-gray-800" />}
        </div>
      </CardContent>
    </Card>
  )
}
