"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, XCircle } from "lucide-react"
import type { ValidationStatus } from "@/types/voter"

interface VoterSearchProps {
  nicNumber: string
  setNicNumber: (nic: string) => void
  onSearch: (nic: string) => void
  isValidating: boolean
  validationStatus: ValidationStatus
}

export function VoterSearch({ nicNumber, setNicNumber, onSearch, isValidating, validationStatus }: VoterSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Voter Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nic">National Identity Card (NIC) Number</Label>
          <Input
            id="nic"
            type="text"
            placeholder="Enter NIC number (e.g., 123456789V)"
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value.toUpperCase())}
            disabled={isValidating}
            className="text-lg"
          />
        </div>

        <Button
          onClick={() => onSearch(nicNumber)}
          disabled={!nicNumber || isValidating}
          className="w-full bg-gray-800 hover:bg-gray-900"
          size="lg"
        >
          {isValidating ? "Searching..." : "Search Voter"}
        </Button>

        {validationStatus === "checking" && (
          <Alert>
            <AlertDescription>Searching voter database...</AlertDescription>
          </Alert>
        )}

        {validationStatus === "not-found" && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Voter not found in the database. Please verify the NIC number.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
