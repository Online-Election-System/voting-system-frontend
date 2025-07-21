"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { CandidateTable } from "./components/candidate-table";
import { CandidateDialog } from "./components/candidate-dialog";
import { 
  useCandidates, 
  useCreateCandidate, 
  useUpdateCandidate, 
  useDeleteCandidate 
} from "./hooks/use-candidates";
import { CandidateFormData, Candidate } from "./candidate.types";
import { useCandidateDialog } from "./hooks/use-candidate-dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function CandidatesPage() {
  // React Query hooks
  const { 
    data: candidatesData, 
    isLoading, 
    error, 
    refetch 
  } = useCandidates();
  
  const createCandidateMutation = useCreateCandidate();
  const updateCandidateMutation = useUpdateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();

  // Dialog state management
  const { open, editingCandidate, openDialog, closeDialog, setOpen } = useCandidateDialog();

  // Extract data with defaults
  const {
    candidates = [],
    totalCandidates = 0,
    activeCandidates = 0,
    partiesCount = 0
  } = candidatesData || {};

  const handleAddClick = () => {
    openDialog();
  };

  const handleEditClick = (candidate: Candidate) => {
    openDialog(candidate);
  };

  const handleSubmit = async (formData: CandidateFormData) => {
    try {
      if (editingCandidate) {
        // Update existing candidate
        await updateCandidateMutation.mutateAsync({
          id: editingCandidate.id,
          data: {
            name: formData.name,
            partyName: formData.party,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
          }
        });
      } else {
        // Create new candidate
        await createCandidateMutation.mutateAsync({
          candidateId: `candidate-${Date.now()}`,
          electionId: formData.electionId || 'default-election',
          candidateName: formData.name,
          partyName: formData.party,
          isActive: true,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
        });
      }
      closeDialog();
    } catch (error) {
      console.error("Error saving candidate:", error);
      // Error handling is done in the mutation hooks
    }
  };

  const handleDelete = async (candidateId: string) => {
    try {
      await deleteCandidateMutation.mutateAsync(candidateId);
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const handleCancel = () => {
    closeDialog();
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 mx-12 my-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Candidates</h1>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading candidates...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 mx-12 my-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Candidates</h1>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Error loading candidates: {error.message}
              </p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-12 my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Candidates</h1>
          <p className="text-muted-foreground">
            {totalCandidates} total • {activeCandidates} active • {partiesCount} parties
          </p>
        </div>
        <div className="flex gap-6">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Candidates Found</CardTitle>
            <CardDescription>
              Get started by adding your first candidate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Candidate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CandidateTable 
          candidates={candidates}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isLoading={
            createCandidateMutation.isPending || 
            updateCandidateMutation.isPending || 
            deleteCandidateMutation.isPending
          }
        />
      )}

      <CandidateDialog
        open={open}
        onOpenChange={setOpen}
        candidate={editingCandidate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={
          createCandidateMutation.isPending || 
          updateCandidateMutation.isPending
        }
      />
    </div>
  );
}
