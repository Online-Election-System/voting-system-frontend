import { useState, useEffect, useCallback } from "react";
import { format, isBefore, isAfter, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Election, ElectionConfig, ElectionStatus, ElectionUpdate } from "../election.types";
import { simpleDateToDate, dateToSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay, parseTimeString } from "../utils/time-utils";
import { ELECTION_TYPES, ELECTION_STATUSES } from "../election-constants";
import { toast } from "@/components/ui/use-toast";

interface ElectionFormProps {
  editingElection: Election | null;
  onSubmit: (data: ElectionConfig | ElectionUpdate) => Promise<void>;
  onCancel: () => void;
}

export function ElectionForm({ editingElection, onSubmit, onCancel }: ElectionFormProps) {
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
  const [noOfCandidates, setNoOfCandidates] = useState(1);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Calendar popover states
  const [electionDateOpen, setElectionDateOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [enrolDdlOpen, setEnrolDdlOpen] = useState(false);

  // Calculate status based on dates and times
  const calculateStatus = useCallback((): ElectionStatus => {
    const now = new Date();
    
    if (!startDate || !endDate || !electionDate || !startTime || !endTime) {
      return "Scheduled";
    }

    // Parse election day times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
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
    
    if (isWithinInterval(now, { start: electionStartDateTime, end: electionEndDateTime })) {
      return "Active";
    }
    
    if (isAfter(now, electionEndDateTime)) {
      return "Completed";
    }
    
    return "Scheduled";
  }, [startDate, endDate, electionDate, startTime, endTime]);

  // Validate time inputs
  const validateTimes = useCallback((): { isValid: boolean; error?: string } => {
    if (!startTime || !endTime) {
      return { isValid: false, error: "Both start and end times are required" };
    }

    if (startTime >= endTime) {
      return { isValid: false, error: "Start time must be before end time" };
    }

    return { isValid: true };
  }, [startTime, endTime]);

  // Update status whenever relevant dates/times change
  useEffect(() => {
    if (!editingElection) {
      setStatus(calculateStatus());
    }
  }, [calculateStatus, editingElection]);

  // Date validation helpers
  const isDateBetween = (date: Date, start: Date, end: Date): boolean => {
    return date >= start && date <= end;
  };

  const validateDates = useCallback((): { isValid: boolean; error?: string } => {
    if (!startDate || !endDate || !electionDate || !enrolDdl) {
      return { isValid: false, error: "All dates are required" };
    }

    if (startDate > endDate) {
      return { isValid: false, error: "Start date must be before end date" };
    }

    if (!isDateBetween(electionDate, startDate, endDate)) {
      return { isValid: false, error: "Election date must be between start and end dates" };
    }

    if (!isDateBetween(enrolDdl, startDate, endDate)) {
      return { isValid: false, error: "Enrollment deadline must be between start and end dates" };
    }

    if (enrolDdl >= electionDate) {
      return { isValid: false, error: "Enrollment deadline must be before election date" };
    }

    return { isValid: true };
  }, [startDate, endDate, electionDate, enrolDdl]);

  // Validate whenever relevant fields change
  useEffect(() => {
    if (startDate && endDate && electionDate && enrolDdl) {
      const dateValidation = validateDates();
      setDateError(dateValidation.isValid ? null : dateValidation.error || null);
    } else {
      setDateError(null);
    }

    if (startTime && endTime) {
      const timeValidation = validateTimes();
      setTimeError(timeValidation.isValid ? null : timeValidation.error || null);
    } else {
      setTimeError(null);
    }
  }, [startDate, endDate, electionDate, enrolDdl, startTime, endTime, validateDates, validateTimes]);

  // Set form values when editing an election
  useEffect(() => {
    if (editingElection) {
      setElectionName(editingElection.electionName || "");
      setElectionType(editingElection.electionType || "");
      setDescription(editingElection.description || "");
      setStatus(editingElection.status || "Scheduled");
      setNoOfCandidates(editingElection.noOfCandidates || 1);

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
    }
  }, [editingElection]);

  const handleSubmit = async () => {
    // Basic validation
    if (!electionName || !electionType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Date validation for new elections
    if (!editingElection) {
      if (!electionDate || !startDate || !endDate || !enrolDdl || !startTime || !endTime) {
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
      const currentStatus = editingElection ? status : calculateStatus();
      
      if (editingElection) {
        // Update existing election
        const updateData: ElectionUpdate = {
          electionName,
          electionType,
          status: currentStatus,
          description,
        };

        if (electionDate) {
          updateData.electionDate = dateToSimpleDate(electionDate);
        }
        if (startTime) {
          updateData.startTime = parseTimeString(startTime);
        }
        if (endTime) {
          updateData.endTime = parseTimeString(endTime);
        }

        await onSubmit(updateData);
      } else {
        // Create new election
        const newElectionConfig: ElectionConfig = {
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
        };

        await onSubmit(newElectionConfig);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast({
        title: "Error",
        description: "Failed to submit election",
        variant: "destructive",
      });
    }
  };

  // Form validation
  const isFormValid = Boolean(
    electionName &&
    electionType &&
    (editingElection || (electionDate && startTime && endTime && !dateError && !timeError))
  );

  // Date selection handlers
  const handleDateSelect = (
    date: Date | undefined,
    setter: React.Dispatch<React.SetStateAction<Date | undefined>>,
    popoverSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(date);
    setTimeout(() => popoverSetter(false), 50);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">
          {editingElection ? "Edit Election" : "Add New Election"}
        </h1>
        <p className="text-muted-foreground">
          {editingElection
            ? "Update the election information below."
            : "Fill in the details to schedule a new election."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="font-bold">Basic Information</h2>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Election Title*</Label>
              <Input
                id="title"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
                placeholder="Enter election title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Election Type*</Label>
              <Select value={electionType} onValueChange={setElectionType} required>
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
            <div className="grid gap-2">
              <Label htmlFor="noOfCandidates">Number of Candidates*</Label>
              <Input
                id="noOfCandidates"
                type="number"
                min="1"
                value={noOfCandidates}
                onChange={(e) => setNoOfCandidates(Math.max(1, Number(e.target.value)))}
                required
              />
            </div>
            {editingElection && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ElectionStatus)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELECTION_STATUSES.map((statusOption) => (
                      <SelectItem key={statusOption.value} value={statusOption.value}>
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
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="font-bold">Election Period</h2>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Start Date*</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateSelect(date, setStartDate, setStartDateOpen)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>End Date*</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateSelect(date, setEndDate, setEndDateOpen)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Enrollment Deadline*</Label>
              <Popover open={enrolDdlOpen} onOpenChange={setEnrolDdlOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !enrolDdl && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {enrolDdl ? format(enrolDdl, "PPP") : "Select enrollment deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={enrolDdl}
                    onSelect={(date) => handleDateSelect(date, setEnrolDdl, setEnrolDdlOpen)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Election Date*</Label>
              <Popover open={electionDateOpen} onOpenChange={setElectionDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !electionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {electionDate ? format(electionDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]">
                  <Calendar
                    mode="single"
                    selected={electionDate}
                    onSelect={(date) => handleDateSelect(date, setElectionDate, setElectionDateOpen)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time*</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time*</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
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
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          {editingElection ? "Update" : "Schedule"}
        </Button>

        {/* Display calculated status in debug mode */}
        {process.env.NODE_ENV === "development" && !editingElection && (
          <div className="text-xs text-muted-foreground ml-4 self-center">
            Status: {calculateStatus()}
          </div>
        )}
      </div>
    </div>
  );
}
