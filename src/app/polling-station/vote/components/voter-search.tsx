"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, XCircle, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { useState } from "react"
import type { ValidationStatus } from "../types/voter"

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
  const [attemptCount, setAttemptCount] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nationalId && password) {
      setAttemptCount(prev => prev + 1)
      onSearch(nationalId, password)
    }
  }

  const handleNicChange = (value: string) => {
    // Convert to uppercase and remove any non-alphanumeric characters except 'V' at the end
    const cleaned = value.toUpperCase().replace(/[^0-9V]/g, '')
    setNationalId(cleaned)
  }

  const isValidNic = (nic: string) => {
    // Basic NIC validation for Sri Lankan format
    const oldFormat = /^[0-9]{9}[VX]$/i  // 9 digits + V or X
    const newFormat = /^[0-9]{12}$/       // 12 digits
    return oldFormat.test(nic) || newFormat.test(nic)
  }

  const getValidationMessage = () => {
    switch (validationStatus) {
      case "checking":
        return {
          type: "info" as const,
          message: "Searching voter database...",
          icon: <Loader2 className="h-4 w-4 animate-spin" />
        }
      case "found":
        return {
          type: "success" as const,
          message: "Voter found! Profile loaded successfully.",
          icon: <CheckCircle className="h-4 w-4 text-green-600" />
        }
      case "not-found":
        return {
          type: "error" as const,
          message: "Invalid NIC number or password. Please verify your credentials and try again.",
          icon: <XCircle className="h-4 w-4 text-red-600" />
        }
      default:
        return null
    }
  }

  const validationMessage = getValidationMessage()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Voter Lookup
          </div>
          {attemptCount > 0 && (
            <span className="text-xs text-gray-500">
              Attempts: {attemptCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NIC Number Input */}
          <div className="space-y-2">
            <Label htmlFor="nationalId">National Identity Card (NIC) Number</Label>
            <Input
              id="nationalId"
              type="text"
              placeholder="Enter NIC number (e.g., 123456789V or 200012345678)"
              value={nationalId}
              onChange={(e) => handleNicChange(e.target.value)}
              disabled={isValidating}
              className={`text-lg ${
                nationalId && !isValidNic(nationalId) 
                  ? 'border-red-300 focus:border-red-500' 
                  : ''
              }`}
              required
              autoComplete="off"
              maxLength={12}
            />
            {nationalId && !isValidNic(nationalId) && (
              <p className="text-red-600 text-xs">
                Please enter a valid NIC number (9 digits + V/X or 12 digits)
              </p>
            )}
          </div>

          {/* Password Input */}
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
                minLength={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isValidating}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use the password provided during voter registration
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!nationalId || !password || !isValidNic(nationalId) || isValidating}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Search Voter
              </>
            )}
          </Button>
        </form>

        {/* Validation Status Messages */}
        {validationMessage && (
          <Alert 
            className={`mt-4 ${
              validationMessage.type === 'error' 
                ? 'border-red-200 bg-red-50' 
                : validationMessage.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-blue-200 bg-blue-50'
            }`}
          >
            {validationMessage.icon}
            <AlertDescription 
              className={
                validationMessage.type === 'error' 
                  ? 'text-red-800' 
                  : validationMessage.type === 'success'
                  ? 'text-green-800'
                  : 'text-blue-800'
              }
            >
              {validationMessage.message}
              {validationMessage.type === 'error' && attemptCount > 2 && (
                <div className="mt-2 text-sm">
                  <p>Having trouble? Please check:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Your NIC number is correct</li>
                    <li>Your password matches registration</li>
                    <li>You are registered to vote</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use your National Identity Card number as registered</li>
            <li>• Password is case-sensitive</li>
            <li>• Contact election officials if you cannot access your account</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}