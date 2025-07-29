export interface FilterOption {
  label: string;
  value: string;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface SearchAndFilterState {
  searchQuery: string;
  filters: Record<string, string>;
  sortConfig: SortConfig;
  currentPage: number;
}