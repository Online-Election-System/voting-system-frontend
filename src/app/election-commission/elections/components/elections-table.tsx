import { useState, useMemo } from "react";
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
import { useElection, usePrefetchElection } from "../hooks/use-elections";
import { ElectionDialog } from "./election-dialog";

// Import shared components
import {
  useTableSearch,
  SearchInput,
  FilterControls,
  FilterSelect,
  SortableHeader,
  ResultsSummary,
  TablePagination,
  FilterOption,
} from "@/components/shared/table";

interface ElectionsTableProps {
  elections: Election[];
  onDelete: (id: string) => void;
  onElectionHover?: (electionId: string) => void;
  itemsPerPage?: number;
}

export function ElectionsTable({
  elections,
  onDelete,
  onElectionHover,
  itemsPerPage = 10,
}: ElectionsTableProps) {
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // React Query hook for fetching election details
  const {
    data: selectedElection,
    isLoading: loadingElectionDetails,
    error: electionError,
  } = useElection(selectedElectionId || "", {
    enabled: !!selectedElectionId, // Only fetch when an election is selected
  });

  const prefetchElection = usePrefetchElection();

  // Use shared table search hook
  const {
    searchQuery,
    filters,
    sortConfig,
    currentPage,
    filteredData,
    paginatedData,
    totalPages,
    hasActiveFilters,
    setSearchQuery,
    setCurrentPage,
    updateFilter,
    updateSort,
    clearFilters,
  } = useTableSearch(
    elections,
    ["electionName", "electionType", "description"],
    itemsPerPage
  );

  // Get unique election types and statuses for filters
  const uniqueTypes = useMemo((): FilterOption[] => {
    const types = [
      ...new Set(elections.map((e) => e.electionType).filter(Boolean)),
    ];
    return types.sort().map((type) => ({ label: type, value: type }));
  }, [elections]);

  const statusOptions: FilterOption[] = [
    { label: "Scheduled", value: "Scheduled" },
    { label: "Upcoming", value: "Upcoming" },
    { label: "Active", value: "Active" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const dateRangeOptions: FilterOption[] = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
    { label: "This Month", value: "this-month" },
    { label: "This Year", value: "this-year" },
  ];

  // Handle date range filtering
  const filteredByDateRange = useMemo(() => {
    if (!filters.dateRange || filters.dateRange === "all") {
      return filteredData;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return filteredData.filter((election) => {
      if (!election.electionDate) return false;

      const electionDate = simpleDateToDate(election.electionDate);
      if (!electionDate) return false;

      switch (filters.dateRange) {
        case "past":
          return electionDate < now;
        case "upcoming":
          return electionDate >= now;
        case "this-month":
          return (
            electionDate.getMonth() === currentMonth &&
            electionDate.getFullYear() === currentYear
          );
        case "this-year":
          return electionDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  }, [filteredData, filters.dateRange]);

  // Sort filtered elections by date (newest first)
  const sortedElections = useMemo(() => {
    const dataToSort = filteredByDateRange;

    if (!sortConfig.field) {
      // Default sort by election date (newest first)
      return [...dataToSort].sort((a, b) => {
        const dateA = simpleDateToDate(a.electionDate)?.getTime() || 0;
        const dateB = simpleDateToDate(b.electionDate)?.getTime() || 0;
        return dateB - dateA;
      });
    }

    return dataToSort; // Already sorted by useTableSearch hook
  }, [filteredByDateRange, sortConfig]);

  // Get paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentElections = sortedElections.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleRowClick = (electionId: string) => {
    setSelectedElectionId(electionId);
    setIsDetailsOpen(true);
  };

  const handleRowHover = (electionId: string) => {
    // Prefetch election details for instant loading
    prefetchElection(electionId);
    onElectionHover?.(electionId);
  };

  const handleCloseDialog = () => {
    setIsDetailsOpen(false);
    setSelectedElectionId(null);
  };

  // Helper function to determine row styling
  const getRowStyling = (election: Election) => {
    const baseClass = "cursor-pointer transition-colors";
    return `${baseClass} hover:bg-gray-50 dark:hover:bg-gray-800`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search elections..."
        />

        <FilterControls
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        >
          <FilterSelect
            label="Status"
            value={filters.status || "all"}
            options={statusOptions}
            onChange={(value) => updateFilter("status", value)}
          />
          <FilterSelect
            label="Election Type"
            value={filters.electionType || "all"}
            options={uniqueTypes}
            onChange={(value) => updateFilter("electionType", value)}
          />
          <FilterSelect
            label="Date Range"
            value={filters.dateRange || "all"}
            options={dateRangeOptions}
            onChange={(value) => updateFilter("dateRange", value)}
          />
        </FilterControls>
      </div>

      <ResultsSummary
        hasActiveFilters={hasActiveFilters}
        filteredCount={sortedElections.length}
        totalCount={elections.length}
        itemName="elections"
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  field="electionName"
                  currentSort={sortConfig}
                  onSort={updateSort}
                >
                  Title
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="electionType"
                  currentSort={sortConfig}
                  onSort={updateSort}
                >
                  Type
                </SortableHeader>
              </TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>
                <SortableHeader
                  field="electionDate"
                  currentSort={sortConfig}
                  onSort={updateSort}
                >
                  Election Date
                </SortableHeader>
              </TableHead>
              <TableHead>Time</TableHead>
              <TableHead>
                <SortableHeader
                  field="noOfCandidates"
                  currentSort={sortConfig}
                  onSort={updateSort}
                >
                  Candidates
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="status"
                  currentSort={sortConfig}
                  onSort={updateSort}
                >
                  Status
                </SortableHeader>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentElections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No elections match your search criteria"
                    : "No elections found"}
                </TableCell>
              </TableRow>
            ) : (
              currentElections.map((election) => (
                <TableRow
                  key={election.id}
                  className={getRowStyling(election)}
                  onClick={() => handleRowClick(election.id)}
                  onMouseEnter={() => handleRowHover(election.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {election.electionName || "Untitled"}
                    </div>
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
                      ? `${formatTimeOfDay(
                          election.startTime
                        )} - ${formatTimeOfDay(election.endTime)}`
                      : "Time not set"}
                  </TableCell>
                  <TableCell>{election.noOfCandidates || 0}</TableCell>
                  <TableCell>
                    <ElectionStatusBadge status={election.status} />
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link
                          href={`/election-commission/elections/${election.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteConfirmationDialog
                        onConfirm={() => onDelete(election.id)}
                        trigger={
                          <Button variant="ghost" size="icon" title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Election Details Dialog - Uses React Query data */}
      <ElectionDialog
        election={selectedElection || null}
        isOpen={isDetailsOpen}
        onOpenChange={handleCloseDialog}
        onDelete={onDelete}
        isLoading={loadingElectionDetails}
        error={electionError}
      />

      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(sortedElections.length / itemsPerPage)}
        totalItems={sortedElections.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        itemName="elections"
      />
    </div>
  );
}
