// hooks/elections/useElections.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Election, ElectionConfig, ElectionUpdate } from '../election.types';
import * as electionService from '../services/electionService';
import { electionKeys } from './query-keys';
import { calculateElectionStats } from '../utils/election-status-utils';

// Fetch all elections with real-time status calculation
export const useElections = () => {
  return useQuery({
    queryKey: electionKeys.lists(),
    queryFn: electionService.getElections,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time status
    refetchOnWindowFocus: true,
    select: (data: Election[]) => {
      // Calculate real-time stats on the client
      const stats = calculateElectionStats(data);
      return {
        elections: data,
        ...stats,
      };
    },
  });
};

// Fetch single election by ID
export const useElection = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: electionKeys.detail(id),
    queryFn: () => electionService.getElectionById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create election mutation with optimistic updates
export const useCreateElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: electionService.createElection,
    onMutate: async (newElection: ElectionConfig) => {
      await queryClient.cancelQueries({ queryKey: electionKeys.lists() });

      const previousElections = queryClient.getQueryData(electionKeys.lists());

      // Optimistically update cache
      queryClient.setQueryData(electionKeys.lists(), (old: any) => {
        if (!old) return [{ ...newElection, id: 'temp-' + Date.now() }];
        return [...old.elections || old, { ...newElection, id: 'temp-' + Date.now() }];
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Election created successfully",
      });
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
        const elections = old.elections || old;
        return {
          ...old,
          elections: elections.map((election: Election) =>
            election.id === id ? { ...election, ...data } : election
          ),
        };
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Election updated successfully",
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
        const elections = old.elections || old;
        return {
          ...old,
          elections: elections.filter((election: Election) => election.id !== id),
        };
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
