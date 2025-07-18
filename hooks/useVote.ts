"use client"

import { useState, useEffect, useCallback } from "react"
import type { VoterProfile, ValidationStatus, Vote, VoteCastRequest } from "@/types/voter"

// API Configuration - All services on port 8080
const API_BASE_URL = 'http://localhost:8080'

console.log('=== FIXED useVote.ts LOADED ===')

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

// ========== ELECTION & CANDIDATE HOOKS ==========
export function useActiveElections() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/election/api/v1/elections`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch elections: ${response.status}`);
        }
        
        const data = await response.json();
        setElections(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return { elections, loading, error };
}

export function useCandidatesByElection(electionId: string) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!electionId) {
      setLoading(false);
      return;
    }

    const fetchCandidates = async () => {
      try {
        console.log('Fetching candidates for election:', electionId);
        
        const response = await fetch(`${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch candidates: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Candidates fetched:', data);
        
        // Use the data directly since it matches our Candidate interface
        setCandidates(data.filter((candidate: any) => candidate.isActive));
      } catch (err: any) {
        console.error('Error fetching candidates:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [electionId]);

  return { candidates, loading, error };
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
      // Send only the required fields - backend will generate id, district, timestamp
      const voteData = {
        voterId: voteInput.voterId,
        electionId: voteInput.electionId,
        candidateId: voteInput.candidateId
      };

      console.log('=== CASTING VOTE ===');
      console.log('Vote data being sent:', JSON.stringify(voteData, null, 2));
      console.log('URL:', `${API_BASE_URL}/vote/api/v1/votes/cast`);

      const response = await fetch(`${API_BASE_URL}/vote/api/v1/votes/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(voteData),
      });

      console.log('Vote response status:', response.status);
      console.log('Vote response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vote error response:', errorText);
        throw new Error(`Vote failed: ${response.status} - ${errorText}`);
      }

      const res = response.status === 201 ? { success: true } : await response.json();
      console.log('=== VOTE SUCCESS ===');
      console.log('Vote result:', res);
      setResult(res);
      return res;
    } catch (err: any) {
      console.error('=== VOTE FAILED ===');
      console.error('Error details:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cast, loading, error, result };
}