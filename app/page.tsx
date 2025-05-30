"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, User, Calendar } from "lucide-react"

type Election = {
  id: number
  title: string
  startDate: string
  endDate: string
  status: string
  enrolled: boolean
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export default function Dashboard() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Replace with actual logged-in voter ID
  const voterId = 1

  useEffect(() => {
    async function fetchElections() {
      try {
        const res = await fetch(`http://localhost:8081/elections?voterId=${voterId}`)
        if (!res.ok) throw new Error("Failed to fetch elections")

        const json: ApiResponse<Election[]> = await res.json()
        if (!json.success) throw new Error(json.message)

        setElections(json.data)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  if (loading) return <p>Loading elections...</p>
  if (error) return <p>Error loading elections: {error}</p>

  const enrolledElections = elections.filter((e) => e.enrolled)
  const availableElections = elections.filter((e) => !e.enrolled)

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 pb-16">
      {/* Welcome Section */}
      <div className="mt-10 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
          Welcome to the Election System
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Manage your enrollments, view upcoming elections, and stay informed about your voting status — all in one place.
        </p>
      </div>

      {/* Illustration */}
      <div className="w-full max-w-md">
        <Image
          src="/election-illustration.svg"
          alt="Online Election Illustration"
          width={500}
          height={300}
          className="mx-auto"
        />
      </div>

      {/* View All Elections Button */}
      <div className="space-y-2">
        <Button size="lg" asChild>
          <Link href="/elections">View All Elections</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Explore all available elections and enroll with a single click.
        </p>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl px-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Elections</CardTitle>
            <Vote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledElections.length}</div>
            <p className="text-xs text-muted-foreground">
              You are enrolled in {enrolledElections.length} upcoming election(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Elections</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableElections.length}</div>
            <p className="text-xs text-muted-foreground">
              {availableElections.length} election(s) available for enrollment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voter Status</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Your voter registration is active and valid
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
