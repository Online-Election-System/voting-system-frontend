import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Candidate } from "../candidate.types";

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

interface CandidateTableProps {
  candidates: Candidate[];
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidateId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
}

export const CandidateTable = ({ 
  candidates,
  onEdit, 
  onDelete,
  isLoading = false,
  error = null,
  itemsPerPage = 10 
}: CandidateTableProps) => {
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
  } = useTableSearch(candidates, ['candidateName', 'partyName', 'email'], itemsPerPage);

  // Get unique political parties for filter dropdown
  const partyFilterOptions = useMemo((): FilterOption[] => {
    const parties = [...new Set(
      candidates
        .map(c => c.partyName)
        .filter((party): party is string => Boolean(party))
    )].sort();
    
    return parties.map(party => ({ label: party, value: party }));
  }, [candidates]);

  // Status filter options
  const statusFilterOptions: FilterOption[] = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  // Sort options
  const sortOptions: FilterOption[] = [
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Party (A-Z)", value: "party-asc" },
    { label: "Party (Z-A)", value: "party-desc" },
  ];

  // Handle custom sort option
  const handleSortOptionChange = (value: string) => {
    if (value === "all") return;
    
    const [field, direction] = value.split('-');
    updateSort(field);
    
    // If the direction doesn't match, toggle it
    if (sortConfig.direction !== direction) {
      updateSort(field); // This will toggle the direction
    }
  };

  const getCurrentSortValue = () => {
    if (!sortConfig.field) return "all";
    return `${sortConfig.field}-${sortConfig.direction}`;
  };

  // Filter by status
  const statusFilteredData = useMemo(() => {
    if (!filters.status || filters.status === "all") {
      return filteredData;
    }
    
    return filteredData.filter(candidate => {
      if (filters.status === "active") {
        return candidate.isActive !== false;
      } else {
        return candidate.isActive === false;
      }
    });
  }, [filteredData, filters.status]);

  const getPartyName = (candidate: Candidate) => {
    return candidate.partyName || 'Independent';
  };

  const handleDeleteWithConfirm = (candidateId: string, candidateName: string) => {
    if (confirm(`Are you sure you want to delete ${candidateName}?`)) {
      onDelete(candidateId);
    }
  };

  // Get final paginated data
  const finalPaginatedData = statusFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const finalTotalPages = Math.ceil(statusFilteredData.length / itemsPerPage);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Candidates</CardTitle>
          <CardDescription className="text-red-600">
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search candidates..."
          />

          <FilterControls hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}>
            <FilterSelect
              label="Political Party"
              value={filters.party || "all"}
              options={partyFilterOptions}
              onChange={(value) => updateFilter("party", value)}
            />
            <FilterSelect
              label="Status"
              value={filters.status || "all"}
              options={statusFilterOptions}
              onChange={(value) => updateFilter("status", value)}
            />
            <FilterSelect
              label="Sort By"
              value={getCurrentSortValue()}
              options={sortOptions}
              onChange={handleSortOptionChange}
              placeholder="Default Order"
            />
          </FilterControls>
        </div>

        <ResultsSummary
          hasActiveFilters={hasActiveFilters}
          filteredCount={statusFilteredData.length}
          totalCount={candidates.length}
          itemName="candidates"
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    field="name"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Name
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="party"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Political Party
                  </SortableHeader>
                </TableHead>
                <TableHead>Election ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading candidates...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : finalPaginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {hasActiveFilters 
                      ? "No candidates match your search criteria" 
                      : "No candidates found. Add your first candidate to get started."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                finalPaginatedData.map((candidate) => (
                  <TableRow key={candidate.id || candidate.candidateId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{candidate.candidateName}</TableCell>
                    <TableCell>{getPartyName(candidate)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {candidate.electionId || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {candidate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(candidate)}
                          aria-label={`Edit ${candidate.candidateName}`}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteWithConfirm(
                            candidate.id || candidate.candidateId, 
                            candidate.candidateName
                          )}
                          aria-label={`Delete ${candidate.candidateName}`}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={finalTotalPages}
          totalItems={statusFilteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="candidates"
        />
      </CardContent>
    </Card>
  );
};
