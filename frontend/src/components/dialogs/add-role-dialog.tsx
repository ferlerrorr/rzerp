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
import { Checkbox } from "@/components/ui/checkbox";
import { useRoleStore, RoleFormData } from "@/stores/role";

export interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  permissions?: Array<{ id: number; name: string }>;
  onSubmit?: (data: RoleFormData) => void;
}

export function AddRoleDialog({
  open,
  onOpenChange,
  title = "Add Role",
  permissions = [],
  onSubmit,
}: AddRoleDialogProps) {
  const {
    formData,
    errors,
    updateField,
    updatePermissionIds,
    setIsOpen,
    validateForm,
    resetForm,
  } = useRoleStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (
    field: keyof Omit<RoleFormData, "permission_ids">,
    value: string
  ) => {
    updateField(field, value);
  };

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const currentPermissionIds = formData.permission_ids;
    if (checked) {
      updatePermissionIds([...currentPermissionIds, permissionId]);
    } else {
      updatePermissionIds(
        currentPermissionIds.filter((id) => id !== permissionId)
      );
    }
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
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., admin, manager, editor"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers, hyphens, or underscores only
              </p>
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
                placeholder="Enter role description (optional)"
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label className="text-sm">Permissions</Label>
              <div className="space-y-2 border border-border rounded-lg p-4 max-h-64 overflow-y-auto scrollbar-thin">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No permissions available
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center space-x-2 cursor-pointer py-1"
                    >
                      <Checkbox
                        checked={formData.permission_ids.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(permission.id, checked === true)
                        }
                      />
                      <span className="text-sm">{permission.name}</span>
                    </label>
                  ))
                )}
              </div>
              {errors.permission_ids && (
                <p className="text-xs text-destructive">
                  {errors.permission_ids}
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
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} variant="default">
            Add Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}





