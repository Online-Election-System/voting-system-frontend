// types/candidate.types.ts

// Main Candidate interface - matches your backend structure
export interface Candidate {
  id: string;                    // Changed from number to string to match backend
  candidateId: string;           // Backend uses composite keys
  electionId?: string;            // Link to specific election
  candidateName: string;
  partyName: string;            // Backend field name
  isActive: boolean;             // Backend tracks active status
  email?: string;                // Optional contact info
  phone?: string;                // Optional contact info
  description?: string;          // Candidate bio/description
  imageUrl?: string;             // Profile picture
  createdAt?: string;            // Backend timestamps
  updatedAt?: string;            // Backend timestamps
}

// For creating new candidates - matches backend expectations
export interface CandidateConfig {
  candidateId: string;           // Required unique identifier
  electionId: string;            // Required election association
  candidateName: string;                  // Required candidate name
  partyName: string;             // Required party affiliation
  isActive?: boolean;            // Optional, defaults to true
  email?: string;                // Optional contact info
  phone?: string;                // Optional contact info
  description?: string;          // Optional candidate description
  imageUrl?: string;             // Optional profile image
}

// For updating existing candidates - all fields optional except ID
export interface CandidateUpdate {
  name?: string;
  partyName?: string;
  isActive?: boolean;
  email?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}

// Form data interface for UI components
export interface CandidateFormData {
  name: string;
  party: string;                 // UI might still use 'party' for simplicity
  electionId?: string;            // Required for candidate creation
  email?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}

// Enhanced form data for editing (includes ID)
export interface CandidateEditFormData extends CandidateFormData {
  id: string;
  candidateId: string;
  isActive: boolean;
}

// Dialog component props
export interface CandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  onSubmit: (data: CandidateFormData) => Promise<void>; // Changed to async
  onCancel: () => void;
  isLoading?: boolean;           // For loading states
  electionId?: string;           // Default election if creating new candidate
}

// Table component props - updated for React Query
export interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidateId: string) => void;  // Changed from number to string
  onView?: (candidate: Candidate) => void;  // Optional view action
  isLoading?: boolean;                      // Loading state
  error?: Error | null;                     // Error state
}

// Enhanced table props for full-featured components
export interface CandidateTableEnhancedProps extends Omit<CandidateTableProps, 'candidates'> {
  itemsPerPage?: number;
  showRefresh?: boolean;
  showElectionFilter?: boolean;
  showPartyFilter?: boolean;
  electionId?: string;           // Filter by specific election
}

// For filtering and searching
export interface CandidateFilters {
  party?: string;
  electionId?: string;
  isActive?: boolean;
  search?: string;
}

// For statistics and analytics
export interface CandidateStats {
  totalCandidates: number;
  activeCandidates: number;
  inactiveCandidates: number;
  partiesCount: number;
  candidatesByParty: Record<string, number>;
  candidatesByElection: Record<string, number>;
  candidatesByStatus: {
    active: number;
    inactive: number;
  };
}

// Selection dialog props (for election candidate assignment)
export interface CandidateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  selectedCandidates: Candidate[];
  onSelect: (candidates: Candidate[]) => void;
  maxSelections?: number;
  electionId?: string;
  title?: string;
  description?: string;
}

// For API response typing
export interface CandidateApiResponse {
  candidates: Candidate[];
  total: number;
  page?: number;
  limit?: number;
}

// For paginated candidate lists
export interface PaginatedCandidates {
  candidates: Candidate[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Validation schemas (if using form validation)
export interface CandidateValidationErrors {
  name?: string;
  party?: string;
  electionId?: string;
  email?: string;
  phone?: string;
  general?: string;
}

// For bulk operations
export interface BulkCandidateOperation {
  candidateIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'move';
  targetElectionId?: string;     // For move operations
}

// For candidate import/export
export interface CandidateImportData {
  name: string;
  partyName: string;
  electionId: string;
  email?: string;
  phone?: string;
  description?: string;
}

export interface CandidateExportData extends Candidate {
  electionName?: string;         // Include election name in exports
  partyDisplayName?: string;     // Formatted party name
}

// For candidate comparison/analysis
export interface CandidateComparison {
  candidate1: Candidate;
  candidate2: Candidate;
  differences: string[];
  similarities: string[];
}

// Migration helper - maps old format to new format
export interface LegacyCandidate {
  id: number;                    // Old numeric ID
  name: string;
  party: string;
}

// Helper function types
export type CandidateTransformer = (candidate: LegacyCandidate) => Candidate;
export type CandidateValidator = (candidate: CandidateFormData) => CandidateValidationErrors;
export type CandidateFilter = (candidate: Candidate, filters: CandidateFilters) => boolean;

// React Query specific types
export interface UseCandidatesOptions {
  electionId?: string;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export interface UseCandidatesMutationCallbacks {
  onSuccess?: (data: Candidate) => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
}
