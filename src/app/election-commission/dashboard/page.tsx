// components/AdminDashboard.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Vote,
  BarChart3,
  RefreshCw,
  Loader2,
  UserCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useElections } from "../elections/hooks/use-elections";
import { useCandidates } from "../candidates/hooks/use-candidates";
import { TimeOfDay } from "../elections/election.types";
import { ElectionDialog } from "../elections/components/election-dialog";

type SimpleDate = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
};

// Loading skeleton component for cards
const LoadingCard = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="text-2xl font-bold text-muted-foreground">--</div>
      </div>
      <p className="text-xs text-muted-foreground">Loading...</p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  // State for election dialog
  const [selectedElection, setSelectedElection] = useState(null);
  const [isElectionDialogOpen, setIsElectionDialogOpen] = useState(false);

  // React Query hooks - much cleaner than context!
  const {
    data: electionsData,
    isLoading: electionsLoading,
    error: electionsError,
    refetch: refetchElections,
  } = useElections();

  const {
    data: candidatesData,
    isLoading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates,
  } = useCandidates();

  // Manual refresh function
  const handleRefresh = () => {
    refetchElections();
    refetchCandidates();
  };

  // Handle election dialog
  const handleElectionClick = (election: any) => {
    setSelectedElection(election);
    setIsElectionDialogOpen(true);
  };

  const handleElectionDelete = (electionId: string) => {
    // You can implement delete functionality here if needed
    console.log("Delete election:", electionId);
    // For now, just close the dialog
    setIsElectionDialogOpen(false);
    setSelectedElection(null);
  };

  // Extract data with defaults
  const {
    elections = [],
    totalCount = 0,
    activeElections = [],
    upcomingElections = [],
    upcomingCount = 0,
    activeCount = 0,
  } = electionsData || {};

  const {
    candidates = [],
    totalCandidates = 0,
    activeCandidates = 0,
    partiesCount = 0,
  } = candidatesData || {};

  const currentActiveElection = activeElections[0] || null;
  const isLoading = electionsLoading || candidatesLoading;

  // Format date for display
  const formatDate = (simpleDate?: SimpleDate): string => {
    if (!simpleDate) return "Not scheduled";

    try {
      const date = new Date(
        simpleDate.year,
        simpleDate.month - 1,
        simpleDate.day
      );
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format time for display
  const formatTime = (timeOfDay?: TimeOfDay): string => {
    if (
      !timeOfDay ||
      timeOfDay.hour === undefined ||
      timeOfDay.minute === undefined
    ) {
      return "N/A";
    }

    const hours = timeOfDay.hour % 12 || 12;
    const minutes = timeOfDay.minute.toString().padStart(2, "0");
    const ampm = timeOfDay.hour >= 12 ? "PM" : "AM";

    return `${hours}:${minutes} ${ampm}`;
  };

  // Error state
  if (electionsError || candidatesError) {
    return (
      <div className="space-y-6 mx-4 sm:mx-6 lg:mx-12 my-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading dashboard data:{" "}
              {electionsError?.message || candidatesError?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-4 sm:mx-6 lg:mx-12 my-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Election Alert - Now Clickable */}
      {currentActiveElection && !electionsLoading && (
        <Card 
          className="ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-green-600"
          onClick={() => handleElectionClick(currentActiveElection)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                  Live Election
                  <ExternalLink className="h-4 w-4" />
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600">
                    IN PROGRESS - Click to view details
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                    {currentActiveElection.electionName}
                  </h3>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-300">
                    {currentActiveElection.electionType}
                  </p>
                  {currentActiveElection.description && (
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {currentActiveElection.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                    <Clock className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Start Time
                    </p>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      {formatTime(currentActiveElection.startTime)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                    <Clock className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      End Time
                    </p>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      {formatTime(currentActiveElection.endTime)}
                    </p>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg ring-1 ring-green-200">
                  <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Candidates
                  </p>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    {currentActiveElection.noOfCandidates || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {candidatesLoading ? (
          <LoadingCard title="Total Candidates" icon={Users} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                {activeCandidates} active • {partiesCount} parties
              </p>
            </CardContent>
          </Card>
        )}

        {candidatesLoading ? (
          <LoadingCard title="Active Candidates" icon={UserCheck} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Active Candidates
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCandidates}</div>
              <p className="text-xs text-muted-foreground">
                {partiesCount > 0
                  ? `From ${partiesCount} parties`
                  : "No parties yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {electionsLoading ? (
          <LoadingCard title="Total Elections" icon={Vote} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Elections
              </CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">
                {activeCount > 0
                  ? `${activeCount} active`
                  : "No active elections"}
              </p>
            </CardContent>
          </Card>
        )}

        {electionsLoading ? (
          <LoadingCard title="Upcoming Elections" icon={BarChart3} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Upcoming Elections
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingCount > 0
                  ? "Elections scheduled"
                  : "No upcoming elections"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Elections</CardTitle>
            <CardDescription>Next scheduled elections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {electionsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : upcomingElections.length > 0 ? (
                upcomingElections.slice(0, 3).map((election) => (
                  <div
                    key={election.id}
                    className="flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleElectionClick(election)}
                  >
                    <div>
                      <p className="font-medium">{election.electionName}</p>
                      <p className="text-sm text-muted-foreground">
                        {election.electionType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(election.electionDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(election.startTime)} -{" "}
                        {formatTime(election.endTime)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming elections scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading activities...</span>
                </div>
              ) : (
                <>
                  {currentActiveElection && (
                    <div 
                      className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                      onClick={() => handleElectionClick(currentActiveElection)}
                    >
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-400">
                          Election Currently LIVE
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {currentActiveElection.electionName}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {candidates.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Latest Candidate</p>
                        <p className="text-sm text-muted-foreground">
                          {candidates[candidates.length - 1]?.candidateName}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Recently</p>
                    </div>
                  )}

                  {elections.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Latest Election</p>
                        <p className="text-sm text-muted-foreground">
                          {elections[elections.length - 1]?.electionName}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Recently</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Election Dialog */}
      <ElectionDialog
        election={selectedElection}
        isOpen={isElectionDialogOpen}
        onOpenChange={setIsElectionDialogOpen}
        onDelete={handleElectionDelete}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
