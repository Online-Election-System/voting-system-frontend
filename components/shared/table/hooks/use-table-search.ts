import { useState, useMemo, useCallback } from "react";
import { SortConfig } from "../types/types";

export function useTableSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  initialItemsPerPage = 10
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(query);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter(item => {
          const itemValue = item[key as keyof T];
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        const aValue = String(a[sortConfig.field as keyof T] || "").toLowerCase();
        const bValue = String(b[sortConfig.field as keyof T] || "").toLowerCase();
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, filters, sortConfig, searchFields]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / initialItemsPerPage);
  const startIndex = (currentPage - 1) * initialItemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + initialItemsPerPage);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({});
    setSortConfig({ field: "", direction: "asc" });
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || 
    Object.values(filters).some(value => value && value !== "all") ||
    sortConfig.field !== ""
  );

  return {
    // State
    searchQuery,
    filters,
    sortConfig,
    currentPage,
    
    // Derived data
    filteredData,
    paginatedData,
    totalPages,
    startIndex,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setCurrentPage,
    updateFilter,
    updateSort,
    clearFilters,
  };
}
