"use client";

import { useParams, useRouter } from "next/navigation";
import { ElectionForm } from "../../components/election-form";
import { 
  useElection, 
  useUpdateElection, 
  useElections 
} from "../../hooks/use-elections";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { calculateRealTimeElectionStatus } from "../../utils/election-status-utils";

export default function EditElectionPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // React Query hooks
  const { data: electionsData } = useElections();
  const { 
    data: election, 
    isLoading, 
    error,
    isError 
  } = useElection(id as string, {
    enabled: !!id // Only fetch if ID exists
  });
  
  const updateElectionMutation = useUpdateElection();

  const handleSubmit = async (data: any) => {
    try {
      console.log("📝 Submitting election update:", data);
      
      // Use React Query mutation
      await updateElectionMutation.mutateAsync({
        id: id as string,
        data
      });
      
      toast({
        title: "Success",
        description: "Election updated successfully",
        variant: "default",
      });
      
      router.push("/election-commission/elections");
    } catch (error) {
      console.error("❌ Error updating election:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update election",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/election-commission/elections");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Get real-time status for warnings
  const realTimeStatus = election ? calculateRealTimeElectionStatus(election) : null;
  const isActiveElection = realTimeStatus === 'Active';
  const isCompletedElection = realTimeStatus === 'Completed';

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/election-commission/elections">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Elections
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-lg">Loading election data...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !election) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/election-commission/elections">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Elections
              </Link>
            </Button>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Election Not Found
              </CardTitle>
              <CardDescription className="text-red-600">
                {error?.message || "The requested election could not be found."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button asChild>
                  <Link href="/election-commission/elections">
                    Back to Elections
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/election-commission/elections">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Elections
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Edit3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Edit Election</h1>
            <p className="text-muted-foreground">
              Update the details for "{election.electionName}"
            </p>
          </div>
        </div>

        {/* Status Warning */}
        {(isActiveElection || isCompletedElection) && (
          <Card className={`border-2 ${isActiveElection ? 'border-orange-300 bg-orange-50' : 'border-gray-300 bg-gray-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${isActiveElection ? 'text-orange-600' : 'text-gray-600'}`} />
                <div>
                  <h3 className={`font-medium ${isActiveElection ? 'text-orange-800' : 'text-gray-800'}`}>
                    {isActiveElection ? 'Active Election Warning' : 'Completed Election Notice'}
                  </h3>
                  <p className={`text-sm mt-1 ${isActiveElection ? 'text-orange-700' : 'text-gray-700'}`}>
                    {isActiveElection 
                      ? 'This election is currently active. Editing critical details like dates and times may affect ongoing voting.'
                      : 'This election has been completed. Consider the impact of any changes to historical records.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Status Display */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Current Status</p>
                <p className="text-lg font-semibold text-blue-700">{realTimeStatus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Database Status</p>
                <p className="text-lg font-semibold text-blue-700">{election.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Election Type</p>
                <p className="text-lg font-semibold text-blue-700">{election.electionType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Election Details</CardTitle>
            <CardDescription>
              Update the election information below. Changes will be saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ElectionForm
              editingElection={election}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={updateElectionMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
