import { SortAsc, SortDesc } from "lucide-react";
import { SortConfig } from "../types/types";

interface SortableHeaderProps {
  children: React.ReactNode;
  field: string;
  currentSort: SortConfig;
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({ 
  children, 
  field, 
  currentSort, 
  onSort, 
  className = "" 
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  
  return (
    <div 
      className={`cursor-pointer hover:bg-muted/50 select-none flex items-center gap-1 ${className}`}
      onClick={() => onSort(field)}
    >
      {children}
      {isActive && (
        currentSort.direction === "asc" ? 
          <SortAsc className="h-4 w-4" /> : 
          <SortDesc className="h-4 w-4" />
      )}
    </div>
  );
}
