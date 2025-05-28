"use client";

import { useState, useEffect } from "react";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ElectionsTable } from "./components/elections-table";
import { ElectionForm } from "./components/election-form";
import { useElections } from "./hooks/use-elections";
import { Election, ElectionConfig, ElectionUpdate } from "./types/election.types";

export default function ElectionsPage() {
  const [open, setOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const {
    elections,
    loading,
    error,
    fetchElections,
    fetchElectionById,
    addElection,
    editElection,
    removeElection,
  } = useElections();

  // Fetch elections on component mount
  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const handleAddElection = async (electionConfig: ElectionConfig) => {
    await addElection(electionConfig);
    setOpen(false);
  };

  const handleUpdateElection = async (updateData: ElectionUpdate) => {
    if (!editingElection) return;
    await editElection(editingElection.id, updateData);
    setEditingElection(null);
    setOpen(false);
  };

  const handleEditElection = async (election: Election) => {
    try {
      const latestElection = await fetchElectionById(election.id);
      setEditingElection(latestElection);
      setOpen(true);
    } catch (err) {
      console.error("Error fetching election for edit:", err);
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this election?")) {
      await removeElection(id);
    }
  };

  const handleFormSubmit = async (data: ElectionConfig | ElectionUpdate) => {
    if (editingElection) {
      await handleUpdateElection(data as ElectionUpdate);
    } else {
      await handleAddElection(data as ElectionConfig);
    }
  };

  const handleFormCancel = () => {
    setEditingElection(null);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Elections</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditingElection(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Election
            </Button>
          </DialogTrigger>
          <ElectionForm 
            editingElection={editingElection} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormCancel} 
          />
        </Dialog>
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
              onEdit={handleEditElection} 
              onDelete={handleDeleteElection} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
