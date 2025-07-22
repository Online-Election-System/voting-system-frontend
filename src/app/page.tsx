"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Shield, BarChart3, Users, Calendar, Clock, FileText } from "lucide-react"

export default function FeaturesSection() {
  // Set the target date for the election (14 days from now for this example)
  const [targetDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 14)
    return date
  })

  // State for countdown values
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calculate time remaining
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
        // Countdown finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    // Clean up interval on unmount
    return () => clearInterval(timer)
  }, [targetDate])

  // Format numbers to always have two digits
  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0")
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center bg-gray-200">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Online Election System</h2>
            <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              This platform provides all the tools you need to create, manage, and analyze votes with confidence.
            </p>
          </div>
        </div>

        {/* Upcoming Election Card - Highlighted at the top */}
        <div className="mb-12 p-6 rounded-xl border-2 border-primary/20 bg-white/50 shadow-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-primary/20">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-grow space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">Upcoming Election: City Council Vote</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex flex-col items-center p-2 bg-background rounded-lg shadow-sm">
                  <span className="text-2xl font-bold">{formatNumber(timeLeft.days)}</span>
                  <span className="text-xs text-muted-foreground">Days</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background rounded-lg shadow-sm">
                  <span className="text-2xl font-bold">{formatNumber(timeLeft.hours)}</span>
                  <span className="text-xs text-muted-foreground">Hours</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background rounded-lg shadow-sm">
                  <span className="text-2xl font-bold">{formatNumber(timeLeft.minutes)}</span>
                  <span className="text-xs text-muted-foreground">Minutes</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-background rounded-lg shadow-sm">
                  <span className="text-2xl font-bold">{formatNumber(timeLeft.seconds)}</span>
                  <span className="text-xs text-muted-foreground">Seconds</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Registration closes in 3 days. Don't miss your chance to participate!
              </p>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0"></div>
          </div>
        </div>

        {/* Body Section - Grid of Features */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16 mx-auto">
          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Ballots</h3>
            <p className="text-muted-foreground">
              End-to-end encryption ensures your votes remain private and tamper-proof, maintaining the integrity of
              every election.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Multiple Voting Methods</h3>
            <p className="text-muted-foreground">
              Support for various voting types including single choice, multiple choice, ranked choice, and weighted
              voting.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-time Results</h3>
            <p className="text-muted-foreground">
              Watch results update in real-time as votes come in with beautiful visualizations and detailed analytics.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Easy Setup</h3>
            <p className="text-muted-foreground">
              Create and launch your poll in minutes with our intuitive interface. No technical expertise required.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fraud Prevention</h3>
            <p className="text-muted-foreground">
              Advanced security measures prevent duplicate voting and ensure only authorized participants can cast
              ballots.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Customizable Forms</h3>
            <p className="text-muted-foreground">
              Design your ballot with custom questions, images, and branding to match your organization's identity.
            </p>
          </div>

          {/* Election Reminder Card */}
          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Election Reminders</h3>
            <p className="text-muted-foreground">
              Never miss an important vote with customizable notifications and calendar integrations for upcoming
              elections.
            </p>
          </div>
        </div>

        {/* Section Footer with Two Large Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" className="px-8 py-6 text-base" asChild>
            <Link href="/create-poll">Create Your First Poll</Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-base" asChild>
            <Link href="/learn-more">Explore All Features</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

