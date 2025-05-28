"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface Candidate {
  id: string
  name: string
  party: string
  color: string
}

interface DistrictResultsProps {
  data: any[]
  candidates: Candidate[]
}

export function DistrictResults({ data, candidates }: DistrictResultsProps) {
  const [search, setSearch] = useState("")

  const filteredDistricts = data.filter((district) => district.name.toLowerCase().includes(search.toLowerCase()))

  // Find candidate by ID
  const getCandidateById = (id: string) => {
    return candidates.find((c) => c.id === id)
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search districts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>District</TableHead>
              <TableHead>Electoral Votes</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDistricts.map((district) => {
              const winner = getCandidateById(district.winner)

              return (
                <TableRow key={district.code}>
                  <TableCell className="font-medium">{district.name}</TableCell>
                  <TableCell>{district.electoralVotes}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: winner?.color || "#888" }}></div>
                      <span>{winner?.name || "Undecided"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{district.margin}%</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
