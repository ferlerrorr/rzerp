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
import { useDepartmentStore, DepartmentFormData } from "@/stores/department";

export interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: DepartmentFormData) => void;
  mode?: "create" | "edit";
  departmentId?: number;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  title = "Add Department",
  onSubmit,
  mode = "create",
  departmentId,
}: DepartmentDialogProps) {
  const {
    formData,
    errors,
    updateField,
    setIsOpen,
    validateForm,
    loading,
    getDepartment,
    loadDepartmentForEdit,
    resetForm,
  } = useDepartmentStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }, [open, setIsOpen, resetForm]);

  // Load department data when editing
  useEffect(() => {
    if (open && mode === "edit" && departmentId) {
      getDepartment(departmentId).then((department) => {
        if (department) {
          loadDepartmentForEdit(department);
        }
      });
    } else if (open && mode === "create") {
      resetForm();
    }
  }, [open, mode, departmentId, getDepartment, loadDepartmentForEdit, resetForm]);

  const handleChange = (field: keyof DepartmentFormData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Call onSubmit and wait for it to complete
      await onSubmit?.(formData);
      // Only close dialog if there are no errors (success case)
      // The onSubmit handler will handle closing on success
    }
  };

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
            {/* Department Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Department Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., IT, Human Resources, Sales"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
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
                placeholder="Enter department description (optional)"
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="default"
            disabled={loading}
          >
            {loading ? "Submitting..." : mode === "edit" ? "Update Department" : "Create Department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

