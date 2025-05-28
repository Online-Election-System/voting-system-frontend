import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Election,
  ElectionConfig,
  ElectionUpdate,
} from "../types/election.types";
import {
  getElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
} from "../services/electionService";

export function useElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchElections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getElections();
      setElections(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to fetch elections. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchElectionById = useCallback(async (id: string) => {
    try {
      return await getElectionById(id);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load election details",
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const addElection = useCallback(async (electionConfig: ElectionConfig) => {
    try {
      const result = await createElection(electionConfig);
      await fetchElections();
      toast({
        title: "Success",
        description: "Election created successfully",
      });
      return result;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create election",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchElections]);

  const editElection = useCallback(async (id: string, updateData: ElectionUpdate) => {
    try {
      const result = await updateElection(id, updateData);
      await fetchElections();
      toast({
        title: "Success",
        description: "Election updated successfully",
      });
      return result;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update election",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchElections]);

  const removeElection = useCallback(async (id: string) => {
    try {
      await deleteElection(id);
      await fetchElections();
      toast({
        title: "Success",
        description: "Election deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete election",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchElections]);

  return {
    elections,
    loading,
    error,
    fetchElections,
    fetchElectionById,
    addElection,
    editElection,
    removeElection,
  };
}
