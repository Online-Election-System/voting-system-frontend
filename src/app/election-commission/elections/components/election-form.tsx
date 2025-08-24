// components/election-form.tsx
import { useState, useEffect, useCallback } from "react";
import {
  format,
  isBefore,
  isAfter,
  isWithinInterval,
  addYears,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  Election,
  ElectionCreate,
  ElectionStatus,
  ElectionUpdate,
} from "../election.types";
import { simpleDateToDate, dateToSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay, parseTimeString } from "../utils/time-utils";
import { ELECTION_TYPES, ELECTION_STATUSES } from "../election-constants";
import { toast } from "@/src/lib/hooks/use-toast";
import { CandidateSelectionDialog } from "./candidate-selection-dialog";
import { Candidate } from "../../candidates/candidate.types";
import { useCandidates } from "../../candidates/hooks/use-candidates";

interface ElectionFormProps {
  editingElection: Election | null;
  onSubmit: (data: ElectionCreate | ElectionUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface PartyConstraintViolation {
  partyName: string;
  candidateCount: number;
  candidates: string[];
}

export function ElectionForm({
  editingElection,
  onSubmit,
  onCancel,
  isLoading = false,
}: ElectionFormProps) {
  // Form state
  const [electionName, setElectionName] = useState("");
  const [electionType, setElectionType] = useState("");
  const [electionDate, setElectionDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ElectionStatus>("Scheduled");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>(); // Auto-calculated, not user input
  const [enrolDdl, setEnrolDdl] = useState<Date | undefined>();
  const [noOfCandidates, setNoOfCandidates] = useState(0);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get candidates data
  const { data: candidatesData } = useCandidates();
  const candidates = candidatesData?.candidates || [];

  // Calendar popover states
  const [electionDateOpen, setElectionDateOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [enrolDdlOpen, setEnrolDdlOpen] = useState(false);

  // Combined loading state
  const isFormLoading = isLoading || isSubmitting;

  // Check if this is a presidential election
  const isPresidentialElection = electionType === "Presidential Election";

  // Analyze party constraint violations for presidential elections
  const partyConstraintAnalysis = useCallback(() => {
    if (!isPresidentialElection) return { violations: [], isValid: true };

    const partyGroups: Record<string, Candidate[]> = {};

    selectedCandidates.forEach((candidate) => {
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
          candidateCount: partyCandidates.length,
          candidates: partyCandidates.map(
            (c) => c.candidateName || c.candidateId
          ),
        });
      }
    });

    return {
      violations,
      isValid: violations.length === 0,
      partyGroups,
    };
  }, [selectedCandidates, isPresidentialElection]);

  // Handle election type change and clear candidates if switching to presidential
  const handleElectionTypeChange = useCallback(
    (newElectionType: string) => {
      const wasPresidential = electionType === "Presidential Election";
      const isNowPresidential = newElectionType === "Presidential Election";

      setElectionType(newElectionType);

      // Preserve Independent candidates when switching to presidential
      if (
        !wasPresidential &&
        isNowPresidential &&
        selectedCandidates.length > 0
      ) {
        // Filter out non-Independent candidates that might cause violations
        const validCandidates = selectedCandidates.filter((candidate) => {
          const party = candidate.partyName || "Independent";
          return party === "Independent";
        });

        // Only keep Independent candidates
        if (validCandidates.length < selectedCandidates.length) {
          setSelectedCandidates(validCandidates);
          toast({
            title: "Presidential Election Selected",
            description:
              "Non-Independent candidates were removed to comply with presidential election rules",
            variant: "destructive",
          });
        }
      }
    },
    [electionType, selectedCandidates]
  );

  // Auto-calculate end date when election date changes
  useEffect(() => {
    if (electionDate) {
      const calculatedEndDate = addYears(electionDate, 10);
      setEndDate(calculatedEndDate);
    } else {
      setEndDate(undefined);
    }
  }, [electionDate]);

  // Calculate status based on dates and times - memoized to prevent infinite loops
  const calculateStatus = useCallback((): ElectionStatus => {
    const now = new Date();

    if (!startDate || !endDate || !electionDate || !startTime || !endTime) {
      return "Scheduled";
    }

    // Parse election day times
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const electionStartDateTime = new Date(electionDate);
    electionStartDateTime.setHours(startHour, startMinute, 0, 0);

    const electionEndDateTime = new Date(electionDate);
    electionEndDateTime.setHours(endHour, endMinute, 0, 0);

    // Status logic
    if (isBefore(now, startDate)) {
      return "Scheduled";
    }

    if (isWithinInterval(now, { start: startDate, end: electionDate })) {
      return "Upcoming";
    }

    if (
      isWithinInterval(now, {
        start: electionStartDateTime,
        end: electionEndDateTime,
      })
    ) {
      return "Active";
    }

    if (isAfter(now, electionEndDateTime)) {
      return "Completed";
    }

    return "Scheduled";
  }, [startDate, endDate, electionDate, startTime, endTime]);

  // Validate time inputs - memoized to prevent infinite loops
  const validateTimes = useCallback((): {
    isValid: boolean;
    error?: string;
  } => {
    if (!startTime || !endTime) {
      return { isValid: false, error: "Both start and end times are required" };
    }

    if (startTime >= endTime) {
      return { isValid: false, error: "Start time must be before end time" };
    }

    return { isValid: true };
  }, [startTime, endTime]);

  // Date validation helpers - memoized to prevent infinite loops
  const isDateBetween = (date: Date, start: Date, end: Date): boolean => {
    return date >= start && date <= end;
  };

  const validateDates = useCallback((): {
    isValid: boolean;
    error?: string;
  } => {
    if (!startDate || !endDate || !electionDate || !enrolDdl) {
      return { isValid: false, error: "All dates are required" };
    }

    if (startDate > endDate) {
      return { isValid: false, error: "Start date must be before end date" };
    }

    if (!isDateBetween(electionDate, startDate, endDate)) {
      return {
        isValid: false,
        error: "Election date must be between start and end dates",
      };
    }

    if (!isDateBetween(enrolDdl, startDate, endDate)) {
      return {
        isValid: false,
        error: "Enrollment deadline must be between start and end dates",
      };
    }

    if (enrolDdl >= electionDate) {
      return {
        isValid: false,
        error: "Enrollment deadline must be before election date",
      };
    }

    return { isValid: true };
  }, [startDate, endDate, electionDate, enrolDdl]);

  // Initialize form when editing election changes - ONLY RUN ONCE
  useEffect(() => {
    if (editingElection && !isInitialized) {
      setElectionName(editingElection.electionName || "");
      setElectionType(editingElection.electionType || "");
      setDescription(editingElection.description || "");
      setStatus(editingElection.status || "Scheduled");
      setNoOfCandidates(editingElection.noOfCandidates || 0);

      // Handle dates
      const electionDateFromEdit = simpleDateToDate(
        editingElection.electionDate
      );
      setElectionDate(electionDateFromEdit);
      setStartDate(simpleDateToDate(editingElection.startDate));
      setEnrolDdl(simpleDateToDate(editingElection.enrolDdl));

      // For editing: use existing end date or calculate from election date
      const existingEndDate = simpleDateToDate(editingElection.endDate);
      if (existingEndDate) {
        setEndDate(existingEndDate);
      } else if (electionDateFromEdit) {
        setEndDate(addYears(electionDateFromEdit, 10));
      }

      // Format time values
      if (editingElection.startTime) {
        setStartTime(formatTimeOfDay(editingElection.startTime));
      }
      if (editingElection.endTime) {
        setEndTime(formatTimeOfDay(editingElection.endTime));
      }

      setIsInitialized(true);
    } else if (!editingElection && isInitialized) {
      // Reset form for new election
      setElectionName("");
      setElectionType("");
      setDescription("");
      setStatus("Scheduled");
      setNoOfCandidates(0);
      setElectionDate(undefined);
      setStartDate(undefined);
      setEndDate(undefined);
      setEnrolDdl(undefined);
      setStartTime("");
      setEndTime("");
      setSelectedCandidates([]);
      setIsInitialized(false);
    }
  }, [editingElection?.id, isInitialized]);

  // Set selected candidates from enrolled candidates - SEPARATE EFFECT
  useEffect(() => {
    if (
      editingElection?.enrolledCandidates &&
      candidates.length > 0 &&
      isInitialized
    ) {
      const enrolledCandidateIds = editingElection.enrolledCandidates.map(
        (ec) => ec.candidateId
      );
      const matchingCandidates = candidates.filter((candidate) =>
        enrolledCandidateIds.includes(
          candidate.candidateId || (candidate as any).id
        )
      );
      setSelectedCandidates(matchingCandidates);
    }
  }, [editingElection?.enrolledCandidates, candidates, isInitialized]);

  // Update status whenever relevant dates/times change - ONLY for new elections
  useEffect(() => {
    if (
      !editingElection &&
      startDate &&
      endDate &&
      electionDate &&
      startTime &&
      endTime
    ) {
      const newStatus = calculateStatus();
      setStatus(newStatus);
    }
  }, [
    calculateStatus,
    editingElection,
    startDate,
    endDate,
    electionDate,
    startTime,
    endTime,
  ]);

  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate && electionDate && enrolDdl) {
      const dateValidation = validateDates();
      setDateError(
        dateValidation.isValid ? null : dateValidation.error || null
      );
    } else {
      setDateError(null);
    }
  }, [startDate, endDate, electionDate, enrolDdl, validateDates]);

  // Validate times whenever they change
  useEffect(() => {
    if (startTime && endTime) {
      const timeValidation = validateTimes();
      setTimeError(
        timeValidation.isValid ? null : timeValidation.error || null
      );
    } else {
      setTimeError(null);
    }
  }, [startTime, endTime, validateTimes]);

  // Handle candidate selection change with validation
  const handleCandidateSelection = useCallback(
    (newSelectedCandidates: Candidate[]) => {
      setSelectedCandidates(newSelectedCandidates);

      // Immediately show validation feedback for presidential elections
      if (isPresidentialElection && newSelectedCandidates.length > 0) {
        const partyGroups: Record<string, Candidate[]> = {};
        newSelectedCandidates.forEach((candidate) => {
          const party = candidate.partyName || "Independent";
          if (!partyGroups[party]) {
            partyGroups[party] = [];
          }
          partyGroups[party].push(candidate);
        });

        const violations = Object.entries(partyGroups).filter(
          ([, candidates]) => candidates.length > 1
        );
        if (violations.length > 0) {
          toast({
            title: "Presidential Election Constraint",
            description: `${violations.map(([party]) => party).join(", ")} ${
              violations.length > 1 ? "have" : "has"
            } multiple candidates. Each party (except Independent) can only have one candidate.`,
            variant: "destructive",
          });
        }
      }
    },
    [isPresidentialElection]
  );

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isFormLoading) return;

    // Basic validation
    if (!electionName || !electionType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Candidate validation - applies to both create and edit
    if (selectedCandidates.length < noOfCandidates) {
      toast({
        title: "Validation Error",
        description: `Please select ${noOfCandidates} candidates`,
        variant: "destructive",
      });
      return;
    }
    if (selectedCandidates.length > noOfCandidates) {
      toast({
        title: "Validation Error",
        description: `Candidate limit exceeded by ${
          selectedCandidates.length - noOfCandidates
        }`,
        variant: "destructive",
      });
      return;
    }

    // Presidential election constraint validation
    const constraintCheck = partyConstraintAnalysis();
    if (isPresidentialElection && !constraintCheck.isValid) {
      toast({
        title: "Presidential Election Constraint Violation",
        description:
          "One or more parties (other than Independent) have multiple candidates selected",
        variant: "destructive",
      });
      return;
    }

    // Date validation for new elections
    if (!editingElection) {
      if (
        !electionDate ||
        !startDate ||
        !endDate ||
        !enrolDdl ||
        !startTime ||
        !endTime
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (dateError) {
        toast({
          title: "Date Validation Error",
          description: dateError,
          variant: "destructive",
        });
        return;
      }

      if (timeError) {
        toast({
          title: "Time Validation Error",
          description: timeError,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const currentStatus = editingElection ? status : calculateStatus();

      if (editingElection) {
        // Update existing election
        const updateData: ElectionUpdate = {
          electionName,
          electionType,
          status: currentStatus,
          description,
          noOfCandidates,
          candidateIds: selectedCandidates.map(
            (candidate) => candidate.candidateId || (candidate as any).id
          ),
        };

        if (startDate) {
          updateData.startDate = dateToSimpleDate(startDate);
        }
        if (endDate) {
          updateData.endDate = dateToSimpleDate(endDate);
        }
        if (electionDate) {
          updateData.electionDate = dateToSimpleDate(electionDate);
        }
        if (enrolDdl) {
          updateData.enrolDdl = dateToSimpleDate(enrolDdl);
        }
        if (startTime) {
          updateData.startTime = parseTimeString(startTime);
        }
        if (endTime) {
          updateData.endTime = parseTimeString(endTime);
        }

        await onSubmit(updateData);
      } else {
        // Create new election with candidates
        const newElectionCreate: ElectionCreate = {
          electionName,
          electionType,
          electionDate: dateToSimpleDate(electionDate!)!,
          startTime: parseTimeString(startTime)!,
          endTime: parseTimeString(endTime)!,
          description,
          status: currentStatus,
          startDate: dateToSimpleDate(startDate!)!,
          endDate: dateToSimpleDate(endDate!)!, // Auto-calculated end date
          enrolDdl: dateToSimpleDate(enrolDdl!)!,
          noOfCandidates,
          candidateIds: selectedCandidates.map(
            (candidate) => candidate.candidateId || (candidate as any).id
          ),
        };

        await onSubmit(newElectionCreate);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast({
        title: "Error",
        description: "Failed to submit election",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validation
  const constraintCheck = partyConstraintAnalysis();
  const isFormValid = Boolean(
    electionName &&
      electionType &&
      !isFormLoading &&
      selectedCandidates.length === noOfCandidates &&
      (!isPresidentialElection || constraintCheck.isValid) &&
      (editingElection ||
        (electionDate && startTime && endTime && !dateError && !timeError))
  );

  // Date selection handlers
  const handleDateSelect = useCallback(
    (
      date: Date | undefined,
      setter: React.Dispatch<React.SetStateAction<Date | undefined>>,
      popoverSetter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (isFormLoading) return;
      setter(date);
      setTimeout(() => popoverSetter(false), 50);
    },
    [isFormLoading]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4 rounded-lg border p-4 mt-6">
          <h2 className="font-bold">Basic Information</h2>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Election Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
                placeholder="Enter election title"
                required
                disabled={isFormLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">
                Election Type<span className="text-red-500">*</span>
              </Label>
              <Select
                value={electionType}
                onValueChange={handleElectionTypeChange}
                required
                disabled={isFormLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select election type" />
                </SelectTrigger>
                <SelectContent>
                  {ELECTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isPresidentialElection && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Presidential Election: Each party (except Independent) can
                  nominate only one candidate
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="noOfCandidates">
                  Number of Candidates
                </Label>
                <Input
                  id="noOfCandidates"
                  type="number"
                  min="0"
                  value={noOfCandidates}
                  onChange={(e) =>
                    setNoOfCandidates(Math.max(0, Number(e.target.value)))
                  }
                  required
                  disabled={isFormLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  Candidates
                  {constraintCheck.violations.length > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500 inline ml-1" />
                  )}
                </Label>
                <Button
                  variant="outline"
                  onClick={() => setIsCandidateDialogOpen(true)}
                  disabled={isFormLoading || noOfCandidates === 0}
                  className={
                    constraintCheck.violations.length > 0
                      ? "border-red-300 text-red-600"
                      : ""
                  }
                >
                  {selectedCandidates.length > 0
                    ? `${selectedCandidates.length} candidates selected`
                    : "Select Candidates"}
                </Button>
              </div>
            </div>

            {/* Candidate validation and constraint messages */}
            <div className="space-y-2">
              {selectedCandidates.length < noOfCandidates &&
                noOfCandidates > 0 && (
                  <p className="text-sm text-red-500">
                    {noOfCandidates - selectedCandidates.length} more candidate
                    {noOfCandidates - selectedCandidates.length !== 1
                      ? "s"
                      : ""}{" "}
                    needed to reach the target of {noOfCandidates}.
                  </p>
                )}
              {selectedCandidates.length > noOfCandidates && (
                <p className="text-sm text-red-500">
                  Exceeded the candidate limit by{" "}
                  {selectedCandidates.length - noOfCandidates}
                </p>
              )}

              {/* Presidential election constraint violations */}
              {isPresidentialElection &&
                constraintCheck.violations.length > 0 && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        Presidential Election Constraint Violation:
                      </strong>
                      <div className="mt-2 space-y-1">
                        {constraintCheck.violations.map((violation) => (
                          <div key={violation.partyName} className="text-sm">
                            • <strong>{violation.partyName}</strong> has{" "}
                            {violation.candidateCount} candidates (
                            {violation.candidates.join(", ")})
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-2">
                        Presidential elections allow only one candidate per
                        party (except Independent). Please remove extra
                        candidates.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

              {/* Selected candidates display */}
              {selectedCandidates.length > 0 && (
                <div className="mt-3">
                  <Label className="text-sm font-medium">
                    Selected Candidates:
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCandidates.map((candidate) => {
                      const party = candidate.partyName || "Independent";
                      const hasViolation =
                        party !== "Independent" &&
                        isPresidentialElection &&
                        constraintCheck.violations.some(
                          (v) => v.partyName === party
                        );

                      return (
                        <Badge
                          key={candidate.candidateId || candidate.id}
                          variant={hasViolation ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {candidate.candidateName} ({party})
                          {hasViolation && (
                            <AlertTriangle className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {editingElection && (
              <div className="grid gap-2">
                <Label htmlFor="status">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ElectionStatus)}
                  disabled={isFormLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELECTION_STATUSES.map((statusOption) => (
                      <SelectItem
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        {statusOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter election details"
                rows={3}
                disabled={isFormLoading}
              />
            </div>
          </div>
        </div>

        {/* Only show date/time section for new elections or when editing has dates */}
        {(!editingElection ||
          (editingElection && editingElection.electionDate)) && (
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="font-bold">Election Period</h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>
                  Start Date<span className="text-red-500">*</span>
                </Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                      disabled={isFormLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) =>
                        handleDateSelect(date, setStartDate, setStartDateOpen)
                      }
                      initialFocus
                      disabled={isFormLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  Enrollment Deadline<span className="text-red-500">*</span>
                </Label>
                <Popover open={enrolDdlOpen} onOpenChange={setEnrolDdlOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !enrolDdl && "text-muted-foreground"
                      )}
                      disabled={isFormLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {enrolDdl
                        ? format(enrolDdl, "PPP")
                        : "Select enrollment deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={enrolDdl}
                      onSelect={(date) =>
                        handleDateSelect(date, setEnrolDdl, setEnrolDdlOpen)
                      }
                      initialFocus
                      disabled={isFormLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  Election Date<span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={electionDateOpen}
                  onOpenChange={setElectionDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !electionDate && "text-muted-foreground"
                      )}
                      disabled={isFormLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {electionDate
                        ? format(electionDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]">
                    <Calendar
                      mode="single"
                      selected={electionDate}
                      onSelect={(date) =>
                        handleDateSelect(
                          date,
                          setElectionDate,
                          setElectionDateOpen
                        )
                      }
                      initialFocus
                      disabled={isFormLoading}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Show calculated end date for reference */}
              {endDate && (
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">
                    End Date (Auto-calculated)
                  </Label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground">
                    {format(endDate, "PPP")} (10 years after election date)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">
                    Start Time<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">
                    End Time<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      disabled={isFormLoading}
                    />
                  </div>
                </div>
              </div>
              {timeError && (
                <div className="text-sm text-red-500">{timeError}</div>
              )}
            </div>

            {/* Display date validation error */}
            {dateError && (
              <div className="text-sm text-red-500">{dateError}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isFormLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          {isFormLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isFormLoading
            ? editingElection
              ? "Updating..."
              : "Creating..."
            : editingElection
            ? "Update"
            : "Schedule"}
        </Button>
      </div>

      {/* Enhanced candidate dialog with presidential election constraints */}
      <CandidateSelectionDialog
        open={isCandidateDialogOpen && !isFormLoading}
        onOpenChange={setIsCandidateDialogOpen}
        candidates={candidates}
        requiredCandidates={noOfCandidates}
        onSelect={handleCandidateSelection}
        existingSelections={selectedCandidates}
        electionType={electionType}
      />
    </div>
  );
}
