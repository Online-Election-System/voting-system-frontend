"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface StateResultsProps {
  data: any[]
}

export function StateResults({ data }: StateResultsProps) {
  const [search, setSearch] = useState("")

  const filteredStates = data.filter((state) => state.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search states..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Electoral Votes</TableHead>
              <TableHead>Winner</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStates.map((state) => (
              <TableRow key={state.code}>
                <TableCell className="font-medium">{state.name}</TableCell>
                <TableCell>{state.electoralVotes}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${state.winner === "democrat" ? "bg-blue-500" : "bg-red-500"}`}
                    ></div>
                    <span>{state.winner === "democrat" ? "Democrat" : "Republican"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{state.margin}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
