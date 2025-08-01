"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, User } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessMessageProps {
  onReset: () => void;
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown immediately
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Reset to voter search page and clear previous voter profile
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [onReset]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Vote Successfully Cast!
            </h1>
            <p className="text-green-700">
              Your vote has been recorded securely.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Thank you for participating in the democratic process.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                Automatically returning to voter search in:
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {countdown} second{countdown !== 1 ? "s" : ""}
              </p>
            </div>

            <Button
              onClick={onReset}
              className="w-full bg-transparent"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              Return to Validation Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
