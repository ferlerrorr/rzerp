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
import { Checkbox } from "@/components/ui/checkbox";
import { useUserManagementStore, UserFormData } from "@/stores/userManagement";

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  roles?: Array<{ id: number; name: string }>;
  onSubmit?: (data: UserFormData) => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  title = "Add User",
  roles = [],
  onSubmit,
}: AddUserDialogProps) {
  const {
    formData,
    errors,
    updateField,
    updateRoleIds,
    setIsOpen,
    validateForm,
    resetForm,
  } = useUserManagementStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (
    field: keyof Omit<UserFormData, "role_ids">,
    value: string
  ) => {
    updateField(field, value);
  };

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    const currentRoleIds = formData.role_ids;
    if (checked) {
      updateRoleIds([...currentRoleIds, roleId]);
    } else {
      updateRoleIds(currentRoleIds.filter((id) => id !== roleId));
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
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter password"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  handleChange("password_confirmation", e.target.value)
                }
                placeholder="Confirm password"
                className={
                  errors.password_confirmation ? "border-destructive" : ""
                }
              />
              {errors.password_confirmation && (
                <p className="text-xs text-destructive">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            {/* Roles */}
            <div className="space-y-2">
              <Label className="text-sm">Roles</Label>
              <div className="space-y-2 border border-border rounded-lg p-4">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No roles available
                  </p>
                ) : (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.role_ids.includes(role.id)}
                        onCheckedChange={(checked) =>
                          handleRoleToggle(role.id, checked === true)
                        }
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))
                )}
              </div>
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
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

