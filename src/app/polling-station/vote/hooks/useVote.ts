"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  VoterProfile,
  ValidationStatus,
  VoteCastRequest,
} from "@/src/app/polling-station/vote/types/voter";

// API Configuration - All services on port 8080
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

console.log("=== FIXED useVote.ts LOADED (NO SESSION CHANGES) ===");

// ========== VOTER VALIDATION HOOK (FIXED) ==========
export function useVoterValidation() {
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateVoter = async (nic: string, password: string) => {
    console.log("=== STARTING VOTER VALIDATION (NO SESSION CHANGE) ===");
    setIsValidating(true);
    setValidationStatus("checking");
    setVoterProfile(null);

    try {
      const validationPayload = {
        nationalId: nic.trim(),
        password: password.trim(),
      };

      console.log(
        "Validation request:",
        JSON.stringify(validationPayload, null, 2)
      );

      // 🔥 FIXED: Use validation endpoint instead of login endpoint
      const response = await fetch(
        `${API_BASE_URL}/vote/api/v1/voter/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Uses polling station officer's session
          body: JSON.stringify(validationPayload),
        }
      );

      console.log("Validation response status:", response.status);

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          console.log("Voter validation failed - invalid credentials");
          setValidationStatus("not-found");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const validationData = await response.json();
      console.log("=== VALIDATION SUCCESS (NO SESSION CHANGE) ===");
      console.log("Validation data:", JSON.stringify(validationData, null, 2));

      // Extract voter profile from validation response
      const profileData = validationData.voterProfile || {};

      // Map to VoterProfile with comprehensive field mapping

      const mappedProfile: VoterProfile = {
        // Primary identification
        id: profileData.id || nic,
        nationalId: profileData.nic || nic,
        fullName: profileData.fullName || "Unknown User",

        // Contact information
        mobileNumber: profileData.phoneNumber || null,

        // Personal details
        dob: profileData.dob || null,
        gender: profileData.gender || null,

        // CRITICAL: District from household details
        district:
          profileData.electoralDistrict ||
          profileData.district ||
          "District Not Available",

        // Address details from household
        address: profileData.villageStreetEstate || profileData.address || null,

        gramaNiladhari: profileData.gramaNiladhariDivision || null,
        pollingDivision: profileData.pollingDivision || null,
        householdNo: profileData.houseNumber || null,
        nicChiefOccupant: profileData.chiefOccupantId || null,

        // Other fields
        password: "",
        status: "eligible",

        photo: profileData.photoCopyPath || profileData.photo || null,
      };

      console.log("=== FINAL MAPPED PROFILE (NO SESSION CHANGE) ===");
      console.log("District found:", mappedProfile.district);
      console.log("Complete profile:", JSON.stringify(mappedProfile, null, 2));

      setVoterProfile(mappedProfile);
      setValidationStatus("found");
    } catch (error) {
      console.error("=== VALIDATION ERROR ===", error);
      setValidationStatus("not-found");
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validationStatus,
    voterProfile,
    isValidating,
    validateVoter,
  };
}

// ========== ENROLLMENT HOOKS (UNCHANGED) ==========
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
        console.log("=== FETCHING ENROLLED ELECTIONS ===");
        console.log("Voter ID:", voterId);

        const response = await fetch(
          `${API_BASE_URL}/voter-registration/api/v1/voter/${voterId}/elections`,
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch enrolled elections: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Enrolled elections:", data);
        setEnrolledElections(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching enrolled elections:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledElections();
  }, [voterId]);

  return { enrolledElections, loading, error };
}

// ========== VOTING ELIGIBILITY HOOK (UPDATED TO USE VOTE ENDPOINT) ==========
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
        console.log("=== CHECKING VOTING ELIGIBILITY ===");
        console.log("Voter ID:", voterId, "Election ID:", electionId);

        // 🔥 UPDATED: Use the vote service eligibility endpoint
        const response = await fetch(
          `${API_BASE_URL}/vote/api/v1/eligibility/${voterId}/election/${electionId}`,
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to check eligibility: ${response.status}`);
        }

        const data = await response.json();
        console.log("Voting eligibility:", data);
        setEligibility(data);
      } catch (err: any) {
        console.error("Error checking eligibility:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [voterId, electionId]);

  return { eligibility, loading, error };
}

// ========== CANDIDATE HOOKS (UNCHANGED) ==========
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
        console.log("=== FETCHING CANDIDATES WITH ENROLLMENT CHECK ===");
        console.log("Election ID:", electionId, "Voter ID:", voterId);

        let url;
        if (voterId) {
          url = `${API_BASE_URL}/candidate/api/v1/voter/${voterId}/election/${electionId}/candidates`;
        } else {
          url = `${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates/active`;
        }

        console.log("Fetching from URL:", url);

        const response = await fetch(url, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        console.log("Candidates response status:", response.status);

        if (!response.ok) {
          if (response.status === 404 && voterId) {
            console.log(
              "Voter not enrolled or no candidates, trying general endpoint..."
            );
            const fallbackResponse = await fetch(
              `${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates/active`,
              {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (!fallbackResponse.ok) {
              throw new Error(
                `Failed to fetch candidates: ${fallbackResponse.status}`
              );
            }

            const fallbackData = await fallbackResponse.json();
            const candidatesList = Array.isArray(fallbackData)
              ? fallbackData
              : [];
            setCandidates(candidatesList);
            return;
          }

          throw new Error(`Failed to fetch candidates: ${response.status}`);
        }

        const data = await response.json();
        console.log("Candidates data:", JSON.stringify(data, null, 2));

        const candidatesList = Array.isArray(data) ? data : [];
        const activeCandidates = candidatesList.filter(
          (candidate: any) =>
            candidate.isActive !== false && candidate.is_active !== false
        );

        console.log("Active candidates:", activeCandidates);
        setCandidates(activeCandidates);
      } catch (err: any) {
        console.error("=== ERROR FETCHING CANDIDATES ===");
        console.error("Error details:", err);
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

// ========== VOTE CASTING HOOK (UNCHANGED - WORKS WITH POLLING STATION SESSION) ==========
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
        timestamp: new Date().toISOString(),
      };

      console.log("=== CASTING VOTE WITH POLLING STATION SESSION ===");
      console.log("Vote data:", JSON.stringify(voteData, null, 2));

      // 🔥 This uses the polling station officer's session (POLLING_STATION role)
      const response = await fetch(`${API_BASE_URL}/vote/api/v1/votes/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Uses polling station officer's session
        body: JSON.stringify(voteData),
      });

      console.log("Vote response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vote error response:", errorText);
        throw new Error(`Vote failed: ${response.status} - ${errorText}`);
      }

      const res =
        response.status === 201 ? { success: true } : await response.json();
      console.log("=== VOTE SUCCESS ===");
      setResult(res);
      return res;
    } catch (err: any) {
      console.error("=== VOTE FAILED ===");
      console.error("Error details:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cast, loading, error, result };
}

// ========== OTHER HOOKS (UNCHANGED) ==========
export function useActiveElections() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        console.log("=== FETCHING ACTIVE ELECTIONS ===");

        const response = await fetch(
          `${API_BASE_URL}/election/api/v1/elections`,
          {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch elections: ${response.status}`);
        }

        const data = await response.json();
        console.log("All elections:", data);

        const activeElections = Array.isArray(data)
          ? data.filter(
              (election) =>
                election.status === "Active" ||
                election.status === "Upcoming" ||
                election.status === "Scheduled"
            )
          : [];

        setElections(activeElections);
      } catch (err: any) {
        console.error("Error fetching elections:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return { elections, loading, error };
}
