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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgetStore, BudgetFormData } from "@/stores/budget";

export interface CreateBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: BudgetFormData) => void;
}

export function CreateBudgetDialog({
  open,
  onOpenChange,
  title = "Create Budget",
  onSubmit,
}: CreateBudgetDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm } =
    useBudgetStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof BudgetFormData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      onOpenChange(false);
      resetForm();
    }
  };

  // Generate period options (current year and next year)
  const currentYear = new Date().getFullYear();
  const periodOptions = [
    { value: `${currentYear}`, label: `${currentYear} (Annual)` },
    { value: `${currentYear}-Q1`, label: `${currentYear} Q1` },
    { value: `${currentYear}-Q2`, label: `${currentYear} Q2` },
    { value: `${currentYear}-Q3`, label: `${currentYear} Q3` },
    { value: `${currentYear}-Q4`, label: `${currentYear} Q4` },
    { value: `${currentYear + 1}`, label: `${currentYear + 1} (Annual)` },
  ];

  // Common budget categories
  const categoryOptions = [
    "Salaries & Wages",
    "Operating Expenses",
    "Marketing",
    "IT & Technology",
    "Rent & Utilities",
    "Office Supplies",
    "Travel & Entertainment",
    "Training & Development",
    "Legal & Professional Services",
    "Insurance",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="px-6 py-4 space-y-6">
            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm">
                Budget Period <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.period}
                onValueChange={(value) => handleChange("period", value)}
              >
                <SelectTrigger
                  className={errors.period ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.period && (
                <p className="text-xs text-destructive">{errors.period}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Budgeted Amount */}
            <div className="space-y-2">
              <Label htmlFor="budgetedAmount" className="text-sm">
                Budgeted Amount (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="budgetedAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.budgetedAmount}
                onChange={(e) => handleChange("budgetedAmount", e.target.value)}
                placeholder="0.00"
                className={errors.budgetedAmount ? "border-destructive" : ""}
              />
              {errors.budgetedAmount && (
                <p className="text-xs text-destructive">
                  {errors.budgetedAmount}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter budget description (optional)..."
                rows={3}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} variant="default">
            Create Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

