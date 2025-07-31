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
import RoleGuard from "@/components/auth/RoleGuard"

export default function ChiefOccupantDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userType")
      setUserRole(role)
    }
  }, [])

  return (
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
          </div>
        </main>
      </div>
  )
}