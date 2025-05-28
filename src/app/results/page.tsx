"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElectoralMap } from "./(components)/electoral-map"
import { CandidateCards } from "./(components)/candidate-cards"
import { DistrictResults } from "./(components)/district-results"
import { PopularVoteChart } from "./(components)/popular-vote-chart"
import { ElectionHeader } from "./(components)/election-header"
import { electionData } from "@/lib/election-data"
import { ElectionYear } from "./types"

export default function ElectionDashboard() {
  const [selectedYear, setSelectedYear] = useState<ElectionYear>("2024");
  const currentData = electionData[selectedYear];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ElectionHeader
        title="Sri Lanka Presidential Election Results"
        year={selectedYear}
        onYearChange={setSelectedYear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Electoral District Map</CardTitle>
            <CardDescription>Showing results across electoral districts</CardDescription>
          </CardHeader>
          <CardContent>
            <ElectoralMap data={currentData} />

            <div className="flex flex-wrap justify-center gap-4 mt-4 px-2">
              {currentData.candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: candidate.color }}></div>
                  <span className="font-medium">
                    {candidate.name}: {candidate.electoralVotes}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <CandidateCards candidates={currentData.candidates} totalVotes={currentData.totalVotes} />
        </div>
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="popular">Popular Vote</TabsTrigger>
          <TabsTrigger value="districts">District Results</TabsTrigger>
        </TabsList>
        <TabsContent value="popular" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Vote Totals</CardTitle>
              <CardDescription>Total votes: {currentData.totalVotes.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <PopularVoteChart data={currentData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="districts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Results by Electoral District</CardTitle>
              <CardDescription>Showing electoral and popular votes by district</CardDescription>
            </CardHeader>
            <CardContent>
              <DistrictResults data={currentData.districts} candidates={currentData.candidates} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="updates" className="mt-4">
        </TabsContent>
      </Tabs>
    </div>
  )
}
