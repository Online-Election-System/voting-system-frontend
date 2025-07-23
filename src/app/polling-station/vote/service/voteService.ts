import { useState, useEffect, useCallback } from "react";
import type { Vote, VoteCastRequest, VoteRequest } from "@/src/app/vote/types/voter";

// API Configuration
const API_BASE_URL = 'http://localhost:8080/vote/api/v1';

// API utility functions
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // For CORS with credentials
    ...options,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: You are not authorized to perform this action');
    }
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  // Handle 201 Created response (no content expected)
  if (response.status === 201) {
    return {} as T;
  }

  return response.json();
}

// API functions
async function castVoteAPI(vote: VoteRequest): Promise<void> {
  return apiRequest('/votes/cast', {
    method: 'POST',
    body: JSON.stringify(vote),
  });
}

async function getVotesByElection(electionId: string): Promise<Vote[]> {
  return apiRequest(`/votes/election/${electionId}`);
}

async function getVotesByVoter(voterId: string): Promise<Vote[]> {
  return apiRequest(`/votes/voter/${voterId}`);
}

async function getVotesByElectionAndDistrict(electionId: string, district: string): Promise<Vote[]> {
  return apiRequest(`/votes/election/${electionId}/district/${encodeURIComponent(district)}`);
}

// Hooks
export function useCastVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<any>(null);

  const cast = useCallback(async (voteInput: VoteCastRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Create the vote request object without readonly id field
      const voteData: VoteRequest = {
        voterId: voteInput.voterId,
        electionId: voteInput.electionId,
        candidateId: voteInput.candidateId,
        district: voteInput.district,
        timestamp: new Date().toISOString()
      };

      const res = await castVoteAPI(voteData);
      setResult(res);
      return res;
    } catch (err: any) {
      setError(err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  return { cast, loading, error, result };
}

export function useVotesByElection(electionId: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!electionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    getVotesByElection(electionId)
      .then(setVotes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [electionId]);

  return { votes, loading, error };
}

export function useVotesByVoter(voterId: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!voterId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    getVotesByVoter(voterId)
      .then(setVotes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [voterId]);

  return { votes, loading, error };
}

export function useVotesByElectionAndDistrict(electionId: string, district: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!electionId || !district) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    getVotesByElectionAndDistrict(electionId, district)
      .then(setVotes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [electionId, district]);

  return { votes, loading, error };
}