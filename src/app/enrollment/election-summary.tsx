"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, CheckCircle, AlertCircle, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isEnrolled, setIsEnrolled] = useState(election.enrolled)
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Check URL for successful enrollment and update state
  useEffect(() => {
    const enrolledId = searchParams.get("enrolled")
    if (enrolledId === election.id) {
      setIsEnrolled(true)
    }
  }, [searchParams, election.id])

  // update enrollment status when the election prop changes
  useEffect(() => {
    setIsEnrolled(election.enrolled)
  }, [election.enrolled])

  const handleEnroll = () => {
    setIsEnrolling(true)
    router.push(`/enrollment/elections/${election.id}/verify`)
  }

  const getStatusBadge = () => {
    if (isEnrolled) {
      return (
        <Badge className="bg-black text-white hover:bg-gray-800 flex items-center gap-1.5 px-3 py-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Enrolled
        </Badge>
      )
    }
    return election.status === "Open for Enrollment" ? (
      <Badge variant="outline" className="border-gray-300 text-gray-700 flex items-center gap-1.5 px-3 py-1">
        <AlertCircle className="w-3.5 h-3.5" />
        Open for Enrollment
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-3 py-1">
        Coming Soon
      </Badge>
    )
  }

  // Check if enrollment is open and user hasn't enrolled yet
  const canEnroll = () => {
    return !isEnrolled && election.status === "Open for Enrollment"
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold text-gray-900">{election.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{format(new Date(election.startDate), "MMMM d, yyyy")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 text-sm">
          {isEnrolled ? (
            <div className="flex items-center gap-1 text-black font-medium">
              <CheckCircle className="h-4 w-4 text-black" />
              <span>You are enrolled for this election</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-600">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span>You are not enrolled for this election</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
        {isEnrolled ? (
          <Button asChild className="bg-black hover:bg-gray-800 text-white group/btn">
            <Link href={`/enrollment/elections/${election.id}`}>
              View Candidates
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        ) : canEnroll() ? (
          <Button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="bg-black hover:bg-gray-800 text-white group/btn"
          >
            {isEnrolling ? "Redirecting..." : "Enroll"}
            {!isEnrolling && (
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
            )}
          </Button>
        ) : (
          <div className="flex-1" /> 
        )}
        <Button variant="outline" asChild className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
          <Link href={`/enrollment/elections/${election.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
