export const electionKeys = {
  all: ['elections'] as const,
  lists: () => [...electionKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...electionKeys.lists(), filters] as const,
  details: () => [...electionKeys.all, 'detail'] as const,
  detail: (id: string) => [...electionKeys.details(), id] as const,
  stats: () => [...electionKeys.all, 'stats'] as const,
  active: () => [...electionKeys.all, 'active'] as const,
  upcoming: () => [...electionKeys.all, 'upcoming'] as const,
};
