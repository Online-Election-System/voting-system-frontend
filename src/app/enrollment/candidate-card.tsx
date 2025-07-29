"use client"

import Image from "next/image"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface Candidate {
  id: string
  name: string
  party: string
  bio: string
  image: string
  alt?: string
  partySymbol?: string
  partyColor?: string
}

interface CandidateCardProps {
  candidate: Candidate
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = () => {
    console.log("Image error for candidate:", candidate.name) 
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    console.log("Image loaded for candidate:", candidate.name) 
    setIsLoading(false)
  }

  console.log("Rendering candidate card:", candidate) 

  return (
    <Card className="group overflow-hidden bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Image Section */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse bg-gray-200 w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        )}

        <Image
          src={imageError ? "/images/candidate.png" : candidate.image || "/images/candidate.png"}
          alt={candidate.alt || `Photo of ${candidate.name} - ${candidate.party} candidate`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Section */}
      <CardHeader className="p-4 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
            {candidate.name}
          </CardTitle>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="px-3 py-1 text-sm font-medium border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              style={{
                borderColor: candidate.partyColor || "#6b7280",
                color: candidate.partyColor || "#6b7280",
              }}
            >
              {candidate.party}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <CardDescription className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
          {candidate.bio}
        </CardDescription>

        {candidate.partyColor && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <span
              className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: candidate.partyColor }}
              title={`${candidate.party} color`}
            />
            <span className="text-xs text-gray-500 font-medium">Party Color</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
