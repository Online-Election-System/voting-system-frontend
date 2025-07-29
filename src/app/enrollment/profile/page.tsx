"use client"

import { useEffect, useState } from "react"
import { User, MapPin, Calendar, CheckCircle, AlertCircle, Mail, Briefcase, Heart, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button" // Assuming Button is available for error state

type EnrolledElection = {
  electionId: string
  title: string
  electionDate: string | { year: number; month: number; day: number } | null
  status: string
  enrollmentDate: string | { year: number; month: number; day: number } | null
}

type UserProfile = {
  fullName: string
  nic: string
  email: string
  dob: string | { year: number; month: number; day: number } | null
  gender: string
  civilStatus: string
  role: string
  electoralDistrict: string
  pollingDivision: string
  fullAddress: string
  voterStatus: string | null
  registrationDate: string | { year: number; month: number; day: number } | null
  enrolledElections: EnrolledElection[]
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Step 1: Get the user's NIC from localStorage
    const userNic = localStorage?.getItem("userNic")
    if (!userNic) {
      setError("User not identified. Please login again.")
      setLoading(false)
      return
    }

    // Step 2: Fetch profile data using the new endpoint and the NIC
    fetch(`http://localhost:8080/api/v1/profile/${userNic}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorJson = await res.json()
          throw new Error(errorJson.message || `HTTP error! status: ${res.status}`)
        }
        const result = await res.json()
        console.log("API Response:", result) // Debug log
        setUserData(result)
      })
      .catch((err) => {
        console.error("Profile fetch error:", err)
        setError(err.message || "Failed to load profile.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const formatDate = (dateValue: string | { year: number; month: number; day: number } | null): string => {
    if (!dateValue) {
      return "N/A"
    }
    try {
      let dateObj: Date
      if (typeof dateValue === "string") {
        // Handle string dates
        if (dateValue.trim() === "") {
          return "N/A"
        }
        dateObj = new Date(dateValue)
      } else if (typeof dateValue === "object" && dateValue.year && dateValue.month && dateValue.day) {
        // Handle Ballerina time:Date object format
        dateObj = new Date(dateValue.year, dateValue.month - 1, dateValue.day)
      } else {
        return "N/A"
      }
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date detected:", dateValue)
        return "Invalid Date"
      }
      // Format the date
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (err) {
      console.error("Date formatting error:", err, "for value:", dateValue)
      return "Invalid Date"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Profile</h2>
          <p className="text-gray-600 text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-black hover:bg-gray-800 text-white mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Not Found</h2>
          <p className="text-gray-600 text-lg">No user profile data could be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">My Profile</h1>
          <p className="text-lg text-gray-600">View your personal information and election enrollment status.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Profile Card */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="flex flex-col items-center text-center p-6 border-b border-gray-100">
              <Avatar className="h-24 w-24 mb-4 border-2 border-black">
                <AvatarImage src="/placeholder-user.jpg" alt={`${userData.fullName}'s avatar`} />
                <AvatarFallback className="bg-black text-white text-3xl font-semibold">
                  {userData.fullName
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-gray-900">{userData.fullName}</CardTitle>
              <CardDescription className="text-gray-600">NIC: {userData.nic}</CardDescription>
              <Badge
                variant={userData.voterStatus === "Active" ? "default" : "secondary"}
                className={`mt-3 px-3 py-1 text-sm font-medium ${
                  userData.voterStatus === "Active"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
              >
                {userData.voterStatus || "N/A"}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Electoral District</p>
                  <p className="text-sm text-gray-600">{userData.electoralDistrict || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Date of Birth</p>
                  <p className="text-sm text-gray-600">{formatDate(userData.dob)}</p>
                </div>
              </div>

              {userData.voterStatus && (
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Registration Date</p>
                    <p className="text-sm text-gray-600">{formatDate(userData.registrationDate)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">Personal Information</CardTitle>
              <CardDescription className="text-gray-600">Your basic contact and demographic details.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <p className="text-sm text-gray-600">{userData.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Gender</p>
                  <p className="text-sm text-gray-600">{userData.gender || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Civil Status</p>
                  <p className="text-sm text-gray-600">{userData.civilStatus || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Role</p>
                  <p className="text-sm text-gray-600">{userData.role || "N/A"}</p>
                </div>
              </div>
              <div className="col-span-full flex items-start gap-3">
                <Home className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Full Address</p>
                  <p className="text-sm text-gray-600">{userData.fullAddress || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Polling Division</p>
                  <p className="text-sm text-gray-600">{userData.pollingDivision || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Election Enrollment Status Card */}
          <Card className="lg:col-span-3 bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">Election Enrollment Status</CardTitle>
              <CardDescription className="text-gray-600">
                Your enrollment status for approved elections.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {userData.enrolledElections.length > 0 ? (
                <div className="space-y-4">
                  {userData.enrolledElections.map((election) => (
                    <div
                      key={election.electionId}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-gray-900 text-lg">{election.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <Calendar className="inline-block h-3.5 w-3.5 mr-1 text-gray-500" />
                          Election Date: {formatDate(election.electionDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <CheckCircle className="inline-block h-3.5 w-3.5 mr-1 text-gray-500" />
                          Enrolled: {formatDate(election.enrollmentDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm font-medium">
                        {election.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    {userData.voterStatus === "Active"
                      ? "You are not enrolled in any elections yet."
                      : "You are not an approved voter, so you cannot enroll in elections."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
