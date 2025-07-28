"use client";

import { useRouter } from "next/navigation";
import { ElectionForm } from "../../components/election-form";
import { useCreateElection } from "../../hooks/use-elections";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function AddElectionPage() {
  const router = useRouter();
  const createElectionMutation = useCreateElection();

  const handleSubmit = async (data: any) => {
    try {
      console.log("Submitting new election data:", data);
      
      // Use React Query mutation
      await createElectionMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Election created successfully",
        variant: "default",
      });

      router.push("/election-commission/elections");
    } catch (error) {
      console.error("Error adding election:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create election",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    toast({
      title: "Cancelled",
      description: "Election creation was cancelled",
    });
    router.push("/election-commission/elections");
  };

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
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create New Election</h1>
            <p className="text-muted-foreground">
              Set up a new election with all the necessary details
            </p>
          </div>
        </div>

        {/* Help Text */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-blue-900">
                  Creating an Election
                </h3>
                <p className="text-sm text-blue-700">
                  All fields marked with * are required.
                </p>
                <p className="text-sm text-blue-700">
                  Make sure to set appropriate dates and times. The system will
                  automatically calculate the election status based on the
                  current date and time.
                </p>
                <ul className="text-sm text-blue-600 space-y-1 mt-2">
                  <li>
                    • <strong>Start Date:</strong> When the election period
                    begins
                  </li>
                  <li>
                    • <strong>Election Date:</strong> The actual voting day
                  </li>
                  <li>
                    • <strong>Start Time - End Time:</strong> When voters can cast their
                    ballots
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardContent>
            <ElectionForm
              editingElection={null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createElectionMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
