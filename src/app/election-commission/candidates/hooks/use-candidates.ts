// hooks/candidates/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Candidate, CandidateConfig, CandidateUpdate } from '../candidate.types';
import * as candidateService from '../services/candidateService';
import { candidateKeys } from './query-keys';

// Calculate candidate statistics with null safety
const calculateCandidateStats = (candidates: Candidate[]) => {
  const activeCandidates = candidates.filter(c => c.isActive !== false);
  
  // Get unique parties with null/undefined safety
  const parties = candidates
    .map(c => c.partyName)
    .filter((party): party is string => Boolean(party)); // Type guard to filter out undefined
  
  const uniqueParties = [...new Set(parties)].sort();

  // Calculate candidates by party with null safety
  const candidatesByParty = uniqueParties.reduce((acc, party) => {
    if (party) { // Additional null check
      acc[party] = candidates.filter(c => 
        (c.partyName === party) && c.isActive !== false
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCandidates: candidates.length,
    activeCandidates: activeCandidates.length,
    partiesCount: uniqueParties.length,
    uniqueParties,
    candidatesByParty,
  };
};

// Fetch all active candidates
export const useCandidates = () => {
  return useQuery({
    queryKey: candidateKeys.lists(),
    queryFn: candidateService.getAllActiveCandidates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    select: (data: Candidate[]) => {
      const stats = calculateCandidateStats(data);
      return {
        candidates: data,
        ...stats,
      };
    },
  });
};

// Fetch single candidate by ID
export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: () => candidateService.getCandidateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch candidates by election ID
export const useCandidatesByElection = (electionId: string) => {
  return useQuery({
    queryKey: candidateKeys.byElection(electionId),
    queryFn: () => candidateService.getCandidatesByElection(electionId),
    enabled: !!electionId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Fetch candidates by election and party
export const useCandidatesByElectionAndParty = (electionId: string, partyName: string) => {
  return useQuery({
    queryKey: candidateKeys.byParty(electionId, partyName),
    queryFn: () => candidateService.getCandidatesByElectionAndParty(electionId, partyName),
    enabled: !!electionId && !!partyName,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Check if candidate is active
export const useCandidateActiveStatus = (id: string) => {
  return useQuery({
    queryKey: candidateKeys.active(id),
    queryFn: () => candidateService.isCandidateActive(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create candidate mutation
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateService.createCandidate,
    onMutate: async (newCandidate: CandidateConfig) => {
      await queryClient.cancelQueries({ queryKey: candidateKeys.lists() });
      if (newCandidate.electionId) {
        await queryClient.cancelQueries({ queryKey: candidateKeys.byElection(newCandidate.electionId) });
      }

      const previousCandidates = queryClient.getQueryData(candidateKeys.lists());

      // Optimistically update cache
      queryClient.setQueryData(candidateKeys.lists(), (old: any) => {
        if (!old) return [{ ...newCandidate, id: 'temp-' + Date.now() }];
        const candidates = old.candidates || old;
        return {
          ...old,
          candidates: [...candidates, { ...newCandidate, id: 'temp-' + Date.now() }]
        };
      });

      return { previousCandidates };
    },
    onError: (err, newCandidate, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(candidateKeys.lists(), context.previousCandidates);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create candidate",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: "Candidate created successfully",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      if (variables.electionId) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.byElection(variables.electionId) });
      }
    },
  });
};

// Update candidate mutation
export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CandidateUpdate }) =>
      candidateService.updateCandidate(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: candidateKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: candidateKeys.lists() });

      const previousCandidate = queryClient.getQueryData(candidateKeys.detail(id));
      const previousCandidates = queryClient.getQueryData(candidateKeys.lists());

      // Optimistic update for single candidate
      queryClient.setQueryData(candidateKeys.detail(id), (old: Candidate) => ({
        ...old,
        ...data,
      }));

      // Optimistic update for candidates list
      queryClient.setQueryData(candidateKeys.lists(), (old: any) => {
        if (!old) return old;
        const candidates = old.candidates || old;
        return {
          ...old,
          candidates: candidates.map((candidate: Candidate) =>
            (candidate.id === id || candidate.candidateId === id) 
              ? { ...candidate, ...data } 
              : candidate
          ),
        };
      });

      return { previousCandidate, previousCandidates };
    },
    onError: (err, { id }, context) => {
      if (context?.previousCandidate) {
        queryClient.setQueryData(candidateKeys.detail(id), context.previousCandidate);
      }
      if (context?.previousCandidates) {
        queryClient.setQueryData(candidateKeys.lists(), context.previousCandidates);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update candidate",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
    },
  });
};

// Delete candidate mutation
export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateService.deleteCandidate,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: candidateKeys.lists() });

      const previousCandidates = queryClient.getQueryData(candidateKeys.lists());

      // Optimistically remove from cache
      queryClient.setQueryData(candidateKeys.lists(), (old: any) => {
        if (!old) return old;
        const candidates = old.candidates || old;
        return {
          ...old,
          candidates: candidates.filter((candidate: Candidate) => 
            candidate.id !== id && candidate.candidateId !== id
          ),
        };
      });

      return { previousCandidates };
    },
    onError: (err, id, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(candidateKeys.lists(), context.previousCandidates);
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete candidate",
        variant: "destructive",
      });
    },
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: candidateKeys.detail(id) });
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
    },
  });
};

// Prefetch candidate for better UX
export const usePrefetchCandidate = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: candidateKeys.detail(id),
      queryFn: () => candidateService.getCandidateById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
};
