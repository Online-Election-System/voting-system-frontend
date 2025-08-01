"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserType, isAuthenticated } from "@/src/lib/cookies"

export default function HouseholdMemberDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check authentication first
      if (!isAuthenticated()) {
        console.log("User not authenticated, redirecting to login")
        setError("Authentication required. Redirecting to login...")
        setTimeout(() => router.push("/login"), 1500)
        return
      }

      // Get user role
      const role = getUserType()
      setUserRole(role)
      setLoading(false)
    }
  }, [router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
            <p className="text-lg text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to the Election System
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            View your enrollment status, check upcoming elections, and stay informed about your voting eligibility — all in one place.
          </p>
          <div className="mt-8">
            <Image
              src="/election-illustration.svg?height=400&width=600"
              width={600}
              height={400}
              alt="Election System Illustration"
              className="mx-auto"
            />
          </div>
          {userRole && (
            <div className="mt-6 text-sm text-muted-foreground">
              Logged in as: <span className="font-medium capitalize">{userRole.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}