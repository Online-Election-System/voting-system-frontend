export interface Candidate {
  id: number;
  name: string;
  party: string;
}

export interface CandidateFormData {
  name: string;
  party: string;
}

export interface CandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  onSubmit: (data: CandidateFormData) => void;
  onCancel: () => void;
}

export interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: number) => void;
}