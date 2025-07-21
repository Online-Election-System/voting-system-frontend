import { useState, useEffect } from "react";
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
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>(existingSelections);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(candidates);

  useEffect(() => {
    setSelectedCandidates(existingSelections);
  }, [existingSelections, open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = candidates.filter(candidate =>
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.partyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [searchTerm, candidates]);

  const toggleCandidateSelection = (candidate: Candidate) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.some(c => c.id === candidate.id);
      if (isSelected) {
        return prev.filter(c => c.id !== candidate.id);
      } else {
        if (prev.length < requiredCandidates) {
          return [...prev, candidate];
        }
        return prev;
      }
    });
  };

  const handleSubmit = () => {
    onSelect(selectedCandidates);
    onOpenChange(false);
  };

  const isCandidateSelected = (candidate: Candidate) => {
    return selectedCandidates.some(c => c.id === candidate.id);
  };

  const isSelectionDisabled = selectedCandidates.length >= requiredCandidates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Candidates</DialogTitle>
          <DialogDescription>
            {selectedCandidates.length} of {requiredCandidates} candidates selected
            {isSelectionDisabled && " - Maximum reached"}
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

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Political Party</TableHead>
                  <TableHead className="w-20">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <TableRow 
                      key={candidate.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => toggleCandidateSelection(candidate)}
                    >
                      <TableCell className="font-medium">{candidate.candidateName}</TableCell>
                      <TableCell>{candidate.partyName}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCandidateSelection(candidate);
                          }}
                          disabled={!isCandidateSelected(candidate) && isSelectionDisabled}
                        >
                          {isCandidateSelected(candidate) ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <div className="h-4 w-4 rounded border border-gray-300" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCandidates.length !== requiredCandidates}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
