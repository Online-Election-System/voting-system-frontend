"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Calendar,
  CheckSquare,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userType")
      setUserRole(role)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* The ConditionalHeader in layout.tsx will handle showing the correct header */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to the Election System
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Manage your enrollments, view upcoming elections, and stay informed about your voting status — all in one place.
          </p>
          <div className="mt-8">
            <Image
              src="/placeholder.svg?height=400&width=600"
              width={600}
              height={400}
              alt="Election System Illustration"
              className="mx-auto"
            />
          </div>
          <div className="mt-12 flex flex-col items-center gap-4">
            <Button asChild className="px-8 py-6 text-lg">
              <Link href="/elections">View All Elections</Link>
            </Button>
            <p className="text-center text-muted-foreground">
              Explore all available elections and enroll with a single click.
            </p>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Elections</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <CardDescription className="text-xs text-muted-foreground">
                  You are enrolled in 1 upcoming election(s)
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Elections</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <CardDescription className="text-xs text-muted-foreground">
                  4 election(s) available for enrollment
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voter Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <CardDescription className="text-xs text-muted-foreground">
                  Your voter registration is active and valid
                </CardDescription>
              </CardContent>
            </Card>

            {/* Chief Occupant Card */}
            {userRole === "chiefOccupant" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Household Management</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Manage</div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Add, update, or delete household members.
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="mt-2 w-full bg-transparent">
                    <Link href="/VoterDashboard/household-management">Go to Management</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}