"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import RoleGuard from "@/components/auth/RoleGuard"
import { getUserType, isAuthenticated } from "@/src/lib/cookies"

export default function ChiefOccupantDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check authentication first
      if (!isAuthenticated()) {
        console.log("User not authenticated, redirecting to login")
        router.push("/login")
        return
      }

      const role = getUserType()
      console.log("User role from cookies:", role)
      
      if (!role) {
        console.log("No user role found, redirecting to login")
        router.push("/login")
        return
      }

      setUserRole(role)
      setLoading(false)
    }
  }, [router])

  // Show loading state while checking authentication
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

  return (
    <RoleGuard requiredRole="chief_occupant">
      <div className="flex min-h-screen flex-col">
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
    </RoleGuard>
  )
}
