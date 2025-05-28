import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ElectionConfig,
  ElectionStatus,
  ElectionUpdate,
} from "../types/election.types";
import { simpleDateToDate, dateToSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay, parseTimeString } from "../utils/time-utils";
import {
  ELECTION_TYPES,
  ELECTION_STATUSES,
} from "../constants/election-constants";
import { toast } from "@/components/ui/use-toast";

interface ElectionFormProps {
  editingElection: Election | null;
  onSubmit: (data: ElectionConfig | ElectionUpdate) => Promise<void>;
  onCancel: () => void;
}

export function ElectionForm({
  editingElection,
  onSubmit,
  onCancel,
}: ElectionFormProps) {
  // Form state
  const [electionName, setElectionName] = useState("");
  const [electionType, setElectionType] = useState("");
  const [electionDate, setElectionDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [enrolDdl, setEnrolDdl] = useState<Date | undefined>(undefined);
  const [noOfCandidates, setNoOfCandidates] = useState(1);

  // Calendar popover states
  const [electionDateOpen, setElectionDateOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [enrolDdlOpen, setEnrolDdlOpen] = useState(false);

  // Set form values when editing an election
  useEffect(() => {
    if (editingElection) {
      setElectionName(editingElection.electionName || "");
      setElectionType(editingElection.electionType || "");
      setDescription(editingElection.description || "");
      setStatus(editingElection.status || "Scheduled");
      setNoOfCandidates(editingElection.noOfCandidates || 1);

      // Handle dates with careful validation
      const jsDate = simpleDateToDate(editingElection.electionDate);
      const jsStartDate = simpleDateToDate(editingElection.startDate);
      const jsEndDate = simpleDateToDate(editingElection.endDate);
      const jsEnrolDdl = simpleDateToDate(editingElection.enrolDdl);

      setElectionDate(jsDate);
      setStartDate(jsStartDate);
      setEndDate(jsEndDate);
      setEnrolDdl(jsEnrolDdl);

      // Format time values with validation
      if (
        editingElection.startTime &&
        typeof editingElection.startTime.hour === "number" &&
        typeof editingElection.startTime.minute === "number"
      ) {
        setStartTime(formatTimeOfDay(editingElection.startTime));
      } else {
        setStartTime("");
      }

      if (
        editingElection.endTime &&
        typeof editingElection.endTime.hour === "number" &&
        typeof editingElection.endTime.minute === "number"
      ) {
        setEndTime(formatTimeOfDay(editingElection.endTime));
      } else {
        setEndTime("");
      }
    }
  }, [editingElection]);

  const handleSubmit = async () => {
    if (!electionName || !electionType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingElection) {
        // Update existing election
        const updateData: ElectionUpdate = {};

        if (electionName) updateData.electionName = electionName;
        if (electionType) updateData.electionType = electionType;

        if (electionDate) {
          const simpleDate = dateToSimpleDate(electionDate);
          if (simpleDate) updateData.electionDate = simpleDate;
        }

        if (startTime) {
          const parsedStartTime = parseTimeString(startTime);
          if (parsedStartTime) updateData.startTime = parsedStartTime;
        }

        if (endTime) {
          const parsedEndTime = parseTimeString(endTime);
          if (parsedEndTime) updateData.endTime = parsedEndTime;
        }

        if (description !== undefined) updateData.description = description;
        if (status) updateData.status = status as ElectionStatus;

        await onSubmit(updateData);
      } else {
        // Create new election
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

        const simpleDate = dateToSimpleDate(electionDate);
        const simpleStartDate = dateToSimpleDate(startDate);
        const simpleEndDate = dateToSimpleDate(endDate);
        const simpleEnrolDdl = dateToSimpleDate(enrolDdl);
        const parsedStartTime = parseTimeString(startTime);
        const parsedEndTime = parseTimeString(endTime);

        if (
          !simpleDate ||
          !simpleStartDate ||
          !simpleEndDate ||
          !simpleEnrolDdl ||
          !parsedStartTime ||
          !parsedEndTime
        ) {
          toast({
            title: "Validation Error",
            description:
              "Invalid date or time format. Please check your inputs.",
            variant: "destructive",
          });
          return;
        }

        const newElectionConfig: ElectionConfig = {
          electionName,
          electionType,
          electionDate: simpleDate,
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          description,
          status: status as any,
          startDate: simpleStartDate,
          endDate: simpleEndDate,
          enrolDdl: simpleEnrolDdl,
          noOfCandidates,
        };

        await onSubmit(newElectionConfig);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  // Determine button state based on validation
  const isFormValid = Boolean(
    electionName &&
      electionType &&
      (editingElection || (electionDate && startTime && endTime))
  );

  // Date selection handlers that manage the popover state
  const handleElectionDateSelect = (date: Date | undefined) => {
    setElectionDate(date);
    // Close the popover after a short delay to ensure the UI updates correctly
    setTimeout(() => setElectionDateOpen(false), 50);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setTimeout(() => setStartDateOpen(false), 50);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setTimeout(() => setEndDateOpen(false), 50);
  };

  const handleEnrolDdlSelect = (date: Date | undefined) => {
    setEnrolDdl(date);
    setTimeout(() => setEnrolDdlOpen(false), 50);
  };

  return (
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingElection ? "Edit Election" : "Add New Election"}
        </DialogTitle>
        <DialogDescription>
          {editingElection
            ? "Update the election information below."
            : "Fill in the details to schedule a new election."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
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
                {electionDate ? (
                  format(electionDate, "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]">
              <Calendar
                mode="single"
                selected={electionDate}
                onSelect={handleElectionDateSelect}
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
        {!editingElection && (
          <>
            <div className="grid gap-2">
              <Label>Start Date*</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Select start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
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
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Select end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
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
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !enrolDdl && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {enrolDdl ? (
                      format(enrolDdl, "PPP")
                    ) : (
                      <span>Select enrollment deadline</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={enrolDdl}
                    onSelect={handleEnrolDdlSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noOfCandidates">Number of Candidates*</Label>
              <Input
                id="noOfCandidates"
                type="number"
                min="1"
                value={noOfCandidates}
                onChange={(e) =>
                  setNoOfCandidates(Number.parseInt(e.target.value) || 1)
                }
                required
              />
            </div>
          </>
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
        <div className="grid gap-2">
          <Label htmlFor="status">Status*</Label>
          <Select value={status} onValueChange={setStatus} required>
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          {editingElection ? "Update" : "Schedule"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
