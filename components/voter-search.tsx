"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, XCircle, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import type { ValidationStatus } from "@/types/voter"

interface VoterSearchProps {
  nationalId: string
  setNationalId: (nationalId: string) => void
  password: string
  setPassword: (password: string) => void
  onSearch: (nationalId: string, password: string) => void
  isValidating: boolean
  validationStatus: ValidationStatus
}

export function VoterSearch({ 
  nationalId, 
  setNationalId, 
  password, 
  setPassword, 
  onSearch, 
  isValidating, 
  validationStatus 
}: VoterSearchProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nationalId && password) {
      onSearch(nationalId, password)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Voter Lookup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nationalId">National Identity Card (NIC) Number</Label>
            <Input
              id="nationalId"
              type="text"
              placeholder="Enter NIC number (e.g., 123456789V)"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.toUpperCase())}
              disabled={isValidating}
              className="text-lg"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isValidating}
                className="text-lg pr-10"
                required
                  autoComplete="off"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isValidating}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!nationalId || !password || isValidating}
            className="w-full bg-gray-800 hover:bg-gray-900"
            size="lg"
          >
            {isValidating ? "Searching..." : "Search Voter"}
          </Button>
        </form>

        {validationStatus === "checking" && (
          <Alert className="mt-4">
            <AlertDescription>Searching voter database...</AlertDescription>
          </Alert>
        )}

        {validationStatus === "not-found" && (
          <Alert className="border-red-200 bg-red-50 mt-4">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Invalid NIC number or password. Please verify your credentials.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}