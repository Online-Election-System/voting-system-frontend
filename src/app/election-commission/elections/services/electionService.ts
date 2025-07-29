// src/services/electionService.ts
import api from "@/src/lib/axios";
import { Election, ElectionCreate, ElectionUpdate } from "../election.types";

// Get all elections
export const getElections = async (): Promise<Election[]> => {
  try {
    const response = await api.get('/election/api/v1/elections');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching elections:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch elections");
  }
};

// Get a single election by ID
export const getElectionById = async (electionId: string): Promise<Election> => {
  try {
    const response = await api.get(`/election/api/v1/elections/${electionId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching election ${electionId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to fetch election ${electionId}`);
  }
};

// Create a new election with optional candidates
export const createElection = async (electionData: ElectionCreate): Promise<Election> => {
  try {
    console.log("Creating election with data:", electionData);
    
    const response = await api.post('/election/api/v1/elections/create', electionData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating election:", error);
    throw new Error(error.response?.data?.message || "Failed to create election");
  }
};

// Update an existing election with optional candidates
export const updateElection = async (
  electionId: string,
  updateData: ElectionUpdate
): Promise<Election> => {
  try {
    console.log("Updating election with data:", updateData);
    
    const payload = {
      ...updateData,
      candidateIds: updateData.candidateIds || [],
    };

    const response = await api.put(`/election/api/v1/elections/${electionId}/update`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating election ${electionId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to update election ${electionId}`);
  }
};

// Delete an election
export const deleteElection = async (electionId: string): Promise<void> => {
  try {
    await api.delete(`/election/api/v1/elections/${electionId}/delete`);
  } catch (error: any) {
    console.error(`Error deleting election ${electionId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to delete election ${electionId}`);
  }
};