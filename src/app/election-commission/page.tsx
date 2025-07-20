"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Vote, BarChart3 } from "lucide-react"
import { useCandidates } from "./candidates/hooks/use-candidates"
import { useElections } from "./elections/hooks/use-elections"
import { useEffect } from "react"

type SimpleDate = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
};

export default function AdminDashboard() {
  const { candidates } = useCandidates();
  const { elections, fetchElections } = useElections();

  // Fetch elections on component mount
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  // Helper function to convert SimpleDate to Date
  const simpleDateToDate = (simpleDate?: SimpleDate): Date | null => {
    if (!simpleDate) return null;
    
    // Validate required fields
    if (
      typeof simpleDate.year !== 'number' ||
      typeof simpleDate.month !== 'number' ||
      typeof simpleDate.day !== 'number'
    ) {
      console.error('Invalid date fields:', simpleDate);
      return null;
    }

    // Set defaults for optional fields
    const hour = simpleDate.hour !== undefined ? simpleDate.hour : 0;
    const minute = simpleDate.minute !== undefined ? simpleDate.minute : 0;

    return new Date(
      simpleDate.year,
      simpleDate.month - 1, // months are 0-indexed in JavaScript Date
      simpleDate.day,
      hour,
      minute
    );
  };

  // Get active elections (current date is between start and end dates)
  const activeElections = elections.filter(election => {
    const now = new Date();
    const startDate = simpleDateToDate(election.startDate);
    const endDate = simpleDateToDate(election.endDate);
    
    if (!startDate || !endDate) return false;
    return now >= startDate && now <= endDate;
  });

  // Get upcoming elections (start date is in the future)
  const upcomingElections = elections
    .filter(election => {
      const startDate = simpleDateToDate(election.startDate);
      return startDate && startDate > new Date();
    })
    .sort((a, b) => {
      const aDate = simpleDateToDate(a.startDate) || new Date(0);
      const bDate = simpleDateToDate(b.startDate) || new Date(0);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3); // Only show next 3

  // Format date for display
  const formatDate = (simpleDate?: SimpleDate): string => {
    const date = simpleDateToDate(simpleDate);
    if (!date) return 'Not scheduled';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (simpleDate?: SimpleDate): string => {
    if (!simpleDate || simpleDate.hour === undefined || simpleDate.minute === undefined) {
      return 'N/A';
    }
    
    const hours = simpleDate.hour % 12 || 12;
    const minutes = simpleDate.minute.toString().padStart(2, '0');
    const ampm = simpleDate.hour >= 12 ? 'PM' : 'AM';
    
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6 mx-12 my-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-xs text-muted-foreground">
              {candidates.length > 0 ? `${candidates.length} registered` : "No candidates yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeElections.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeElections.length > 0 
                ? activeElections[0].title 
                : "No active elections"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.length}</div>
            <p className="text-xs text-muted-foreground">
              {elections.length > 0 
                ? `${elections.length} total elections` 
                : "No elections created"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Elections</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingElections.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingElections.length > 0 
                ? upcomingElections.map(e => e.title).join(", ") 
                : "No upcoming elections"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Elections</CardTitle>
            <CardDescription>Schedule for the next elections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingElections.length > 0 ? (
                upcomingElections.map((election) => (
                  <div key={election.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{election.electionName}</p>
                      <p className="text-sm text-muted-foreground">{election.electionType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatDate(election.startDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(election.startDate)} - {formatTime(election.endDate)}
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
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidates.length > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Latest Candidate Added</p>
                    <p className="text-sm text-muted-foreground">
                      {candidates[candidates.length - 1].name}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Recently</p>
                </div>
              )}
              {elections.length > 0 && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Latest Election Created</p>
                    <p className="text-sm text-muted-foreground">
                      {elections[elections.length - 1].title}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Recently</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">System Status</p>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
