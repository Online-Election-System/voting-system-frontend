"use client"

import { useState, useEffect, useCallback } from "react"
import type { VoterProfile, ValidationStatus, Vote, VoteCastRequest } from "@/types/voter"

// API Configuration - All services on port 8080
const API_BASE_URL = 'http://localhost:8080'

console.log('=== NEW CLEAN useVote.ts LOADED ===')

// ========== VOTER VALIDATION HOOK ==========
export function useVoterValidation() {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateVoter = async (nic: string, password: string) => {
    console.log('=== NEW VALIDATION FUNCTION CALLED ===')
    setIsValidating(true)
    setValidationStatus("checking")
    setVoterProfile(null)

    try {
      console.log('NIC:', nic)
      console.log('Password:', password)
      console.log('Calling URL:', `${API_BASE_URL}/voter-registration/api/v1/voters/login`)
      
      // ONLY call login endpoint - no lookup fallback
      const response = await fetch(`${API_BASE_URL}/voter-registration/api/v1/voters/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nationalId: nic,
          password: password,
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          console.log('=== LOGIN FAILED: WRONG CREDENTIALS ===')
          setValidationStatus("not-found")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      // Success - parse response
      const data = await response.json()
      console.log('=== LOGIN SUCCESS ===')
      console.log('Voter data:', data)

      const mappedProfile: VoterProfile = {
        id: data.id || nic,
        nationalId: data.nationalId || nic,
        fullName: data.fullName || "Unknown",
        mobileNumber: data.mobileNumber || null,
        dob: data.dob || null,
        gender: data.gender || null,
        nicChiefOccupant: data.nicChiefOccupant || null,
        address: data.address || null,
        district: data.district || "Unknown",
        householdNo: data.householdNo || null,
        gramaNiladhari: data.gramaNiladhari || null,
        password: "",
        status: data.status || "eligible",
        photo: data.photo || null,
        votedAt: data.votedAt || null,
        ineligibleReason: data.ineligibleReason || null,
        age: data.age || null,
        nameWithInitials: data.nameWithInitials || null,
        pollingDivision: data.pollingDivision || null,
      }

      setVoterProfile(mappedProfile)
      setValidationStatus("found")
      
    } catch (error) {
      console.log('=== LOGIN ERROR ===')
      console.error(error)
      setValidationStatus("not-found")
    } finally {
      setIsValidating(false)
    }
  }

  return {
    validationStatus,
    voterProfile,
    isValidating,
    validateVoter,
  }
}

// ========== VOTE CASTING HOOK ==========
export function useCastVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);

  const cast = useCallback(async (voteInput: VoteCastRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const voteData: Vote = {
        id: crypto.randomUUID(),
        voterId: voteInput.voterId,
        electionId: voteInput.electionId,
        candidateId: voteInput.candidateId,
        district: voteInput.district,
        timestamp: voteInput.timestamp
      };

      const response = await fetch(`${API_BASE_URL}/vote/api/v1/votes/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error(`Vote failed: ${response.status}`);
      }

      const res = response.status === 201 ? {} : await response.json();
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cast, loading, error, result };
}