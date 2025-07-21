export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...candidateKeys.lists(), filters] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  byElection: (electionId: string) => [...candidateKeys.all, 'election', electionId] as const,
  byParty: (electionId: string, party: string) => [...candidateKeys.all, 'election', electionId, 'party', party] as const,
  active: (id: string) => [...candidateKeys.all, 'active', id] as const,
};
