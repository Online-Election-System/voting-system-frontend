// src/services/electionService.ts
import { getAuthHeaders } from '../../../../services/authService';
import { Election, ElectionConfig, ElectionUpdate } from '../types/election.types';

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Get all elections
export const getElections = async (): Promise<Election[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch elections: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred while fetching elections');
  }
};

// Get a single election by ID
export const getElectionById = async (electionId: string): Promise<Election> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections/${electionId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch election: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching election ${electionId}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`An unknown error occurred while fetching election ${electionId}`);
  }
};

// Create a new election
export const createElection = async (electionData: ElectionConfig): Promise<Election> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Add authentication token
      },
      body: JSON.stringify(electionData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create election: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating election:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred while creating election');
  }
};

// Update an existing election
export const updateElection = async (electionId: string, updateData: ElectionUpdate): Promise<Election> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections/${electionId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), // Add authentication token
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update election: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating election ${electionId}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`An unknown error occurred while updating election ${electionId}`);
  }
};

// Delete an election
export const deleteElection = async (electionId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/election/api/v1/elections/${electionId}/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(), // Add authentication token
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete election: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting election ${electionId}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`An unknown error occurred while deleting election ${electionId}`);
  }
};
