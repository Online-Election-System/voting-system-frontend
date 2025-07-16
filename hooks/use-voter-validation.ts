"use client"

import { useState } from "react"
import type { VoterProfile, ValidationStatus } from "@/types/voter"
import { voterDatabase } from "@/data/mockData"

export function useVoterValidation() {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateVoter = async (nic: string) => {
    setIsValidating(true)
    setValidationStatus("checking")
    setVoterProfile(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Look up voter in mock database
    const voter = voterDatabase[nic as keyof typeof voterDatabase]

    if (voter) {
      setVoterProfile(voter)
      setValidationStatus("found")
    } else {
      setValidationStatus("not-found")
    }

    setIsValidating(false)
  }

  return {
    validationStatus,
    voterProfile,
    isValidating,
    validateVoter,
  }
}
