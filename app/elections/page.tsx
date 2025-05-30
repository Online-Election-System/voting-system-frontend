"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Election {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: string
  enrolled: boolean
}

// TODO: Replace with actual voter ID from session or context
const voterId = 1

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loadingId, setLoadingId] = useState<number | null>(null)

  // Fetch elections from backend
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await fetch(`http://localhost:8081/elections?voterId=${voterId}`)
        const result = await res.json()

        if (result.success && result.data) {
          setElections(result.data)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to load elections.",
          })
        }
      } catch (err) {
        toast({
          title: "Network Error",
          description: "Unable to connect to the server.",
        })
      }
    }

    fetchElections()
  }, [])

  // Enroll voter in election
const handleEnroll = async (electionId: number) => {
  setLoadingId(electionId);

  try {
    const res = await fetch(`http://localhost:8081/elections/${electionId}/enroll/${voterId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (result.success) {
      setElections((prev) =>
        prev.map((e) => (e.id === electionId ? { ...e, enrolled: true } : e))
      );
      toast({
        title: "Enrolled",
        description: "Successfully enrolled in the election.",
      });
    } else {
      toast({
        title: "Enrollment Failed",
        description: result.message || "Could not enroll in the election.",
      });
    }
  } catch (err) {
    toast({
      title: "Network Error",
      description: "Could not connect to backend server.",
    });
  } finally {
    setLoadingId(null);
  }
};

  // Badge display based on status
  const getStatusBadge = (election: Election) => {
    if (election.enrolled) return <Badge variant="success">Enrolled</Badge>
    if (election.status === "Open for Enrollment") return <Badge variant="outline">Open for Enrollment</Badge>
    return <Badge variant="secondary">Coming Soon</Badge>
  }

  // Prioritize enrolled > open > coming
  const sortedElections = [...elections].sort((a, b) => {
    const priority = (e: Election) => (e.enrolled ? 0 : e.status === "Open for Enrollment" ? 1 : 2)
    return priority(a) - priority(b)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        <p className="text-muted-foreground">View all available elections and manage your enrollment.</p>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedElections.map((election) => (
              <tr key={election.id} className="border-t hover:bg-accent">
                <td className="px-4 py-3 font-medium">{election.title}</td>
                <td className="px-4 py-3">{format(new Date(election.startDate), "PPP")}</td>
                <td className="px-4 py-3">{format(new Date(election.endDate), "PPP")}</td>
                <td className="px-4 py-3">{getStatusBadge(election)}</td>
                <td className="px-4 py-3 space-x-2">
                  {election.enrolled ? (
                    <Button size="sm" asChild>
                      <Link href={`/elections/${election.id}`}>View Candidates</Link>
                    </Button>
                  ) : election.status === "Open for Enrollment" ? (
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(election.id)}
                      disabled={loadingId === election.id}
                    >
                      {loadingId === election.id ? "Enrolling..." : "Enroll"}
                    </Button>
                  ) : null}

                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/elections/${election.id}`}>Details</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
