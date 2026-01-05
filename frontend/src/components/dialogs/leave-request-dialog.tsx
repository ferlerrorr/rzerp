"use client";

import { useEffect, useState } from "react";
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
import { useLeaveRequestStore, LeaveRequestDialogFormData } from "@/stores/leave";

export interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: LeaveRequestDialogFormData) => void;
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
  const [localFormData, setLocalFormData] = useState<LeaveRequestDialogFormData>({
    employeeName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof LeaveRequestDialogFormData, string>>>({});

  const { setIsOpen } = useLeaveRequestStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof LeaveRequestDialogFormData, value: string) => {
    setLocalFormData((prev) => ({ ...prev, [field]: value }));
    if (localErrors[field]) {
      setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LeaveRequestDialogFormData, string>> = {};
    if (!localFormData.employeeName) errors.employeeName = "Employee name is required";
    if (!localFormData.leaveType) errors.leaveType = "Leave type is required";
    if (!localFormData.startDate) errors.startDate = "Start date is required";
    if (!localFormData.endDate) errors.endDate = "End date is required";
    if (!localFormData.reason) errors.reason = "Reason is required";
    if (localFormData.startDate && localFormData.endDate && localFormData.startDate > localFormData.endDate) {
      errors.endDate = "End date must be after start date";
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setLocalFormData({
      employeeName: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setLocalErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(localFormData);
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
                  value={localFormData.employeeName}
                  onValueChange={(value) =>
                    handleChange("employeeName", value)
                  }
                >
                  <SelectTrigger
                    className={
                      localErrors.employeeName ? "border-destructive" : ""
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
                  value={localFormData.employeeName}
                  onChange={(e) =>
                    handleChange("employeeName", e.target.value)
                  }
                  className={localErrors.employeeName ? "border-destructive" : ""}
                  placeholder="Enter employee name"
                />
              )}
              {localErrors.employeeName && (
                <p className="text-xs text-destructive">
                  {localErrors.employeeName}
                </p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType" className="text-sm">
                Leave Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={localFormData.leaveType}
                onValueChange={(value) => handleChange("leaveType", value)}
              >
                <SelectTrigger
                  className={localErrors.leaveType ? "border-destructive" : ""}
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
              {localErrors.leaveType && (
                <p className="text-xs text-destructive">{localErrors.leaveType}</p>
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
                  value={localFormData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={localErrors.startDate ? "border-destructive" : ""}
                />
                {localErrors.startDate && (
                  <p className="text-xs text-destructive">
                    {localErrors.startDate}
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
                  value={localFormData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={localErrors.endDate ? "border-destructive" : ""}
                  min={localFormData.startDate || undefined}
                />
                {localErrors.endDate && (
                  <p className="text-xs text-destructive">{localErrors.endDate}</p>
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
                value={localFormData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Please provide a reason for your leave request..."
                className={localErrors.reason ? "border-destructive" : ""}
                rows={4}
              />
              {localErrors.reason && (
                <p className="text-xs text-destructive">{localErrors.reason}</p>
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

