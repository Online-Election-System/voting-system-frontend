import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterControlsProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  children: React.ReactNode;
}

export function FilterControls({ hasActiveFilters, onClearFilters, children }: FilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = React.Children.count(children);

  return (
    <div className="flex items-center gap-2">
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Filter Options</h4>
            </div>
            {children}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
