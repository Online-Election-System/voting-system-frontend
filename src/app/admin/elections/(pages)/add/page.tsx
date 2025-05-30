"use client";

import { useRouter } from "next/navigation";
import { ElectionForm } from "../../components/election-form";
import { useElections } from "../../hooks/use-elections";
import { toast } from "@/hooks/use-toast";

export default function AddElectionPage() {
  const router = useRouter();
  const { addElection } = useElections();

  const handleSubmit = async (data: any) => {
    try {
      await addElection(data);
      router.push("/admin/elections");
    } catch (error) {
      console.error("Error adding election:", error);
    }
  };

  const handleCancel = () => {
    toast({
      title: "Cancelled",
      description: "Election creation was cancelled",
    });
    router.push("/admin/elections");
  };

  return (
    <div className="container mx-auto py-8">      
      <div className="max-w-2xl mx-auto">
        <ElectionForm 
          editingElection={null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
