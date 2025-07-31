"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Shield, Vote, AlertCircle, CheckCircle } from "lucide-react"

export default function SriLankaElectionCommission() {
  const [searchQuery, setSearchQuery] = useState("")
  const [financeSearchQuery, setFinanceSearchQuery] = useState("")

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-800 via-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Welcome to the Election Commission of Sri Lanka
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                The Election Commission is the independent constitutional body responsible for conducting free and fair
                elections in Sri Lanka. We ensure democratic processes and maintain electoral integrity across the
                nation.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-lg"></div>
              <img
                src="https://d3i6fh83elv35t.cloudfront.net/static/2024/09/2024-09-21T121605Z_1643122364_RC2X4AAZV25X_RTRMADP_3_SRI-LANKA-ELECTION-1024x683.jpg"
                alt="Sri Lankan Election Symbols"
                className="w-full h-auto rounded-lg opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Election Alert */}
      <section className="bg-gradient-to-r from-orange-100 to-red-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="bg-orange-500 text-white p-4 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Presidential Election 2024</h2>
              <p className="text-gray-700">
                Voter registration is now open. Ensure your details are up to date to participate in Sri Lanka's
                democratic process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Key resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-slate-800 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">Information for voters</h3>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">Guidance for electoral administrators</h3>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-yellow-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-blue-800">Latest reports and research</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Voting Instructions Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How to Vote Online</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-blue-800 flex items-center justify-center gap-2">
                  <Users className="w-8 h-8" />
                  Voting Instructions for Voters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-gray-600 text-lg mb-8">
                  Follow these simple steps to cast your vote securely online
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Step 1 */}
                  <div className="text-center space-y-4">
                    <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Login</h3>
                    <p className="text-sm text-gray-600">
                      Enter your voter National ID and password to access the voting system
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">Required: National ID & Password</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center space-y-4">
                    <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Proceed to Vote</h3>
                    <p className="text-sm text-gray-600">Click the "Proceed to Vote" button to access the ballot</p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">Verify your details first</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center space-y-4">
                    <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Select Candidate</h3>
                    <p className="text-sm text-gray-600">Choose your preferred candidate from the ballot options</p>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs text-orange-700 font-medium">Review before selecting</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="text-center space-y-4">
                    <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                      4
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Confirm Vote</h3>
                    <p className="text-sm text-gray-600">
                      Review your selection and confirm your vote to complete the process
                    </p>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-700 font-medium">Vote cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800 mb-2">Important Reminders</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Keep your National ID and password secure</li>
                        <li>• Vote only once - duplicate votes will be rejected</li>
                        <li>• Contact support if you encounter any issues</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Find out about elections in your area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Enter your postcode to find out which elections are coming up in your area, the contact details for
                  the electoral services team at your local council and polling station details.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your postcode"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Search the political finance database</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Find out which political parties are registered with us, where their money is coming from and how
                  they're spending it.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search political parties"
                    value={financeSearchQuery}
                    onChange={(e) => setFinanceSearchQuery(e.target.value)}
                    className="flex-1"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

   
      {/* Latest News */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Latest news</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Election Commission welcomes new report on electoral reforms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  The Election Commission has published a comprehensive report on proposed electoral reforms for Sri
                  Lanka.
                </p>
                <p className="text-xs text-gray-500">25 Jan 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New voter registration system launched</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  A modernized online voter registration system has been introduced to improve accessibility and
                  efficiency.
                </p>
                <p className="text-xs text-gray-500">20 Jan 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Presidential election spending hits record high</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Total spending on the 2024 presidential election reached unprecedented levels according to new data.
                </p>
                <p className="text-xs text-gray-500">18 Jan 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investigation into electoral irregularities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  The Election Commission has concluded investigations into reported electoral irregularities.
                </p>
                <p className="text-xs text-gray-500">15 Jan 2024</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
