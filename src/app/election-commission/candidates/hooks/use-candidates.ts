// hooks/candidates/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Candidate, CandidateConfig, CandidateFormData, CandidateUpdate } from '../candidate.types';
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

  // Additional stats for enhanced system
  const candidatesWithImages = candidates.filter(c => Boolean(c.candidateImage)).length;
  const candidatesWithContact = candidates.filter(c => Boolean(c.email) || Boolean(c.phone)).length;

  return {
    totalCandidates: candidates.length,
    activeCandidates: activeCandidates.length,
    inactiveCandidates: candidates.length - activeCandidates.length,
    partiesCount: uniqueParties.length,
    uniqueParties,
    candidatesByParty,
    candidatesWithImages,
    candidatesWithContact,
  };
};

// Fetch all candidates (active and inactive)
export const useCandidates = (activeOnly?: boolean) => {
  return useQuery({
    queryKey: candidateKeys.lists(activeOnly),
    queryFn: activeOnly ? candidateService.getAllActiveCandidates : candidateService.getAllCandidates,
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

// Fetch all active candidates only
export const useActiveCandidates = () => {
  return useQuery({
    queryKey: candidateKeys.active(),
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
    queryKey: candidateKeys.activeStatus(id),
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
    onMutate: async (newCandidate: CandidateFormData) => {
      await queryClient.cancelQueries({ queryKey: candidateKeys.lists() });

      const previousCandidates = queryClient.getQueryData(candidateKeys.lists());

      // Optimistically update cache - new candidates start as inactive
      queryClient.setQueryData(candidateKeys.lists(), (old: any) => {
        const tempCandidate = { ...newCandidate, id: 'temp-' + Date.now(), isActive: false };
        
        if (!old) return [tempCandidate];
        
        // Handle both raw array and transformed object
        const currentCandidates = Array.isArray(old) ? old : (old.candidates || []);
        const newCandidates = [...currentCandidates, tempCandidate];
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.candidates) {
          const stats = calculateCandidateStats(newCandidates);
          return {
            candidates: newCandidates,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return newCandidates;
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
        description: "Candidate created successfully. They will be activated when enrolled in an election.",
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.active() });
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

      // Optimistic update for single candidate (preserve isActive status)
      queryClient.setQueryData(candidateKeys.detail(id), (old: Candidate) => ({
        ...old,
        ...data
      }));

      // Optimistic update for candidates list
      queryClient.setQueryData(candidateKeys.lists(), (old: any) => {
        if (!old) return old;
        
        // Handle both raw array and transformed object
        const currentCandidates = Array.isArray(old) ? old : (old.candidates || []);
        const updatedCandidates = currentCandidates.map((candidate: Candidate) =>
          (candidate.id === id || candidate.candidateId === id) 
            ? { ...candidate, ...data } // Preserve system-managed status
            : candidate
        );
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.candidates) {
          const stats = calculateCandidateStats(updatedCandidates);
          return {
            candidates: updatedCandidates,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return updatedCandidates;
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
        description: "Candidate updated successfully. Active status is managed automatically.",
      });
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.active() });
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
        
        // Handle both raw array and transformed object
        const currentCandidates = Array.isArray(old) ? old : (old.candidates || []);
        const filteredCandidates = currentCandidates.filter((candidate: Candidate) => 
          candidate.id !== id && candidate.candidateId !== id
        );
        
        // If old was already transformed, maintain that structure
        if (!Array.isArray(old) && old.candidates) {
          const stats = calculateCandidateStats(filteredCandidates);
          return {
            candidates: filteredCandidates,
            ...stats,
          };
        }
        
        // Otherwise return raw array (let select transform it)
        return filteredCandidates;
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
      queryClient.invalidateQueries({ queryKey: candidateKeys.active() });
    },
  });
};

// Update candidate statuses system-wide (admin function)
export const useUpdateCandidateStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: candidateService.updateCandidateStatuses,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Candidate statuses updated based on current elections",
      });
      // Invalidate all candidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update candidate statuses",
        variant: "destructive",
      });
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
