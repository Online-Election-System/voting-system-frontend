"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MapPin, Phone, Mail, Vote } from "lucide-react"
import type { VoterProfile as VoterProfileType, ValidationStatus } from "@/types/voter"

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

export function VoterProfile({ validationStatus, voterProfile, onProceedToVoting }: VoterProfileProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Voter Profile
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
                <h3 className="text-xl font-bold text-gray-800">{voterProfile.name}</h3>
                <p className="text-gray-600 mb-2">{voterProfile.nameWithInitials}</p>
                <div className="mb-3">{getStatusBadge(voterProfile.status)}</div>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Age: {voterProfile.age} | {voterProfile.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                <div>
                  <p className="font-medium">Address:</p>
                  <p className="text-gray-600">{voterProfile.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">District:</p>
                  <p className="text-gray-600">{voterProfile.district}</p>
                </div>
                <div>
                  <p className="font-medium">Polling Division:</p>
                  <p className="text-gray-600">{voterProfile.pollingDivision}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">{voterProfile.phone}</span>
              </div>

              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">{voterProfile.email}</span>
              </div>

              <div>
                <p className="font-medium">Registration Date:</p>
                <p className="text-gray-600">{new Date(voterProfile.registrationDate).toLocaleDateString()}</p>
              </div>

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
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Enter NIC number to view voter profile</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
