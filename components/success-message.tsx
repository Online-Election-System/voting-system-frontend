"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, User } from "lucide-react"

interface SuccessMessageProps {
  onReset: () => void
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-800 mb-2">Vote Successfully Cast!</h1>
            <p className="text-green-700">Your vote has been recorded securely.</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">Thank you for participating in the democratic process.</p>

            <Button onClick={onReset} className="w-full bg-transparent" variant="outline">
              <User className="h-4 w-4 mr-2" />
              Return to Validation
            </Button>

            <p className="text-xs text-gray-500">This screen will automatically close in a few seconds.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
