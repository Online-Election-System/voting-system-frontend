import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check } from "lucide-react";
import { Candidate } from "../../candidates/candidate.types";

interface CandidateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  requiredCandidates: number;
  onSelect: (selectedCandidates: Candidate[]) => void;
  existingSelections?: Candidate[];
}

export const CandidateSelectionDialog = ({
  open,
  onOpenChange,
  candidates,
  requiredCandidates,
  onSelect,
  existingSelections = []
}: CandidateSelectionDialogProps) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get candidate ID (handles both id and candidateId)
  const getCandidateId = useCallback((candidate: Candidate): string => {
    return candidate.candidateId || (candidate as any).id;
  }, []);

  // Create a Set of selected candidate IDs for faster lookup
  const selectedCandidateIds = useMemo(() => {
    const ids = new Set(selectedCandidates.map(c => getCandidateId(c)));
    console.log("Selected candidate IDs Set:", Array.from(ids));
    return ids;
  }, [selectedCandidates, getCandidateId]);

  // Filter candidates based on search term
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) {
      return candidates;
    }
    return candidates.filter(candidate =>
      candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.partyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, candidates]);

  // Initialize selections when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, setting initial selections:");
      console.log("Existing selections:", existingSelections.map(c => ({
        id: getCandidateId(c),
        name: c.candidateName
      })));
      setSelectedCandidates([...existingSelections]);
      setSearchTerm("");
    }
  }, [open, getCandidateId]);

  // Separate effect for updating when existingSelections change while dialog is open
  useEffect(() => {
    if (open && existingSelections.length > 0) {
      console.log("Updating selections from existing:");
      console.log("New existing selections:", existingSelections.map(c => ({
        id: getCandidateId(c),
        name: c.candidateName
      })));
      setSelectedCandidates([...existingSelections]);
    }
  }, [existingSelections.length, open, getCandidateId]);

  const toggleCandidateSelection = useCallback((candidate: Candidate) => {
    const candidateId = getCandidateId(candidate);
    console.log("Toggling candidate:", candidateId, candidate.candidateName);
    
    setSelectedCandidates(prev => {
      const isCurrentlySelected = prev.some(c => getCandidateId(c) === candidateId);
      console.log("Is currently selected:", isCurrentlySelected);
      
      if (isCurrentlySelected) {
        // Remove candidate from selection
        const newSelection = prev.filter(c => getCandidateId(c) !== candidateId);
        console.log("Removing candidate, new selection:", newSelection.map(c => getCandidateId(c)));
        return newSelection;
      } else {
        // Add candidate if we haven't reached the limit
        if (prev.length < requiredCandidates) {
          const newSelection = [...prev, candidate];
          console.log("Adding candidate, new selection:", newSelection.map(c => getCandidateId(c)));
          return newSelection;
        }
        console.log("Cannot add - limit reached");
        return prev;
      }
    });
  }, [requiredCandidates, getCandidateId]);

  const handleSubmit = useCallback(() => {
    console.log("Submitting selection:", selectedCandidates.map(c => getCandidateId(c)));
    onSelect([...selectedCandidates]);
    onOpenChange(false);
  }, [selectedCandidates, onSelect, onOpenChange, getCandidateId]);

  const handleCancel = useCallback(() => {
    console.log("Canceling, resetting to original selections");
    setSelectedCandidates([...existingSelections]);
    setSearchTerm("");
    onOpenChange(false);
  }, [existingSelections, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Candidates</DialogTitle>
          <DialogDescription>
            {selectedCandidates.length} of {requiredCandidates} candidates selected
            {selectedCandidates.length >= requiredCandidates && " - Maximum reached"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Input
              placeholder="Search candidates by name or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Political Party</TableHead>
                  <TableHead className="w-20">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow key="no-candidates">
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {searchTerm ? "No candidates found matching your search" : "No candidates available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const candidateId = getCandidateId(candidate);
                    const isSelected = selectedCandidateIds.has(candidateId);
                    const isDisabled = selectedCandidates.length >= requiredCandidates && !isSelected;
                    
                    return (
                      <TableRow 
                        key={candidateId}
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => {
                          if (!isDisabled) {
                            toggleCandidateSelection(candidate);
                          }
                        }}
                      >
                        <TableCell className="text-xs text-gray-500">{candidateId}</TableCell>
                        <TableCell className="font-medium">{candidate.candidateName}</TableCell>
                        <TableCell>{candidate.partyName}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) {
                                toggleCandidateSelection(candidate);
                              }
                            }}
                            disabled={isDisabled}
                          >
                            {isSelected ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <div className="h-4 w-4 rounded border border-gray-300" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCandidates.length !== requiredCandidates}
          >
            Confirm Selection ({selectedCandidates.length}/{requiredCandidates})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
