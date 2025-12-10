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
import { useLeaveRequestStore, LeaveRequestFormData } from "@/stores/leave";

export interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: LeaveRequestFormData) => void;
  employees?: string[];
  leaveTypes?: string[];
}

const defaultLeaveTypes = [
  "Vacation",
  "Sick Leave",
  "Personal",
  "Maternity",
  "Paternity",
  "Emergency",
];

export function LeaveRequestDialog({
  open,
  onOpenChange,
  title = "File Leave Request",
  onSubmit,
  employees = [],
  leaveTypes = defaultLeaveTypes,
}: LeaveRequestDialogProps) {
  const {
    formData,
    errors,
    updateField,
    setIsOpen,
    validateForm,
    resetForm,
  } = useLeaveRequestStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof LeaveRequestFormData, value: string) => {
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
            {/* Employee Name */}
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-sm">
                Employee Name <span className="text-destructive">*</span>
              </Label>
              {employees.length > 0 ? (
                <Select
                  value={formData.employeeName}
                  onValueChange={(value) =>
                    handleChange("employeeName", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.employeeName ? "border-destructive" : ""
                    }
                  >
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee} value={employee}>
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) =>
                    handleChange("employeeName", e.target.value)
                  }
                  className={errors.employeeName ? "border-destructive" : ""}
                  placeholder="Enter employee name"
                />
              )}
              {errors.employeeName && (
                <p className="text-xs text-destructive">
                  {errors.employeeName}
                </p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType" className="text-sm">
                Leave Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => handleChange("leaveType", value)}
              >
                <SelectTrigger
                  className={errors.leaveType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveType && (
                <p className="text-xs text-destructive">{errors.leaveType}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={errors.endDate ? "border-destructive" : ""}
                  min={formData.startDate || undefined}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Please provide a reason for your leave request..."
                className={errors.reason ? "border-destructive" : ""}
                rows={4}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">{errors.reason}</p>
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
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} variant="default">
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

