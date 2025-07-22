import { useState, useEffect, useCallback } from "react";
import { format, isBefore, isAfter, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import {
  Election,
  ElectionCreate,
  ElectionStatus,
  ElectionUpdate,
} from "../election.types";
import { simpleDateToDate, dateToSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay, parseTimeString } from "../utils/time-utils";
import { ELECTION_TYPES, ELECTION_STATUSES } from "../election-constants";
import { toast } from "@/components/ui/use-toast";
import { CandidateSelectionDialog } from "./candidate-selection-dialog";
import { Candidate } from "../../candidates/candidate.types";
import { useCandidates } from "../../candidates/hooks/use-candidates";

interface ElectionFormProps {
  editingElection: Election | null;
  onSubmit: (data: ElectionCreate | ElectionUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
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
  const [endDate, setEndDate] = useState<Date | undefined>();
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
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [enrolDdlOpen, setEnrolDdlOpen] = useState(false);

  // Combined loading state
  const isFormLoading = isLoading || isSubmitting;

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
      console.log("Initializing form with editing election:", editingElection.id);
      
      setElectionName(editingElection.electionName || "");
      setElectionType(editingElection.electionType || "");
      setDescription(editingElection.description || "");
      setStatus(editingElection.status || "Scheduled");
      setNoOfCandidates(editingElection.noOfCandidates || 0);

      // Handle dates
      setElectionDate(simpleDateToDate(editingElection.electionDate));
      setStartDate(simpleDateToDate(editingElection.startDate));
      setEndDate(simpleDateToDate(editingElection.endDate));
      setEnrolDdl(simpleDateToDate(editingElection.enrolDdl));

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
      console.log("Resetting form for new election");
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
  }, [editingElection?.id, isInitialized]); // Only depend on election ID change

  // Set selected candidates from enrolled candidates - SEPARATE EFFECT
  useEffect(() => {
    if (editingElection?.enrolledCandidates && candidates.length > 0 && isInitialized) {
      console.log("Setting selected candidates from enrolled candidates");
      const enrolledCandidateIds = editingElection.enrolledCandidates.map(ec => ec.candidateId);
      const matchingCandidates = candidates.filter(candidate => 
        enrolledCandidateIds.includes(candidate.candidateId || (candidate as any).id)
      );
      setSelectedCandidates(matchingCandidates);
    }
  }, [editingElection?.enrolledCandidates, candidates, isInitialized]);

  // Update status whenever relevant dates/times change - ONLY for new elections
  useEffect(() => {
    if (!editingElection && startDate && endDate && electionDate && startTime && endTime) {
      const newStatus = calculateStatus();
      setStatus(newStatus);
    }
  }, [calculateStatus, editingElection, startDate, endDate, electionDate, startTime, endTime]);

  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate && electionDate && enrolDdl) {
      const dateValidation = validateDates();
      setDateError(dateValidation.isValid ? null : dateValidation.error || null);
    } else {
      setDateError(null);
    }
  }, [startDate, endDate, electionDate, enrolDdl, validateDates]);

  // Validate times whenever they change
  useEffect(() => {
    if (startTime && endTime) {
      const timeValidation = validateTimes();
      setTimeError(timeValidation.isValid ? null : timeValidation.error || null);
    } else {
      setTimeError(null);
    }
  }, [startTime, endTime, validateTimes]);

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
          candidateIds: selectedCandidates.map(candidate => candidate.candidateId || (candidate as any).id),
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
          endDate: dateToSimpleDate(endDate!)!,
          enrolDdl: dateToSimpleDate(enrolDdl!)!,
          noOfCandidates,
          candidateIds: selectedCandidates.map(candidate => candidate.candidateId || (candidate as any).id),
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
  const isFormValid = Boolean(
    electionName &&
      electionType &&
      !isFormLoading &&
      selectedCandidates.length === noOfCandidates &&
      (editingElection ||
        (electionDate &&
          startTime &&
          endTime &&
          !dateError &&
          !timeError))
  );

  // Date selection handlers
  const handleDateSelect = useCallback((
    date: Date | undefined,
    setter: React.Dispatch<React.SetStateAction<Date | undefined>>,
    popoverSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (isFormLoading) return;
    setter(date);
    setTimeout(() => popoverSetter(false), 50);
  }, [isFormLoading]);

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
                onValueChange={setElectionType}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="noOfCandidates">
                  Number of Candidates<span className="text-red-500">*</span>
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
                <Label>Candidates</Label>
                <Button
                  variant="outline"
                  onClick={() => setIsCandidateDialogOpen(true)}
                  disabled={isFormLoading || noOfCandidates === 0}
                >
                  {selectedCandidates.length > 0
                    ? `${selectedCandidates.length} candidates selected`
                    : "Select Candidates"}
                </Button>
              </div>
            </div>
            {/* Candidate validation messages */}
            {selectedCandidates.length < noOfCandidates && noOfCandidates > 0 && (
              <p className="text-sm text-red-500">
                {noOfCandidates - selectedCandidates.length} more candidates
                need to be selected
              </p>
            )}
            {selectedCandidates.length > noOfCandidates && (
              <p className="text-sm text-red-500">
                Exceeded the candidate limit by{" "}
                {selectedCandidates.length - noOfCandidates}
              </p>
            )}
            {editingElection && (
              <div className="grid gap-2">
                <Label htmlFor="status">
                  Status<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as ElectionStatus)}
                  required
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
        {(!editingElection || (editingElection && editingElection.electionDate)) && (
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
                      {startDate ? format(startDate, "PPP") : "Select start date"}
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
                  End Date<span className="text-red-500">*</span>
                </Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={isFormLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) =>
                        handleDateSelect(date, setEndDate, setEndDateOpen)
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
                      {electionDate ? format(electionDate, "PPP") : "Select date"}
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
            {dateError && <div className="text-sm text-red-500">{dateError}</div>}
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

        {/* Display calculated status in debug mode */}
        {process.env.NODE_ENV === "development" && !editingElection && (
          <div className="text-xs text-muted-foreground ml-4 self-center">
            Status: {calculateStatus()}
          </div>
        )}
      </div>

      {/* Show candidate dialog for both new and edit */}
      <CandidateSelectionDialog
        open={isCandidateDialogOpen && !isFormLoading}
        onOpenChange={setIsCandidateDialogOpen}
        candidates={candidates}
        requiredCandidates={noOfCandidates}
        onSelect={setSelectedCandidates}
        existingSelections={selectedCandidates}
      />
    </div>
  );
}
