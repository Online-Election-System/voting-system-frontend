"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface Election {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
  enrolled: boolean
}

interface ElectionSummaryProps {
  election: Election
}

export function ElectionSummary({ election }: ElectionSummaryProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(election.enrolled)

  const handleEnroll = async () => {
    setIsEnrolling(true)

    // Simulate API call
    setTimeout(() => {
      setIsEnrolled(true)
      setIsEnrolling(false)
      toast({
        title: "Successfully enrolled",
        description: `You are now enrolled for the ${election.title}`,
        variant: "default",
      })
    }, 1000)
  }

  const getStatusBadge = () => {
    if (isEnrolled) {
      return <Badge variant="success">Enrolled</Badge>
    }

    if (election.status === "Open for Enrollment") {
      return <Badge variant="outline">Open for Enrollment</Badge>
    }

    return <Badge variant="secondary">Coming Soon</Badge>
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{election.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(election.startDate), "MMMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          {isEnrolled ? (
            <div className="flex items-center gap-1 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span>You are enrolled for this election</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>You are not enrolled for this election</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEnrolled ? (
          <Button asChild>
            <Link href={`/elections/${election.id}`}>View Candidates</Link>
          </Button>
        ) : (
          election.status === "Open for Enrollment" && (
            <Button onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? "Enrolling..." : "Enroll"}
            </Button>
          )
        )}
        <Button variant="outline" asChild>
          <Link href={`/elections/${election.id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
