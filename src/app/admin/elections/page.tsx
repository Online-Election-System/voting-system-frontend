"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ElectionsTable } from "./components/elections-table";
import { useElections } from "./hooks/use-elections";
import { Election, ElectionConfig, ElectionUpdate } from "./election.types";
import { toast } from "@/hooks/use-toast";

export default function ElectionsPage() {
  const { elections, loading, error, fetchElections, removeElection } =
    useElections();

  // Fetch elections on component mount
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const handleDeleteElection = async (id: string) => {
    try {
      await removeElection(id);
      toast({
        title: "Success",
        description: "Election deleted successfully",
        variant: "default",
      });
      fetchElections();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete election",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Elections</h1>
        <Link href="/admin/elections/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Election
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elections List</CardTitle>
          <CardDescription>
            Manage all scheduled and past elections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchElections}
              >
                Try Again
              </Button>
            </div>
          ) : elections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No elections found. Create your first election!</p>
            </div>
          ) : (
            <ElectionsTable
              elections={elections}
              onDelete={handleDeleteElection}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
