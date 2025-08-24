// components/election-dialog.tsx
import type { Election } from "../election.types";
import { ElectionStatusBadge } from "./election-status-badge";
import { formatSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay } from "../utils/time-utils";
import { calculateRealTimeElectionStatus } from "../utils/election-status-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Vote,
  Edit3,
  CalendarDays,
  Trash2,
  Loader2,
  Users,
  Activity,
} from "lucide-react";
import { DeleteConfirmationDialog } from "./delete-election";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompactEnrolledCandidatesTable } from "./compact-candidates-table";
import { EnhancedCandidateStatisticsPanel } from "./enhanced-candidate-statistics-panel";

interface ElectionDialogProps {
  election: Election | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  error?: string | Error | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value?: number | null;
}

// Enhanced Status Display Component for the Dialog
function DialogStatusDisplay({ election }: { election: Election }) {
  const isCancelled = election.status === "Cancelled";
  const realTimeStatus = isCancelled
    ? election.status
    : calculateRealTimeElectionStatus(election);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Vote className="h-4 w-4" />
          {election.electionType || "General Election"}
        </div>
        <ElectionStatusBadge status={realTimeStatus} />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: any;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-slate-900 font-medium">{value}</p>
    </div>
  );
}

export function ElectionDialog({
  election,
  isOpen,
  onOpenChange,
  onDelete,
  isLoading = false,
  error = null,
}: ElectionDialogProps) {
  const isCompleted = election?.status === "Completed";
  const realTimeStatus =
    election && election.status !== "Cancelled"
      ? calculateRealTimeElectionStatus(election)
      : election?.status;
  const isRealTimeCompleted = realTimeStatus === "Completed";
  const isActive = realTimeStatus === "Active";

  if (!isOpen) return null;

  // StatCard Component (defined elsewhere)
  const StatCard = ({ icon, title, value }: StatCardProps) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg">{icon}</div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="font-semibold text-gray-900">
              {value?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="m-6">
            <AlertDescription>
              {typeof error === "string" ? error : error.message}
            </AlertDescription>
          </Alert>
        ) : !election ? (
          <div className="p-6 text-center">No election data available</div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <DialogTitle className="text-2xl font-semibold text-gray-900">
                    {election.electionName || "Untitled Election"}
                  </DialogTitle>
                  <DialogStatusDisplay election={election} />
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-8 pb-6">
                {/* Real-time Status Alert for Active Elections */}
                {isActive && (
                  <Alert className="border-green-300 bg-green-50">
                    <Activity className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Election is currently active!</strong> Voting is
                      in progress.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Voter Statistics Card */}
                {(election.enrolledVotersCount || isActive) && (
                  <div
                    className={isActive ? "grid grid-cols-2 gap-4 mt-4" : ""}
                  >
                    {/* Votes Count Card (only shown for active elections) */}
                    {isActive && (
                      <StatCard
                        icon={<Activity className="h-4 w-4 text-slate-400" />}
                        title="Current Votes"
                        value={election.votesCount}
                      />
                    )}

                    {/* Enrolled Voters Card (shown for both active and inactive elections) */}
                    {election.enrolledVotersCount && (
                      <StatCard
                        icon={<Users className="h-4 w-4 text-slate-400" />}
                        title={
                          isActive
                            ? "Enrolled Voters"
                            : "Number of Enrolled Voters for the Election"
                        }
                        value={election.enrolledVotersCount}
                      />
                    )}
                  </div>
                )}

                {/* Election Overview Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Election Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {election.electionDate && (
                          <InfoItem
                            label="Election Date"
                            value={formatSimpleDate(election.electionDate)}
                            icon={Calendar}
                          />
                        )}

                        {election.startDate && (
                          <InfoItem
                            label="Start Date"
                            value={formatSimpleDate(election.startDate)}
                          />
                        )}

                        {election.endDate && (
                          <InfoItem
                            label="End Date"
                            value={formatSimpleDate(election.endDate)}
                          />
                        )}

                        {election.startTime && (
                          <InfoItem
                            label="Voting Starts"
                            value={formatTimeOfDay(election.startTime)}
                            icon={Clock}
                          />
                        )}

                        {election.endTime && (
                          <InfoItem
                            label="Voting Ends"
                            value={formatTimeOfDay(election.endTime)}
                            icon={Clock}
                          />
                        )}

                        {/* Moved Enrollment Deadline here */}
                        {election.enrolDdl && (
                          <InfoItem
                            label="Enrollment Deadline"
                            value={formatSimpleDate(election.enrolDdl)}
                            icon={CalendarDays}
                          />
                        )}
                      </div>

                      {election.description && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <InfoItem
                            label="Description"
                            value={election.description}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Candidate Statistics Section */}
                <EnhancedCandidateStatisticsPanel
                  currentElection={election}
                  isLoading={false}
                />

                {/* Enrolled Candidates Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>
                          {isCompleted || isRealTimeCompleted
                            ? "Election Results"
                            : "Enrolled Candidates"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {election.enrolledCandidates?.length || 0} of{" "}
                        {election.noOfCandidates} candidates
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Show results note if election is completed in real-time but not in database */}
                      {isRealTimeCompleted && !isCompleted && (
                        <Alert className="border-blue-300 bg-blue-50">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            This election has ended based on the scheduled time.
                            Results may be available.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Candidate Table */}
                      <CompactEnrolledCandidatesTable
                        enrolledCandidates={election.enrolledCandidates || []}
                        showVotes={isCompleted || isRealTimeCompleted}
                        maxHeight="400px"
                        itemsPerPage={15}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Fixed Actions Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <div className="flex justify-end gap-2">
                  <Button asChild className="gap-2">
                    <Link
                      href={`/election-commission/elections/${election.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Election
                    </Link>
                  </Button>
                  <DeleteConfirmationDialog
                    onConfirm={() => {
                      onDelete(election.id);
                      onOpenChange(false);
                    }}
                    trigger={
                      <Button variant="outline" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
