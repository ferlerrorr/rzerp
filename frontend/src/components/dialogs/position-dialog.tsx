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
import { usePositionStore, PositionFormData } from "@/stores/position";
import { useDepartmentStore } from "@/stores/department";

export interface PositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: PositionFormData) => void;
  mode?: "create" | "edit";
  positionId?: number;
}

export function PositionDialog({
  open,
  onOpenChange,
  title = "Add Position",
  onSubmit,
  mode = "create",
  positionId,
}: PositionDialogProps) {
  const {
    formData,
    errors,
    updateField,
    setIsOpen,
    validateForm,
    loading,
    getPosition,
    loadPositionForEdit,
    resetForm,
  } = usePositionStore();
  const { departments, fetchDepartments } = useDepartmentStore();

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }, [open, setIsOpen, resetForm]);

  // Load position data when editing
  useEffect(() => {
    if (open && mode === "edit" && positionId) {
      getPosition(positionId).then((position) => {
        if (position) {
          loadPositionForEdit(position);
        }
      });
    } else if (open && mode === "create") {
      resetForm();
    }
  }, [open, mode, positionId, getPosition, loadPositionForEdit, resetForm]);

  const handleChange = (field: keyof PositionFormData, value: string) => {
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
            {/* Position Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Position Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Software Engineer, HR Manager, Sales Representative"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="departmentId" className="text-sm">
                Department
              </Label>
              <Select
                value={formData.departmentId || undefined}
                onValueChange={(value) => handleChange("departmentId", value)}
                disabled={departments.length === 0}
              >
                <SelectTrigger
                  id="departmentId"
                  className={errors.departmentId ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={
                      departments.length === 0
                        ? "No department available"
                        : "Select a department (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No department available
                    </div>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {departments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No departments found. Please add a department first.
                </p>
              )}
              {errors.departmentId && (
                <p className="text-xs text-destructive">
                  {errors.departmentId}
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
                placeholder="Enter position description (optional)"
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
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
            {loading
              ? "Submitting..."
              : mode === "edit"
              ? "Update Position"
              : "Create Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
