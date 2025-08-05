// hooks/elections/useElections.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Election, ElectionCreate, ElectionUpdate } from '../election.types';
import * as electionService from '../services/electionService';
import { electionKeys } from './query-keys';
import { calculateElectionStats } from '../utils/election-status-utils';
import { useCandidates } from '../../candidates/hooks/use-candidates';
import { mergeEnrolledCandidatesWithLatestData } from '../../candidates/utils/data-merge-utils';

// Fetch all elections with real-time status calculation
export const useElections = () => {
  const { data: candidatesData } = useCandidates();

  return useQuery({
    queryKey: electionKeys.lists(),
    queryFn: electionService.getElections,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time status
    refetchOnWindowFocus: true,
    select: (data: Election[]) => {
      // Merge each election with latest candidate data
      const electionsWithUpdatedCandidates = candidatesData?.candidates 
        ? data.map(election => mergeEnrolledCandidatesWithLatestData(election, candidatesData.candidates))
        : data;

      // Calculate real-time stats on the client
      const stats = calculateElectionStats(electionsWithUpdatedCandidates);
      return {
        elections: electionsWithUpdatedCandidates,
        ...stats,
      };
    },
  });
};

// Fetch single election by ID
export const useElection = (id: string, options?: { enabled?: boolean }) => {
  const { data: candidatesData } = useCandidates();

  return useQuery({
    queryKey: electionKeys.detail(id),
    queryFn: () => electionService.getElectionById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (election: Election) => {
      // Merge with latest candidate data
      if (candidatesData?.candidates) {
        return mergeEnrolledCandidatesWithLatestData(election, candidatesData.candidates);
      }
      return election;
    },
  });
};

// Fetch candidates for a specific election
export const useElectionCandidates = (electionId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...electionKeys.detail(electionId), 'candidates'],
    queryFn: () => {
      // Get candidates from the election data itself
      const queryClient = useQueryClient();
      const electionData = queryClient.getQueryData(electionKeys.detail(electionId)) as Election;
      return electionData?.enrolledCandidates || [];
    },
    enabled: options?.enabled ?? !!electionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create election mutation with optimistic updates
export const useCreateElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: electionService.createElection,
    onMutate: async (newElection: ElectionCreate) => {
      await queryClient.cancelQueries({ queryKey: electionKeys.lists() });

      const previousElections = queryClient.getQueryData(electionKeys.lists());

      // Optimistically update cache
      queryClient.setQueryData(electionKeys.lists(), (old: any) => {
        const tempElection = { ...newElection, id: 'temp-' + Date.now() };
        
        if (!old) return [tempElection];
        
        // Handle both raw array and transformed object
        const currentElections = Array.isArray(old) ? old : (old.elections || []);
        const newElections = [...currentElections, tempElection];
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.elections) {
          const stats = calculateElectionStats(newElections);
          return {
            elections: newElections,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return newElections;
      });

      return { previousElections };
    },
    onError: (err, newElection, context) => {
      if (context?.previousElections) {
        queryClient.setQueryData(electionKeys.lists(), context.previousElections);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create election",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Election created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      
      if (data?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [...electionKeys.detail(data.id), 'candidates'] 
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
    },
  });
};

// Update election mutation
export const useUpdateElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ElectionUpdate }) =>
      electionService.updateElection(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: electionKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: electionKeys.lists() });

      const previousElection = queryClient.getQueryData(electionKeys.detail(id));
      const previousElections = queryClient.getQueryData(electionKeys.lists());

      // Optimistic update for single election
      queryClient.setQueryData(electionKeys.detail(id), (old: Election) => ({
        ...old,
        ...data,
      }));

      // Optimistic update for elections list
      queryClient.setQueryData(electionKeys.lists(), (old: any) => {
        if (!old) return old;
        
        // Handle both raw array and transformed object
        const currentElections = Array.isArray(old) ? old : (old.elections || []);
        const updatedElections = currentElections.map((election: Election) =>
          election.id === id ? { ...election, ...data } : election
        );
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.elections) {
          const stats = calculateElectionStats(updatedElections);
          return {
            elections: updatedElections,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return updatedElections;
      });

      return { previousElection, previousElections };
    },
    onError: (err, { id }, context) => {
      if (context?.previousElection) {
        queryClient.setQueryData(electionKeys.detail(id), context.previousElection);
      }
      if (context?.previousElections) {
        queryClient.setQueryData(electionKeys.lists(), context.previousElections);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update election",
        variant: "destructive",
      });
    },
    onSuccess: (data, { id }) => {
      toast({
        title: "Success",
        description: "Election updated successfully",
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [...electionKeys.detail(id), 'candidates'] 
      });
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
    },
  });
};

// Delete election mutation
export const useDeleteElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: electionService.deleteElection,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: electionKeys.lists() });

      const previousElections = queryClient.getQueryData(electionKeys.lists());

      // Optimistically remove from cache
      queryClient.setQueryData(electionKeys.lists(), (old: any) => {
        if (!old) return old;
        
        // Handle both raw array and transformed object
        const currentElections = Array.isArray(old) ? old : (old.elections || []);
        const filteredElections = currentElections.filter((election: Election) => election.id !== id);
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.elections) {
          const stats = calculateElectionStats(filteredElections);
          return {
            elections: filteredElections,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return filteredElections;
      });

      return { previousElections };
    },
    onError: (err, id, context) => {
      if (context?.previousElections) {
        queryClient.setQueryData(electionKeys.lists(), context.previousElections);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete election",
        variant: "destructive",
      });
    },
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: electionKeys.detail(id) });
      queryClient.removeQueries({ queryKey: [...electionKeys.detail(id), 'candidates'] });
      toast({
        title: "Success",
        description: "Election deleted successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
    },
  });
};

// Prefetch election for better UX
export const usePrefetchElection = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: electionKeys.detail(id),
      queryFn: () => electionService.getElectionById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Prefetch election candidates
export const usePrefetchElectionCandidates = () => {
  const queryClient = useQueryClient();

  return (electionId: string) => {
    queryClient.prefetchQuery({
      queryKey: electionKeys.detail(electionId),
      queryFn: () => electionService.getElectionById(electionId),
      staleTime: 5 * 60 * 1000,
    });
  };
};
