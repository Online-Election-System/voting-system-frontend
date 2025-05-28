// election-header.tsx
"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type ElectionYear = "2024" | "2020" | "2016";

interface ElectionHeaderProps {
  title: string
  year: ElectionYear
  onYearChange: (year: ElectionYear) => void
}

export function ElectionHeader({ title, year, onYearChange }: ElectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">Live results and electoral vote counts</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="px-3 py-1 text-sm">
          {year === "2024" ? "Preliminary Results" : "Official Results"}
        </Badge>
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
            <SelectItem value="2016">2016</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
