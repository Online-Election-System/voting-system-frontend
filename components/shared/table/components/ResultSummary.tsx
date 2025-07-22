interface ResultsSummaryProps {
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
  itemName: string;
}

export function ResultsSummary({ 
  hasActiveFilters, 
  filteredCount, 
  totalCount, 
  itemName 
}: ResultsSummaryProps) {
  if (!hasActiveFilters) return null;
  
  return (
    <div className="text-sm text-muted-foreground">
      Showing {filteredCount} of {totalCount} {itemName}
    </div>
  );
}
