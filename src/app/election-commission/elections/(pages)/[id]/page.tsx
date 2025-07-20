"use client";

import { useParams, useRouter } from "next/navigation";
import { ElectionForm } from "../../components/election-form";
import { useElections } from "../../hooks/use-elections";
import { useEffect, useState } from "react";
import { Election } from "../../election.types";
import { toast } from "@/components/ui/use-toast";

export default function EditElectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchElectionById, editElection } = useElections();
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadElection() {
      try {
        const data = await fetchElectionById(id as string);
        setElection(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load election data",
          variant: "destructive",
        });
        router.push("/admin/elections");
      } finally {
        setLoading(false);
      }
    }
    loadElection();
  }, [id, fetchElectionById, router]);

  const handleSubmit = async (data: any) => {
    try {
      await editElection(id as string, data);
      router.push("/admin/elections");
    } catch (error) {
      console.error("Error updating election:", error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/elections");
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!election) {
    return <div className="container mx-auto py-8">Election not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <ElectionForm
          editingElection={election}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
