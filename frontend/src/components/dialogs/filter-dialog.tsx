"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFilterStore } from "@/stores/filter";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  label: string;
  key: string;
  options: FilterOption[];
}

export interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
  onClearFilters?: () => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  title = "Filter",
  filterGroups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: FilterDialogProps) {
  const {
    selectedFilters: storeFilters,
    toggleFilter,
    setSelectedFilters: setStoreFilters,
    setIsOpen: setStoreIsOpen,
  } = useFilterStore();

  // Use store filters if they exist, otherwise use props
  const localFilters = Object.keys(storeFilters).length > 0 ? storeFilters : selectedFilters;

  // Sync store with prop changes when dialog opens
  useEffect(() => {
    if (open && selectedFilters) {
      setStoreFilters(selectedFilters);
    }
  }, [open, selectedFilters, setStoreFilters]);

  // Sync dialog open state with store
  useEffect(() => {
    setStoreIsOpen(open);
  }, [open, setStoreIsOpen]);

  const handleToggleFilter = (groupKey: string, value: string) => {
    toggleFilter(groupKey, value);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters: Record<string, string[]> = {};
    filterGroups.forEach((group) => {
      clearedFilters[group.key] = [];
    });
    setStoreFilters(clearedFilters);
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange(clearedFilters);
    }
    onOpenChange(false);
  };

  const hasActiveFilters = filterGroups.some(
    (group) => (localFilters[group.key] || []).length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 flex flex-col rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <div className="space-y-6">
            {filterGroups.map((group, groupIndex) => (
              <div key={group.key}>
                <Label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 block">
                  {group.label}
                </Label>
                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isChecked = (localFilters[group.key] || []).includes(
                      option.value
                    );
                    return (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 py-2 px-2 rounded-lg transition-colors hover:bg-muted/50 group"
                      >
                      <Checkbox
                        id={`${group.key}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleToggleFilter(group.key, option.value)
                        }
                        className="transition-all"
                      />
                        <Label
                          htmlFor={`${group.key}-${option.value}`}
                          className="text-sm font-normal text-foreground cursor-pointer flex-1 select-none group-hover:text-foreground transition-colors"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {groupIndex < filterGroups.length - 1 && (
                  <Separator className="mt-5 mb-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full sm:w-auto order-2 sm:order-1 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="w-full sm:w-auto order-1 sm:order-2 bg-primary-gray hover:bg-primary-gray/90 text-primary-foreground transition-colors"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
