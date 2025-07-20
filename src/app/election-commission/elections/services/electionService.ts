// src/services/electionService.ts
import { getAuthToken, getTestToken } from "@/lib/services/authService";
import { Election, ElectionConfig, ElectionUpdate } from "../election.types";

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

// Get all elections
export const getElections = async (): Promise<Election[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections`);

    if (!response.ok) {
      throw new Error(`Failed to fetch elections: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching elections:", error);
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred while fetching elections");
  }
};

// Get a single election by ID
export const getElectionById = async (
  electionId: string
): Promise<Election> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/election/api/v1/elections/${electionId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch election: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching election ${electionId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while fetching election ${electionId}`
        );
  }
};

// Create a new election
export const createElection = async (
  electionData: ElectionConfig
): Promise<Election> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/election/api/v1/elections/create`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(electionData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create election: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : (electionData as Election);
  } catch (error) {
    console.error("Error creating election:", error);
    throw error;
  }
};

// Update an existing election
export const updateElection = async (
  electionId: string,
  updateData: ElectionUpdate
): Promise<Election> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/election/api/v1/elections/${electionId}/update`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update election: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : (updateData as Election);
  } catch (error) {
    console.error(`Error updating election ${electionId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while updating election ${electionId}`
        );
  }
};

// Delete an election
export const deleteElection = async (electionId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/election/api/v1/elections/${electionId}/delete`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete election: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Error deleting election ${electionId}:`, error);
    throw error instanceof Error
      ? error
      : new Error(
          `An unknown error occurred while deleting election ${electionId}`
        );
  }
};
