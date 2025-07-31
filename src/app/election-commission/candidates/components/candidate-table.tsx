import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, RefreshCw, Loader2, User, Image as ImageIcon } from "lucide-react";
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

// Component for displaying circular images with fallback
interface CircularImageProps {
  src?: string | null;
  alt: string;
  fallbackIcon?: React.ReactNode;
  size?: "sm" | "md";
}

function CircularImage({ src, alt, fallbackIcon, size = "sm" }: CircularImageProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10"
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5"
  };

  if (!src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center`}>
        {fallbackIcon || <ImageIcon className={`${iconSizeClasses[size]} text-gray-400`} />}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
      <img 
        src={src} 
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Hide broken image and show fallback
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${iconSizeClasses[size]} text-gray-400">
                ${fallbackIcon ? fallbackIcon : '<svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'}
              </div>
            `;
          }
        }}
      />
    </div>
  );
}

// Component for party color display
function PartyColorSwatch({ color, partyName }: { color: string; partyName: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="h-4 w-4 rounded-full border border-gray-300"
        style={{ backgroundColor: color }}
        title={`${partyName} color: ${color}`}
      />
      <span className="text-xs text-gray-500 font-mono">{color}</span>
    </div>
  );
}

export const CandidateTable = ({ 
  candidates,
  onEdit, 
  onDelete,
  isLoading = false,
  error = null,
  itemsPerPage = 10 
}: CandidateTableProps) => {
  // Use shared table search hook with expanded search fields
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
    candidates, 
    ['candidateName', 'partyName', 'partyColor', 'candidateId'], 
    itemsPerPage
  );

  // Get unique political parties for filter dropdown
  const partyFilterOptions = useMemo((): FilterOption[] => {
    const parties = [...new Set(
      candidates
        .map(c => c.partyName)
        .filter((party): party is string => Boolean(party))
    )].sort();
    
    return parties.map(party => ({ label: party, value: party }));
  }, [candidates]);

  // Get unique party colors for filter dropdown
  const colorFilterOptions = useMemo((): FilterOption[] => {
    const colors = [...new Set(
      candidates
        .map(c => c.partyColor)
        .filter((color): color is string => Boolean(color))
    )].sort();
    
    return colors.map(color => ({ 
      label: color.toUpperCase(), 
      value: color 
    }));
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
    { label: "Color (A-Z)", value: "color-asc" },
    { label: "Color (Z-A)", value: "color-desc" },
  ];

  const fieldMap: Record<string, keyof Candidate> = {
    name: "candidateName",
    party: "partyName",
    color: "partyColor",
  };

  // Handle custom sort option
  const handleSortOptionChange = (value: string) => {
    if (value === "all") return;

    const [field, direction] = value.split('-');
    const mappedField = fieldMap[field] || (field as keyof Candidate);
    const dir = direction === "desc" ? "desc" : "asc";
    updateSort(mappedField as string, dir);
  };

  const getCurrentSortValue = () => {
    if (!sortConfig.field) return "all";
    // Reverse map to keep dropdown selection stable
    const reverseMap: Record<string, string> = {
      candidateName: "name",
      partyName: "party",
      partyColor: "color",
    };
    const displayField = reverseMap[sortConfig.field] || sortConfig.field;
    return `${displayField}-${sortConfig.direction}`;
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

  // Filter by party color
  const colorFilteredData = useMemo(() => {
    if (!filters.partyColor || filters.partyColor === "all") {
      return statusFilteredData;
    }
    
    return statusFilteredData.filter(candidate => 
      candidate.partyColor === filters.partyColor
    );
  }, [statusFilteredData, filters.partyColor]);

  const getPartyName = (candidate: Candidate) => {
    return candidate.partyName || 'Independent';
  };

  const handleDeleteWithConfirm = (candidateId: string, candidateName: string) => {
    if (confirm(`Are you sure you want to delete ${candidateName}?`)) {
      onDelete(candidateId);
    }
  };

  // Get final paginated data
  const finalPaginatedData = colorFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const finalTotalPages = Math.ceil(colorFilteredData.length / itemsPerPage);

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
            placeholder="Search candidates by name, party, or ID..."
          />

          <FilterControls hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters}>
            <FilterSelect
              label="Political Party"
              value={filters.partyName || "all"}
              options={partyFilterOptions}
              onChange={(value) => updateFilter("partyName", value)}
            />
            <FilterSelect
              label="Party Color"
              value={filters.partyColor || "all"}
              options={colorFilterOptions}
              onChange={(value) => updateFilter("partyColor", value)}
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
          filteredCount={colorFilteredData.length}
          totalCount={candidates.length}
          itemName="candidates"
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>
                  <SortableHeader
                    field="candidateName"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Name
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="partyName"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Political Party
                  </SortableHeader>
                </TableHead>
                <TableHead>Party Symbol</TableHead>
                <TableHead>
                  <SortableHeader
                    field="partyColor"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Party Color
                  </SortableHeader>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading candidates...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : finalPaginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {hasActiveFilters 
                      ? "No candidates match your search criteria" 
                      : "No candidates found. Add your first candidate to get started."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                finalPaginatedData.map((candidate) => (
                  <TableRow key={candidate.candidateId || candidate.id} className="hover:bg-muted/50">
                    <TableCell>
                      <CircularImage 
                        src={candidate.candidateImage} 
                        alt={`${candidate.candidateName} photo`}
                        fallbackIcon={<User className="h-4 w-4 text-gray-400" />}
                        size="md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{candidate.candidateName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {candidate.candidateId || candidate.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getPartyName(candidate)}</div>
                    </TableCell>
                    <TableCell>
                      <CircularImage 
                        src={candidate.partySymbol} 
                        alt={`${getPartyName(candidate)} symbol`}
                        fallbackIcon={<ImageIcon className="h-4 w-4 text-gray-400" />}
                      />
                    </TableCell>
                    <TableCell>
                      <PartyColorSwatch 
                        color={candidate.partyColor} 
                        partyName={getPartyName(candidate)}
                      />
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
                            candidate.candidateId || candidate.id, 
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
          totalItems={colorFilteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="candidates"
        />
      </CardContent>
    </Card>
  );
};
