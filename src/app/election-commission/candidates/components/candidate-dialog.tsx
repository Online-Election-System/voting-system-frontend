// components/CandidateDialog.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CandidateDialogProps, COMMON_PARTY_COLORS } from "../candidate.types";
import { useCandidateForm } from "../hooks/use-candidate-form";
import { usePartyAutoComplete } from "../hooks/use-party-suggestions";
import { User, Palette, Check, ChevronsUpDown, Sparkles } from "lucide-react";

export const CandidateDialog = ({ 
  open, 
  onOpenChange, 
  candidate, 
  onSubmit, 
  onCancel,
  isLoading = false,
  existingCandidates = []
}: CandidateDialogProps) => {
  const {
    candidateName,
    setCandidateName,
    partyName,
    setPartyName,
    partyColor,
    setPartyColor,
    partySymbol,
    setPartySymbol,
    candidateImage,
    setCandidateImage,
    email,
    setEmail,
    phone,
    setPhone,
    description,
    setDescription,
    errors,
    validateForm,
    isFormValid,
    resetForm,
    setFormData,
    getFormData
  } = useCandidateForm(candidate);

  // Use the new party suggestions hook
  const {
    partySuggestions,
    handlePartySelection,
    filterPartiesByQuery,
    hasPartySuggestions
  } = usePartyAutoComplete(
    existingCandidates,
    setPartyName,
    setPartyColor,
    setPartySymbol
  );

  const [partyComboOpen, setPartyComboOpen] = useState(false);
  const [customPartyInput, setCustomPartyInput] = useState("");
  
  const isEditing = Boolean(candidate);

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
      setCustomPartyInput(candidate.partyName || "");
    } else {
      resetForm();
      setCustomPartyInput("");
    }
  }, [candidate, setFormData, resetForm]);

  const handlePartySelectionClick = (selectedParty: typeof partySuggestions[0]) => {
    handlePartySelection(selectedParty.partyName);
    setCustomPartyInput(selectedParty.partyName);
    setPartyComboOpen(false);
  };

  const handleCustomPartyInput = (value: string) => {
    setCustomPartyInput(value);
    setPartyName(value);
  };

  const handleSubmit = async () => {
    if (validateForm() && isFormValid()) {
      const formData = getFormData();
      await onSubmit(formData);
      resetForm();
      setCustomPartyInput("");
    }
  };

  const handleCancel = () => {
    resetForm();
    setCustomPartyInput("");
    onCancel();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Edit Candidate" : "Add New Candidate"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update candidate information. Status is managed automatically based on election enrollment." 
              : "Add a new candidate to the system. They will be inactive until enrolled in an election."}
          </DialogDescription>
          {isEditing && candidate && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={candidate.isActive ? "default" : "secondary"}>
                {candidate.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Status is automatically managed
              </span>
            </div>
          )}
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h4>
            
            <div className="grid gap-2">
              <Label htmlFor="candidateName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Candidate Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate's full name"
                disabled={isLoading}
              />
              {errors.candidateName && (
                <span className="text-sm text-red-500">{errors.candidateName}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partyName" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Political Party <span className="text-red-500">*</span>
              </Label>
              
              {/* Party Selection Combobox */}
              <Popover open={partyComboOpen} onOpenChange={setPartyComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={partyComboOpen}
                    className="justify-between"
                    disabled={isLoading}
                  >
                    {customPartyInput || "Select or enter political party..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search or type party name..." 
                      value={customPartyInput}
                      onValueChange={handleCustomPartyInput}
                    />
                    <CommandList>
                      {hasPartySuggestions && (
                        <>
                          <CommandEmpty>
                            Press Enter to use "{customPartyInput}" as new party
                          </CommandEmpty>
                          <CommandGroup heading="Existing Parties">
                            {filterPartiesByQuery(customPartyInput).map((party) => (
                              <CommandItem
                                key={party.partyName}
                                value={party.partyName}
                                onSelect={() => handlePartySelectionClick(party)}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full border"
                                    style={{ backgroundColor: party.partyColor }}
                                  />
                                  <span>{party.partyName}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {party.candidateCount} candidate{party.candidateCount !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                <Check
                                  className={`ml-2 h-4 w-4 ${
                                    partyName === party.partyName ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Fallback input for custom party */}
              <Input
                value={customPartyInput}
                onChange={(e) => handleCustomPartyInput(e.target.value)}
                placeholder="Or type a new political party name"
                disabled={isLoading}
                className="mt-2"
              />
              
              {errors.partyName && (
                <span className="text-sm text-red-500">{errors.partyName}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="partyColor" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Party Color <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="partyColor"
                  value={partyColor}
                  onChange={(e) => setPartyColor(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1"
                  disabled={isLoading}
                />
                <div 
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: partyColor }}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {COMMON_PARTY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => setPartyColor(color)}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.partyColor && (
                <span className="text-sm text-red-500">{errors.partyColor}</span>
              )}
            </div>
          </div>

          {/* Optional Information Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Optional Information
            </h4>

            <div className="grid gap-2">
              <Label htmlFor="partySymbol">
                Party Symbol URL
                {partySymbol && (
                  <span className="text-xs text-green-600 ml-2">
                    ✓ Auto-filled from party selection
                  </span>
                )}
              </Label>
              <Input
                id="partySymbol"
                value={partySymbol}
                onChange={(e) => setPartySymbol(e.target.value)}
                placeholder="https://example.com/symbol.png"
                disabled={isLoading}
              />
              {partySymbol && (
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src={partySymbol} 
                    alt="Party symbol preview" 
                    className="h-8 w-8 object-contain rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="candidateImage">Candidate Image URL</Label>
              <Input
                id="candidateImage"
                value={candidateImage}
                onChange={(e) => setCandidateImage(e.target.value)}
                placeholder="https://example.com/candidate.jpg"
                disabled={isLoading}
              />
              {candidateImage && (
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src={candidateImage} 
                    alt="Candidate preview" 
                    className="h-8 w-8 object-cover rounded-full border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Saving..." : (isEditing ? "Update Candidate" : "Add Candidate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
