// src/app/election-commission/candidates/services/candidateService.ts
import api from "@/src/lib/axios";
import {
  Candidate,
  CandidateFormData,
  CandidateUpdate,
} from "../candidate.types";

// Get all candidates (active and inactive)
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await api.get('/candidate/api/v1/candidates');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch candidates");
  }
};

// Get all active candidates only
export const getAllActiveCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await api.get('/candidate/api/v1/candidates?activeOnly=true');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching active candidates:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch active candidates");
  }
};

// Get candidate by ID
export const getCandidateById = async (candidateId: string): Promise<Candidate> => {
  try {
    const response = await api.get(`/candidate/api/v1/candidates/${candidateId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching candidate ${candidateId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to fetch candidate ${candidateId}`);
  }
};

// Get candidates by election ID
export const getCandidatesByElection = async (electionId: string): Promise<Candidate[]> => {
  try {
    const response = await api.get(`/candidate/api/v1/elections/${electionId}/candidates`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching candidates for election ${electionId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to fetch candidates for election ${electionId}`);
  }
};

// Get candidates by election and party
export const getCandidatesByElectionAndParty = async (
  electionId: string,
  partyName: string
): Promise<Candidate[]> => {
  try {
    const response = await api.get(
      `/candidate/api/v1/elections/${electionId}/candidates/party/${encodeURIComponent(partyName)}`
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching candidates for election ${electionId} and party ${partyName}:`, error);
    throw new Error(error.response?.data?.message || `Failed to fetch candidates for election ${electionId} and party ${partyName}`);
  }
};

// Check if candidate is active
export const isCandidateActive = async (candidateId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/candidate/api/v1/candidates/${candidateId}/active`);
    return response.data;
  } catch (error: any) {
    console.error(`Error checking candidate ${candidateId} status:`, error);
    throw new Error(error.response?.data?.message || `Failed to check candidate ${candidateId} status`);
  }
};

// Create a new candidate
export const createCandidate = async (candidateData: CandidateFormData): Promise<Candidate> => {
  try {
    console.log("Creating candidate with data:", candidateData);

    // Prepare clean payload
    const payload: Record<string, any> = {
      candidateName: candidateData.candidateName,
      partyName: candidateData.partyName,
      partyColor: candidateData.partyColor,
    };

    // Add optional fields only if they exist
    if (candidateData.partySymbol) payload.partySymbol = candidateData.partySymbol;
    if (candidateData.candidateImage) payload.candidateImage = candidateData.candidateImage;
    if (candidateData.email) payload.email = candidateData.email;
    if (candidateData.phone) payload.phone = candidateData.phone;
    if (candidateData.description) payload.description = candidateData.description;

    console.log("Sending payload:", payload);

    const response = await api.post('/candidate/api/v1/candidates/create', payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating candidate:", error);
    throw new Error(error.response?.data?.message || "Failed to create candidate");
  }
};

// Update an existing candidate
export const updateCandidate = async (
  candidateId: string,
  updateData: CandidateUpdate
): Promise<Candidate> => {
  try {
    console.log("Updating candidate with data:", updateData);

    const payload = {
      candidateName: updateData.candidateName,
      partyName: updateData.partyName,
      partyColor: updateData.partyColor,
      partySymbol: updateData.partySymbol,
      candidateImage: updateData.candidateImage,
      position: updateData.position,
      email: updateData.email,
      phone: updateData.phone,
      description: updateData.description,
    };

    const response = await api.put(`/candidate/api/v1/candidates/${candidateId}/update`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating candidate ${candidateId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to update candidate ${candidateId}`);
  }
};

// Delete a candidate
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    await api.delete(`/candidate/api/v1/candidates/${candidateId}/delete`);
  } catch (error: any) {
    console.error(`Error deleting candidate ${candidateId}:`, error);
    throw new Error(error.response?.data?.message || `Failed to delete candidate ${candidateId}`);
  }
};

// Trigger system-wide candidate status update
export const updateCandidateStatuses = async (): Promise<void> => {
  try {
    await api.post('/candidate/api/v1/admin/update-statuses');
  } catch (error: any) {
    console.error("Error updating candidate statuses:", error);
    throw new Error(error.response?.data?.message || "Failed to update candidate statuses");
  }
};
