"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, ExternalLink, Shield, Vote, AlertCircle, CheckCircle } from "lucide-react"

export default function SriLankaElectionCommission() {
  const [searchQuery, setSearchQuery] = useState("")
  const [financeSearchQuery, setFinanceSearchQuery] = useState("")

  // Upcoming election countdown (example: 45 days from now)
  const [targetDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 45)
    return date
  })

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

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
              <Button size="lg" className="bg-white text-slate-800 hover:bg-gray-100">
                Find out more
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-lg"></div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbJI44RjZwNNH6Imgym4ZHmf0QYrbx8NUHxw&s?height=300&width=500"
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
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-2">
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-2xl font-bold text-orange-600">{timeLeft.days}</span>
                  <span className="text-sm text-gray-600 ml-1">Days</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-2xl font-bold text-orange-600">{timeLeft.hours}</span>
                  <span className="text-sm text-gray-600 ml-1">Hours</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-2xl font-bold text-orange-600">{timeLeft.minutes}</span>
                  <span className="text-sm text-gray-600 ml-1">Minutes</span>
                </div>
              </div>
              <p className="text-gray-700">
                Voter registration is now open. Ensure your details are up to date to participate in Sri Lanka's
                democratic process.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Register to Vote</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Voter ID Section */}
      <section className="bg-gradient-to-r from-pink-200 to-purple-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">Voter ID</h2>
              <p className="text-gray-700 text-lg">
                All voters in Sri Lanka need to show valid photo identification to vote at polling stations during
                elections.
              </p>
              <p className="text-gray-600">
                Don't have ID?{" "}
                <Link href="#" className="text-blue-600 underline">
                  Apply for voter ID now
                </Link>
              </p>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white">Find out more</Button>
            </div>
            <div className="relative">
              <div className="bg-blue-500 text-white p-8 rounded-lg transform rotate-3 shadow-lg">
                <h3 className="text-2xl font-bold mb-2">Bring photo ID to vote</h3>
                <CheckCircle className="w-12 h-12" />
              </div>
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
                  />
                  <Button className="bg-slate-800 hover:bg-slate-700">Search</Button>
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
                  />
                  <Button className="bg-slate-800 hover:bg-slate-700">
                    <span>Start your search</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* You might be interested in */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">You might be interested in</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-slate-800 to-blue-800 text-white p-6 h-48 flex items-end">
                <div className="space-y-2">
                  <Vote className="w-12 h-12" />
                  <h3 className="text-xl font-bold">Report on the 2024 Parliamentary Elections</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 text-sm">
                  Find out how the 2024 parliamentary elections in Sri Lanka were run, with insights from voters,
                  candidates, and electoral administrators.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 h-48 flex items-end">
                <div className="space-y-2">
                  <Users className="w-12 h-12" />
                  <h3 className="text-xl font-bold">Young people's views on politics and voting</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 text-sm">
                  Research into what 16-25 year olds across Sri Lanka know about politics and voting, and what is needed
                  to engage more young people with democracy.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 h-48 flex items-end">
                <div className="space-y-2">
                  <Shield className="w-12 h-12" />
                  <h3 className="text-xl font-bold">Campaigning for your vote</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 text-sm">
                  Find out more about the rules around campaigning and political advertising in Sri Lanka.
                </p>
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
