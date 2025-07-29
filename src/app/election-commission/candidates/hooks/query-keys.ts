// hooks/candidates/query-keys.ts
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: (activeOnly?: boolean) => [...candidateKeys.all, 'list', { activeOnly }] as const,
  active: () => [...candidateKeys.all, 'active'] as const,
  detail: (id: string) => [...candidateKeys.all, 'detail', id] as const,
  activeStatus: (id: string) => [...candidateKeys.all, 'activeStatus', id] as const,
  byElection: (electionId: string) => [...candidateKeys.all, 'byElection', electionId] as const,
  byParty: (electionId: string, partyName: string) => [
    ...candidateKeys.all, 
    'byParty', 
    electionId, 
    partyName
  ] as const,
};