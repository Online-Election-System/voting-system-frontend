"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ElectoralMapProps {
  data: any
}

export function ElectoralMap({ data }: ElectoralMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  // Find the candidate by ID
  const getCandidateById = (id: string) => {
    return data.candidates.find((c: any) => c.id === id)
  }

  return (
    <TooltipProvider>
      <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden border">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Interactive electoral district map would be displayed here</p>
        </div>

        <div className="grid grid-cols-5 gap-1 p-4 relative z-10">
          {data.districts.slice(0, 20).map((district: any) => {
            const winner = getCandidateById(district.winner)

            return (
              <Tooltip key={district.code}>
                <TooltipTrigger asChild>
                  <div
                    className="aspect-square rounded-md flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: winner?.color || "#888" }}
                    onMouseEnter={() => setHoveredDistrict(district.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  >
                    {district.code}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-bold">{district.name}</p>
                    <p>Electoral votes: {district.electoralVotes}</p>
                    <p>Winner: {winner?.name || "Undecided"}</p>
                    <p>Margin: {district.margin}%</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
