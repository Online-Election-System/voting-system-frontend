import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { Election } from "../election.types";
import { ElectionStatusBadge } from "./election-status-badge";
import { formatSimpleDate } from "../utils/date-utils";
import { formatTimeOfDay } from "../utils/time-utils";
import { DeleteConfirmationDialog } from "./delete-election";
import Link from "next/link";

interface ElectionsTableProps {
  elections: Election[];
  onDelete: (id: string) => void;
}

export function ElectionsTable({ elections, onDelete }: ElectionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {elections.map((election) => (
            <TableRow key={election.id}>
              <TableCell className="font-medium">
                {election.electionName || "Untitled"}
              </TableCell>
              <TableCell>{election.electionType || "N/A"}</TableCell>
              <TableCell>
                {election.startDate && election.endDate
                  ? `${formatSimpleDate(
                      election.startDate
                    )} - ${formatSimpleDate(election.endDate)}`
                  : "Date range not set"}
              </TableCell>
              <TableCell>
                {election.electionDate
                  ? formatSimpleDate(election.electionDate)
                  : "Date not set"}
              </TableCell>
              <TableCell>
                {election.startTime && election.endTime
                  ? `${formatTimeOfDay(election.startTime)} - ${formatTimeOfDay(
                      election.endTime
                    )}`
                  : "Time not set"}
              </TableCell>
              <TableCell>
                <ElectionStatusBadge status={election.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild title="Edit">
                  <Link href={`/admin/elections/${election.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteConfirmationDialog
                  onConfirm={() => onDelete(election.id)}
                  trigger={
                    <Button variant="ghost" size="icon" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
