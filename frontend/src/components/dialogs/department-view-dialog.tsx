"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Edit, Users } from "lucide-react";
import { DepartmentFromAPI } from "@/stores/department";

export interface DepartmentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentFromAPI | null;
  employeeCount?: number;
  onEdit?: (department: DepartmentFromAPI) => void;
}

export function DepartmentViewDialog({
  open,
  onOpenChange,
  department,
  employeeCount = 0,
  onEdit,
}: DepartmentViewDialogProps) {
  if (!department) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground border border-border flex-shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-foreground mb-2">
                {department.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  ID: {department.id}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-4 space-y-6">
            {/* Department Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Department Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Department Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {department.name}
                  </p>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm font-medium text-foreground">
                    {department.description || (
                      <span className="text-muted-foreground italic">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Total Employees
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {employeeCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Created: {formatDate(department.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Last Updated: {formatDate(department.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                if (department) {
                  onEdit(department);
                  onOpenChange(false);
                }
              }}
              className="w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Department
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

