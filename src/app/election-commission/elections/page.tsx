// pages/ElectionsPage.tsx
"use client";

import { useElections, useDeleteElection, usePrefetchElection } from "./hooks/use-elections";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { ElectionsTable } from "./components/elections-table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ElectionsPage() {
  const {
    data: electionsData,
    isLoading,
    error,
    refetch,
  } = useElections();

  const deleteElectionMutation = useDeleteElection();
  const prefetchElection = usePrefetchElection();

  const handleRefresh = () => {
    refetch();
  };

  const router = useRouter();
  const handleAddElection = () => {
    router.push('/election-commission/elections/add');
  }

  const handleDeleteElection = async (electionId: string) => {
    if (confirm("Are you sure you want to delete this election?")) {
      try {
        await deleteElectionMutation.mutateAsync(electionId);
      } catch (error) {
        console.error("Failed to delete election:", error);
      }
    }
  };

  const handleElectionHover = (electionId: string) => {
    // Prefetch election details for instant loading when clicked
    prefetchElection(electionId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 mx-4 sm:mx-6 lg:mx-12 my-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Elections</h1>
            <p className="text-muted-foreground">
              Manage all elections in the system
            </p>
          </div>
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading elections...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 mx-4 sm:mx-6 lg:mx-12 my-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Elections</h1>
            <p className="text-muted-foreground">
              Manage all elections in the system
            </p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading elections: {error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { elections = [] } = electionsData || {};

  return (
    <div className="space-y-6 mx-4 sm:mx-6 lg:mx-12 my-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-muted-foreground">
            Manage all elections in the system
          </p>
        </div>
        <div className="flex gap-6">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddElection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Election
          </Button>
        </div>
      </div>

      {elections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Elections Found</CardTitle>
            <CardDescription>
              Create your first election to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Election
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <ElectionsTable 
              elections={elections}
              onDelete={handleDeleteElection}
              itemsPerPage={10}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
