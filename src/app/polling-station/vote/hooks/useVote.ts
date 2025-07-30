"use client"

import { useState, useEffect, useCallback } from "react"
import type { VoterProfile, ValidationStatus, VoteCastRequest } from "@/src/app/polling-station/vote/types/voter"

// API Configuration - All services on port 8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

console.log('=== ENROLLMENT ENHANCED useVote.ts LOADED ===')

// ========== VOTER VALIDATION HOOK ==========
export function useVoterValidation() {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateVoter = async (nic: string, password: string) => {
    console.log('=== STARTING VOTER VALIDATION WITH ENROLLMENT ===')
    setIsValidating(true)
    setValidationStatus("checking")
    setVoterProfile(null)

    try {
      const loginPayload = {
        nic: nic.trim(),
        password: password.trim()
      };
      
      console.log('Login request:', JSON.stringify(loginPayload, null, 2))
      
      // Step 1: Login to get basic user info
      const response = await fetch(`${API_BASE_URL}/voter-registration/api/v1/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginPayload),
      })

      console.log('Login response status:', response.status)

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          setValidationStatus("not-found")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const loginData = await response.json()
      console.log('=== LOGIN SUCCESS ===')
      console.log('Login data:', JSON.stringify(loginData, null, 2))

      // Step 2: Get complete voter profile with household details (CRITICAL for district)
      console.log('=== FETCHING COMPLETE PROFILE WITH HOUSEHOLD DETAILS ===')
      const profileResponse = await fetch(`${API_BASE_URL}/voter-registration/api/v1/profile/${loginData.userId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      let completeProfileData = loginData;
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('=== COMPLETE PROFILE WITH HOUSEHOLD DETAILS ===')
        console.log('Profile data:', JSON.stringify(profileData, null, 2))
        
        // Merge login data with complete profile data
        completeProfileData = { ...loginData, ...profileData };
      } else {
        console.log('Could not fetch complete profile, using login data only')
        console.log('Profile response status:', profileResponse.status)
      }

      // Map to VoterProfile with comprehensive field mapping
      const mappedProfile: VoterProfile = {
        // Primary identification
        id: completeProfileData.id || completeProfileData.userId || nic,
        nationalId: completeProfileData.nic || nic,
        fullName: completeProfileData.fullName || completeProfileData.full_name || "Unknown User",
        
        // Contact information
        mobileNumber: completeProfileData.phoneNumber || completeProfileData.phone_number || null,
        
        // Personal details
        dob: completeProfileData.dob || null,
        gender: completeProfileData.gender || null,
        
        // CRITICAL: District from household details (this is the key fix)
        district: completeProfileData.electoralDistrict || 
                 completeProfileData.electoral_district || 
                 completeProfileData.district || 
                 "District Not Available",
        
        // Address details from household
        address: completeProfileData.villageStreetEstate || 
                completeProfileData.village_street_estate || 
                completeProfileData.address || null,
                
        gramaNiladhari: completeProfileData.gramaNiladhariDivision || 
                       completeProfileData.grama_niladhari_division || null,
                       
        pollingDivision: completeProfileData.pollingDivision || 
                        completeProfileData.polling_division || null,
                        
        householdNo: completeProfileData.houseNumber || 
                    completeProfileData.house_number || null,
        
        // Other fields
        nicChiefOccupant: completeProfileData.chiefOccupantId || null,
        password: "",
        status: "eligible",
        photo: completeProfileData.photo || null,
     
      }

      console.log('=== FINAL MAPPED PROFILE ===')
      console.log('District found:', mappedProfile.district)
      console.log('Complete profile:', JSON.stringify(mappedProfile, null, 2))

      setVoterProfile(mappedProfile)
      setValidationStatus("found")
      
    } catch (error) {
      console.error('=== LOGIN ERROR ===', error)
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

// ========== ENROLLMENT HOOKS ==========
export function useVoterEnrolledElections(voterId: string) {
  const [enrolledElections, setEnrolledElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!voterId) {
      setLoading(false);
      return;
    }

    const fetchEnrolledElections = async () => {
      try {
        console.log('=== FETCHING ENROLLED ELECTIONS ===')
        console.log('Voter ID:', voterId)
        
        const response = await fetch(`${API_BASE_URL}/voter-registration/api/v1/voter/${voterId}/elections`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch enrolled elections: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Enrolled elections:', data)
        setEnrolledElections(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Error fetching enrolled elections:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledElections();
  }, [voterId]);

  return { enrolledElections, loading, error };
}

// ========== ELECTION HOOKS ==========
export function useActiveElections() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        console.log('=== FETCHING ACTIVE ELECTIONS ===')
        
        const response = await fetch(`${API_BASE_URL}/election/api/v1/elections`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch elections: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('All elections:', data)
        
        const activeElections = Array.isArray(data) ? data.filter(election => 
          election.status === 'Active' || 
          election.status === 'Upcoming' || 
          election.status === 'Scheduled'
        ) : [];
        
        setElections(activeElections);
      } catch (err: any) {
        console.error('Error fetching elections:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return { elections, loading, error };
}

// ========== CANDIDATE HOOKS (ENROLLMENT-BASED) ==========
export function useCandidatesByElection(electionId: string, voterId?: string) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!electionId) {
      setLoading(false);
      setCandidates([]);
      return;
    }

    const fetchCandidates = async () => {
      try {
        console.log('=== FETCHING CANDIDATES WITH ENROLLMENT CHECK ===')
        console.log('Election ID:', electionId, 'Voter ID:', voterId)
        
        let url;
        if (voterId) {
          // Use enrollment-based endpoint
          url = `${API_BASE_URL}/candidate/api/v1/voter/${voterId}/election/${electionId}/candidates`;
        } else {
          // Fallback to general endpoint
          url = `${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates/active`;
        }
        
        console.log('Fetching from URL:', url)
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('Candidates response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 404 && voterId) {
            console.log('Voter not enrolled or no candidates, trying general endpoint...')
            const fallbackResponse = await fetch(`${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates/active`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to fetch candidates: ${fallbackResponse.status}`);
            }
            
            const fallbackData = await fallbackResponse.json();
            const candidatesList = Array.isArray(fallbackData) ? fallbackData : [];
            setCandidates(candidatesList);
            return;
          }
          
          throw new Error(`Failed to fetch candidates: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Candidates data:', JSON.stringify(data, null, 2));
        
        const candidatesList = Array.isArray(data) ? data : [];
        const activeCandidates = candidatesList.filter((candidate: any) => 
          candidate.isActive !== false && candidate.is_active !== false
        );
        
        console.log('Active candidates:', activeCandidates);
        setCandidates(activeCandidates);
        
      } catch (err: any) {
        console.error('=== ERROR FETCHING CANDIDATES ===');
        console.error('Error details:', err);
        setError(err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [electionId, voterId]);

  return { candidates, loading, error };
}

// ========== ENROLLMENT STATUS HOOKS ==========
export function useVoterEnrollmentStatus(voterId: string, electionId: string) {
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!voterId || !electionId) {
      setLoading(false);
      return;
    }

    const checkEnrollment = async () => {
      try {
        console.log('=== CHECKING ENROLLMENT STATUS ===')
        console.log('Voter ID:', voterId, 'Election ID:', electionId)
        
        const response = await fetch(`${API_BASE_URL}/election/api/v1/voter/${voterId}/election/${electionId}/enrolled`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to check enrollment: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Enrollment status:', data)
        setEnrollmentStatus(data);
      } catch (err: any) {
        console.error('Error checking enrollment:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkEnrollment();
  }, [voterId, electionId]);

  return { enrollmentStatus, loading, error };
}

export function useVotingEligibility(voterId: string, electionId: string) {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!voterId || !electionId) {
      setLoading(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        console.log('=== CHECKING VOTING ELIGIBILITY ===')
        console.log('Voter ID:', voterId, 'Election ID:', electionId)
        
        const response = await fetch(`${API_BASE_URL}/vote/api/v1/eligibility/${voterId}/election/${electionId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to check eligibility: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Voting eligibility:', data)
        setEligibility(data);
      } catch (err: any) {
        console.error('Error checking eligibility:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [voterId, electionId]);

  return { eligibility, loading, error };
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
      const voteData = {
        voterId: voteInput.voterId,
        electionId: voteInput.electionId,
        candidateId: voteInput.candidateId,
        district: voteInput.district,
        timestamp: new Date().toISOString()
      };

      console.log('=== CASTING VOTE ===');
      console.log('Vote data:', JSON.stringify(voteData, null, 2));

      const response = await fetch(`${API_BASE_URL}/vote/api/v1/votes/cast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(voteData),
      });

      console.log('Vote response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vote error response:', errorText);
        throw new Error(`Vote failed: ${response.status} - ${errorText}`);
      }

      const res = response.status === 201 ? { success: true } : await response.json();
      console.log('=== VOTE SUCCESS ===');
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