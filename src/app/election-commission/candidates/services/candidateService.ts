// src/app/election-commission/candidates/services/candidateService.ts
import { getAuthToken, getTestToken } from "@/lib/services/authService";
import { Candidate, CandidateConfig, CandidateUpdate } from "../candidate.types";

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Check if we're in development environment
const isDevEnvironment = process.env.NODE_ENV === "development";

// Helper function to get headers with conditional auth
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Get token based on environment
  let token: string | null = null;
  if (isDevEnvironment) {
    token = getTestToken(); // Use the test token in development
  } else {
    token = getAuthToken(); // Use the actual auth token in production
  }

  // Add auth header if a token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (!isDevEnvironment) {
    console.error("Authorization token is missing in production environment.");
  }

  return headers;
};

// Get all active candidates
export const getAllActiveCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/api/v1/candidates`);

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred while fetching candidates");
  }
};

// Get candidate by ID
export const getCandidateById = async (candidateId: string): Promise<Candidate> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/candidates/${candidateId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candidate: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching candidate ${candidateId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while fetching candidate ${candidateId}`
        );
  }
};

// Get candidates by election ID
export const getCandidatesByElection = async (electionId: string): Promise<Candidate[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates for election: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching candidates for election ${electionId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while fetching candidates for election ${electionId}`
        );
  }
};

// Get candidates by election and party
export const getCandidatesByElectionAndParty = async (
  electionId: string,
  partyName: string
): Promise<Candidate[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/elections/${electionId}/candidates/party/${encodeURIComponent(partyName)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candidates by party: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching candidates for election ${electionId} and party ${partyName}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while fetching candidates for election ${electionId} and party ${partyName}`
        );
  }
};

// Check if candidate is active
export const isCandidateActive = async (candidateId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/candidates/${candidateId}/active`
    );

    if (!response.ok) {
      throw new Error(`Failed to check candidate status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking candidate ${candidateId} status:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while checking candidate ${candidateId} status`
        );
  }
};

// Create a new candidate
export const createCandidate = async (
  candidateData: CandidateConfig
): Promise<Candidate> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/candidates/create`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(candidateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create candidate: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : (candidateData as Candidate);
  } catch (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }
};

// Update an existing candidate
export const updateCandidate = async (
  candidateId: string,
  updateData: CandidateUpdate
): Promise<Candidate> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/candidates/${candidateId}/update`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update candidate: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : (updateData as Candidate);
  } catch (error) {
    console.error(`Error updating candidate ${candidateId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while updating candidate ${candidateId}`
        );
  }
};

// Delete a candidate
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/candidate/api/v1/candidates/${candidateId}/delete`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete candidate: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Error deleting candidate ${candidateId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while deleting candidate ${candidateId}`
        );
  }
};
