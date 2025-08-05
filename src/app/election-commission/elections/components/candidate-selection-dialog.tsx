// components/candidate-selection-dialog.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Info } from "lucide-react";
import { Candidate } from "../../candidates/candidate.types";

interface CandidateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Candidate[];
  requiredCandidates: number;
  onSelect: (selectedCandidates: Candidate[]) => void;
  existingSelections?: Candidate[];
  electionType?: string;
}

interface PartyConstraintViolation {
  partyName: string;
  candidates: Candidate[];
  count: number;
}

export const CandidateSelectionDialog = ({
  open,
  onOpenChange,
  candidates,
  requiredCandidates,
  onSelect,
  existingSelections = [],
  electionType = ""
}: CandidateSelectionDialogProps) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if this is a presidential election that requires party constraints
  const isPresidentialElection = electionType === "Presidential Election";

  // Helper function to get candidate ID (handles both id and candidateId)
  const getCandidateId = useCallback((candidate: Candidate): string => {
    return candidate.candidateId || (candidate as any).id;
  }, []);

  // Create a Set of selected candidate IDs for faster lookup
  const selectedCandidateIds = useMemo(() => {
    const ids = new Set(selectedCandidates.map(c => getCandidateId(c)));
    return ids;
  }, [selectedCandidates, getCandidateId]);

  // Analyze party constraints for presidential elections
  const partyConstraintAnalysis = useMemo(() => {
    if (!isPresidentialElection) return { violations: [], isValid: true };

    const partyGroups: Record<string, Candidate[]> = {};
    
    selectedCandidates.forEach(candidate => {
      const party = candidate.partyName || "Independent";
      if (!partyGroups[party]) {
        partyGroups[party] = [];
      }
      partyGroups[party].push(candidate);
    });

    const violations: PartyConstraintViolation[] = [];
    Object.entries(partyGroups).forEach(([partyName, partyCandidates]) => {
      // Only check constraint for non-Independent parties
      if (partyName !== "Independent" && partyCandidates.length > 1) {
        violations.push({
          partyName,
          candidates: partyCandidates,
          count: partyCandidates.length
        });
      }
    });

    return {
      violations,
      isValid: violations.length === 0,
      partyGroups
    };
  }, [selectedCandidates, isPresidentialElection]);

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

  // Group filtered candidates by party for better visualization
  const candidatesByParty = useMemo(() => {
    const groups: Record<string, Candidate[]> = {};
    filteredCandidates.forEach(candidate => {
      const party = candidate.partyName || "Independent";
      if (!groups[party]) {
        groups[party] = [];
      }
      groups[party].push(candidate);
    });
    return groups;
  }, [filteredCandidates]);

  // Initialize selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedCandidates([...existingSelections]);
      setSearchTerm("");
    }
  }, [open, existingSelections]);

  const canSelectCandidate = useCallback((candidate: Candidate): { canSelect: boolean; reason?: string } => {
    const candidateId = getCandidateId(candidate);
    const isCurrentlySelected = selectedCandidateIds.has(candidateId);
    
    if (isCurrentlySelected) {
      return { canSelect: true }; // Can always deselect
    }

    // Check if we've reached the limit
    if (selectedCandidates.length >= requiredCandidates) {
      return { canSelect: false, reason: "Maximum candidates reached" };
    }

    // For presidential elections, check party constraint (only for non-Independent parties)
    if (isPresidentialElection) {
      const candidateParty = candidate.partyName || "Independent";
      
      // Skip party constraint check for Independent candidates
      if (candidateParty !== "Independent") {
        const partyAlreadySelected = selectedCandidates.some(
          selected => (selected.partyName || "Independent") === candidateParty
        );
        
        if (partyAlreadySelected) {
          return { 
            canSelect: false, 
            reason: `${candidateParty} already has a candidate selected` 
          };
        }
      }
    }

    return { canSelect: true };
  }, [selectedCandidates, requiredCandidates, isPresidentialElection, selectedCandidateIds, getCandidateId]);

  const toggleCandidateSelection = useCallback((candidate: Candidate) => {
    const candidateId = getCandidateId(candidate);
    const { canSelect } = canSelectCandidate(candidate);
    
    if (!canSelect) return; // Don't allow invalid selections
    
    setSelectedCandidates(prev => {
      const isCurrentlySelected = prev.some(c => getCandidateId(c) === candidateId);
      
      if (isCurrentlySelected) {
        // Remove candidate from selection
        return prev.filter(c => getCandidateId(c) !== candidateId);
      } else {
        // Add candidate to selection
        return [...prev, candidate];
      }
    });
  }, [getCandidateId, canSelectCandidate]);

  const handleSubmit = useCallback(() => {
    // Final validation before submit
    if (selectedCandidates.length !== requiredCandidates) {
      return; // Button should be disabled anyway
    }

    if (isPresidentialElection && !partyConstraintAnalysis.isValid) {
      return; // Button should be disabled anyway
    }

    onSelect([...selectedCandidates]);
    onOpenChange(false);
  }, [selectedCandidates, requiredCandidates, isPresidentialElection, partyConstraintAnalysis.isValid, onSelect, onOpenChange]);

  const handleCancel = useCallback(() => {
    setSelectedCandidates([...existingSelections]);
    setSearchTerm("");
    onOpenChange(false);
  }, [existingSelections, onOpenChange]);

  // Check if form is valid for submission
  const isFormValid = selectedCandidates.length === requiredCandidates && 
                     (!isPresidentialElection || partyConstraintAnalysis.isValid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Select Candidates
            {isPresidentialElection && (
              <Badge variant="outline" className="text-xs">
                Presidential Election
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedCandidates.length} of {requiredCandidates} candidates selected
            {selectedCandidates.length >= requiredCandidates && " - Maximum reached"}
            {isPresidentialElection && " • One candidate per party (except Independent)"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Presidential Election Constraint Info */}
          {isPresidentialElection && (
            <Alert className="border-blue-300 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Presidential Election Rule:</strong> Each political party can nominate only one candidate, except Independent candidates which can have multiple.
              </AlertDescription>
            </Alert>
          )}

          {/* Constraint Violations */}
          {isPresidentialElection && partyConstraintAnalysis.violations.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Party Constraint Violations:</strong>
                <div className="mt-2 space-y-1">
                  {partyConstraintAnalysis.violations.map(violation => (
                    <div key={violation.partyName} className="text-sm">
                      • <strong>{violation.partyName}</strong> has {violation.count} candidates selected
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2">Remove extra candidates from these parties to proceed.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="grid gap-2">
            <Input
              placeholder="Search candidates by name or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selected Candidates Summary */}
          {selectedCandidates.length > 0 && (
            <div className="border rounded-lg p-3 bg-blue-50">
              <h4 className="font-medium text-sm mb-2">Selected Candidates:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedCandidates.map(candidate => {
                  const party = candidate.partyName || "Independent";
                  const hasViolation = isPresidentialElection && 
                    partyConstraintAnalysis.violations.some(v => v.partyName === party);
                  
                  return (
                    <Badge 
                      key={getCandidateId(candidate)}
                      variant={hasViolation ? "destructive" : "secondary"}
                      className="text-xs cursor-pointer hover:opacity-80"
                      onClick={() => toggleCandidateSelection(candidate)}
                      title={hasViolation ? "Click to remove - violates party constraint" : "Click to remove"}
                    >
                      {candidate.candidateName} ({party})
                      {hasViolation && <AlertTriangle className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidates Table */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div className="overflow-auto h-full max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Party</TableHead>
                    <TableHead>Candidate Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="w-20">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(candidatesByParty).length === 0 ? (
                    <TableRow key="no-candidates">
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {searchTerm ? "No candidates found matching your search" : "No candidates available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(candidatesByParty)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([partyName, partyCandidates]) => (
                        partyCandidates.map((candidate) => {
                          const candidateId = getCandidateId(candidate);
                          const isSelected = selectedCandidateIds.has(candidateId);
                          const { canSelect, reason } = canSelectCandidate(candidate);
                          const isDisabled = !canSelect && !isSelected;
                          
                          const partyHasViolation = isPresidentialElection && 
                            partyConstraintAnalysis.violations.some(v => v.partyName === partyName);
                          
                          // Check if this party already has a selected candidate (for visual feedback)
                          const partyHasSelection = isPresidentialElection && 
                            partyName !== "Independent" && // Skip for Independent
                            selectedCandidates.some(sc => (sc.partyName || "Independent") === partyName);
                          
                          return (
                            <TableRow 
                              key={candidateId}
                              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                              } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
                                partyHasViolation && isSelected ? 'bg-red-50 dark:bg-red-900/20' : ''
                              } ${partyHasSelection && !isSelected && isPresidentialElection ? 'bg-gray-50 opacity-60' : ''}`}
                              onClick={() => {
                                if (canSelect || isSelected) {
                                  toggleCandidateSelection(candidate);
                                }
                              }}
                              title={isDisabled ? reason : undefined}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {partyName}
                                  {partyHasViolation && isSelected && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                  {partyHasSelection && !isSelected && isPresidentialElection && (
                                    <span className="text-xs text-gray-500">(party selected)</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{candidate.candidateName}</TableCell>
                              <TableCell className="text-xs text-gray-500 font-mono">
                                {candidateId}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (canSelect || isSelected) {
                                      toggleCandidateSelection(candidate);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  title={isDisabled ? reason : undefined}
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
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            Confirm Selection ({selectedCandidates.length}/{requiredCandidates})
            {isPresidentialElection && !partyConstraintAnalysis.isValid && " - Fix Violations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
