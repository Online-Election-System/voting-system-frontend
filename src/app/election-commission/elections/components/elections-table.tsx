import { useState } from 'react';
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
import { formatSimpleDate, simpleDateToDate } from "../utils/date-utils";
import { formatTimeOfDay } from "../utils/time-utils";
import { DeleteConfirmationDialog } from "./delete-election";
import Link from "next/link";
import { useElections } from "../hooks/use-elections";
import { ElectionDialog } from "./election-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ElectionsTableProps {
  elections: Election[];
  onDelete: (id: string) => void;
  itemsPerPage?: number;
}

export function ElectionsTable({ 
  elections, 
  onDelete, 
  itemsPerPage = 10 
}: ElectionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { fetchElectionById } = useElections();

  // Sort elections by date
  const sortedElections = [...elections].sort((a, b) => {
    const dateA = simpleDateToDate(a.electionDate)?.getTime() || 0;
    const dateB = simpleDateToDate(b.electionDate)?.getTime() || 0;
    return dateB - dateA; // Newest first
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedElections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentElections = sortedElections.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = async (electionId: string) => {
    try {
      const election = await fetchElectionById(electionId);
      setSelectedElection(election);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Failed to fetch election details:", error);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, currentPage + half);
      
      if (currentPage <= half + 1) {
        end = maxVisiblePages;
      } else if (currentPage >= totalPages - half) {
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
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
            {currentElections.map((election) => (
              <TableRow 
                key={election.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(election.id)}
              >
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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

      <ElectionDialog 
        election={selectedElection} 
        isOpen={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen}
        onDelete={onDelete}
      />

      {sortedElections.length > itemsPerPage && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedElections.length)} of {sortedElections.length} elections
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
