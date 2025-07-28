"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Shield } from "lucide-react"
import type { ValidationResult } from "@/app/results/types"

interface ValidationCardProps {
  validation: ValidationResult
}

export function ValidationCard({ validation }: ValidationCardProps) {
  const getStatusIcon = () => {
    if (validation.isValid && validation.errors.length === 0) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (validation.errors.length > 0) {
      return <XCircle className="h-5 w-5 text-red-600" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    if (validation.isValid && validation.errors.length === 0) {
      return "bg-green-50 border-green-200"
    } else if (validation.errors.length > 0) {
      return "bg-red-50 border-red-200"
    } else {
      return "bg-yellow-50 border-yellow-200"
    }
  }

  const getStatusText = () => {
    if (validation.isValid && validation.errors.length === 0) {
      return "All data validated successfully"
    } else if (validation.errors.length > 0) {
      return "Data validation failed"
    } else {
      return "Data validation completed with warnings"
    }
  }

  return (
    <Card className={getStatusColor()}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Data Validation</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={validation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </AlertDescription>
        </Alert>

        {/* Validation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-red-600">
              {validation.statistics.candidatesWithMismatchedTotals}
            </div>
            <div className="text-sm text-gray-600">Mismatched Totals</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-orange-600">
              {validation.statistics.candidatesWithNegativeVotes}
            </div>
            <div className="text-sm text-gray-600">Negative Votes</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-yellow-600">{validation.statistics.candidatesWithMissingData}</div>
            <div className="text-sm text-gray-600">Missing Data</div>
          </div>
        </div>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-800">Validation Errors:</h4>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="ml-2 text-red-800">{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {validation.isValid && validation.errors.length === 0 && (
          <div className="flex items-center justify-center p-4 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              All election data has been validated and is ready for analysis
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}