import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import type { EnrolledCandidate } from "../election.types";

// Import shared components
import {
  useTableSearch,
  SearchInput,
  SortableHeader,
  ResultsSummary,
  TablePagination,
} from "@/components/shared/table";

interface CompactEnrolledCandidatesTableProps {
  enrolledCandidates: EnrolledCandidate[];
  showVotes?: boolean;
  maxHeight?: string;
  itemsPerPage?: number;
}

export const CompactEnrolledCandidatesTable = ({
  enrolledCandidates,
  showVotes = false,
  maxHeight = "400px",
  itemsPerPage = 8,
}: CompactEnrolledCandidatesTableProps) => {
  // Use shared table search hook
  const {
    searchQuery,
    sortConfig,
    currentPage,
    filteredData,
    hasActiveFilters,
    setSearchQuery,
    setCurrentPage,
    updateSort,
  } = useTableSearch(
    enrolledCandidates,
    ["candidateName", "partyName"],
    itemsPerPage
  );

  // Get final paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const finalTotalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (enrolledCandidates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-2">
          <User className="h-8 w-8 text-gray-400" />
          <p className="text-gray-600">No candidates enrolled yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Section - Compact */}
      <div className="flex flex-col gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search candidates..."
        />
      </div>

      {/* Results Summary - Compact */}
      <ResultsSummary
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredData.length}
        totalCount={enrolledCandidates.length}
        itemName="candidates"
      />

      {/* Scrollable Table */}
      <div className="border rounded-lg overflow-hidden" style={{ maxHeight }}>
        <div className="overflow-auto" style={{ maxHeight }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background border-b">
              <TableRow>
                <TableHead className="h-10 text-xs">
                  <SortableHeader
                    field="candidateName"
                    currentSort={sortConfig}
                    onSort={updateSort}
                    className="text-xs"
                  >
                    Name
                  </SortableHeader>
                </TableHead>
                <TableHead className="h-10 text-xs">
                  <SortableHeader
                    field="partyName"
                    currentSort={sortConfig}
                    onSort={updateSort}
                    className="text-xs"
                  >
                    Party
                  </SortableHeader>
                </TableHead>
                {showVotes && (
                  <TableHead className="h-10 text-xs text-right">
                    <SortableHeader
                      field="numberOfVotes"
                      currentSort={sortConfig}
                      onSort={updateSort}
                      className="text-xs"
                    >
                      Votes
                    </SortableHeader>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showVotes ? 3 : 2}
                    className="text-center text-muted-foreground py-6 text-sm"
                  >
                    {hasActiveFilters
                      ? "No candidates match your search criteria"
                      : "No candidates found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((candidate) => (
                  <TableRow
                    key={candidate.candidateId}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-50 rounded">
                          <User className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {candidate.candidateName ||
                              `Candidate ${candidate.candidateId}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            ID: {candidate.candidateId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {candidate.partyName || "Independent"}
                    </TableCell>
                    {showVotes && (
                      <TableCell className="py-3 text-right">
                        <span className="font-medium text-sm">
                          {candidate.numberOfVotes.toLocaleString()}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Only show if more than one page */}
      {finalTotalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={finalTotalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="candidates"
        />
      )}
    </div>
  );
};
