"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MapPin, Phone, Vote, Home, Bug } from "lucide-react"
import { useState } from "react"
import type { VoterProfile as VoterProfileType, ValidationStatus } from "../types/voter"

interface VoterProfileProps {
  validationStatus: ValidationStatus
  voterProfile: VoterProfileType | null
  onProceedToVoting: () => void
}

function getStatusBadge(status: string) {
  switch (status) {
    case "eligible":
      return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Eligible to Vote</Badge>
    case "already-voted":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">🗳️ Already Voted</Badge>
    case "ineligible":
      return <Badge className="bg-red-100 text-red-800 border-red-300">❌ Ineligible</Badge>
    default:
      return null
  }
}

function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null
  
  // Parse MM/DD/YYYY format
  const [month, day, year] = dob.split('/').map(Number)
  if (!month || !day || !year) return null
  
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function VoterProfile({ validationStatus, voterProfile, onProceedToVoting }: VoterProfileProps) {
  const [showDebug, setShowDebug] = useState(false)
  const age = voterProfile ? calculateAge(voterProfile.dob) : null

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Voter Profile
          </div>
         </CardTitle>
      </CardHeader>
      <CardContent>
        {validationStatus === "found" && voterProfile ? (
          <div className="space-y-4">
         {/* Photo and Basic Info */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={voterProfile.photo || "/placeholder.svg"}
                alt="Voter Photo"
                className="w-24 h-32 object-cover border-2 border-gray-300 rounded"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {voterProfile.fullName || "Name Not Available"}
                </h3>
                <p className="text-gray-600 mb-2">
                  NIC: {voterProfile.nationalId || "NIC Not Available"}
                </p>
                          <div className="mb-3">{getStatusBadge(voterProfile.status)}</div>
                <div className="text-sm text-gray-600">
                  {age && (
                    <p className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      Age: {age} {voterProfile.gender && `| ${voterProfile.gender}`}
                    </p>
                  )}
                  {voterProfile.dob && (
                    <p className="text-xs">DOB: {voterProfile.dob}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              {/* District - CRITICAL for voting */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800">Electoral District:</p>
                    <p className="text-blue-700 font-bold">
                      {voterProfile.district || "⚠️ District Not Available"}
                    </p>
                  </div>
                </div>
              </div>

            
              {/* Polling Division */}
              {voterProfile.pollingDivision && (
                <div>
                  <p className="font-medium">Polling Division:</p>
                  <p className="text-gray-600">{voterProfile.pollingDivision}</p>
                </div>
              )}

              {/* Grama Niladhari */}
              {voterProfile.gramaNiladhari && (
                <div>
                  <p className="font-medium">Grama Niladhari:</p>
                  <p className="text-gray-600">{voterProfile.gramaNiladhari}</p>
                </div>
              )}

              {/* Household Information */}
              {voterProfile.householdNo && (
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Household No: {voterProfile.householdNo}</span>
                </div>
              )}

              {voterProfile.mobileNumber && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">{voterProfile.mobileNumber}</span>
                </div>
              )}

              {voterProfile.nicChiefOccupant && (
                <div>
                  <p className="font-medium">Chief Occupant NIC:</p>
                  <p className="text-gray-600">{voterProfile.nicChiefOccupant}</p>
                </div>
              )}

              {voterProfile.status === "already-voted" && voterProfile.votedAt && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="font-medium text-orange-800">Voted At:</p>
                  <p className="text-orange-700">{voterProfile.votedAt}</p>
                </div>
              )}

              {voterProfile.status === "ineligible" && voterProfile.ineligibleReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-800">Reason for Ineligibility:</p>
                  <p className="text-red-700">{voterProfile.ineligibleReason}</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {voterProfile.status === "eligible" && (
              <Button onClick={onProceedToVoting} className="w-full bg-green-600 hover:bg-green-700 mt-4" size="lg">
                <Vote className="h-4 w-4 mr-2" />
                Proceed to Voting Booth
              </Button>
            )}

            {/* Show validation warnings */}
            {!voterProfile.district && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-medium">⚠️ Warning:</p>
                <p className="text-yellow-700 text-sm">
                  District information is missing. This is required for voting.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Enter NIC number to view voter profile</p>
            {validationStatus === "checking" && (
              <p className="text-blue-600 mt-2">Validating voter...</p>
            )}
            {validationStatus === "not-found" && (
              <p className="text-red-600 mt-2">Voter not found or invalid credentials</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}