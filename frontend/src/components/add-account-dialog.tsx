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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountStore, AccountFormData, AccountType } from "@/stores/account";

export interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: AccountFormData) => void;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  title = "Add Account",
  onSubmit,
}: AddAccountDialogProps) {
  const {
    formData,
    errors,
    updateField,
    setIsOpen,
    validateForm,
    resetForm,
  } = useAccountStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof AccountFormData, value: string) => {
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

  const accountTypes: AccountType[] = [
    "Asset",
    "Liability",
    "Equity",
    "Revenue",
    "Expense",
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
            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType" className="text-sm">
                Account Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) =>
                  handleChange("accountType", value as AccountType)
                }
              >
                <SelectTrigger
                  className={errors.accountType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountType && (
                <p className="text-xs text-destructive">{errors.accountType}</p>
              )}
            </div>

            {/* Account Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm">
                Account Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g., 1001, 2001, 3001"
                className={errors.code ? "border-destructive" : ""}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code}</p>
              )}
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-sm">
                Account Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                placeholder="Enter account name"
                className={errors.accountName ? "border-destructive" : ""}
              />
              {errors.accountName && (
                <p className="text-xs text-destructive">
                  {errors.accountName}
                </p>
              )}
            </div>

            {/* Debit and Credit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debit" className="text-sm">
                  Initial Debit
                </Label>
                <Input
                  id="debit"
                  type="number"
                  value={formData.debit}
                  onChange={(e) => handleChange("debit", e.target.value)}
                  placeholder="0.00"
                  className={errors.debit ? "border-destructive" : ""}
                />
                {errors.debit && (
                  <p className="text-xs text-destructive">{errors.debit}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit" className="text-sm">
                  Initial Credit
                </Label>
                <Input
                  id="credit"
                  type="number"
                  value={formData.credit}
                  onChange={(e) => handleChange("credit", e.target.value)}
                  placeholder="0.00"
                  className={errors.credit ? "border-destructive" : ""}
                />
                {errors.credit && (
                  <p className="text-xs text-destructive">{errors.credit}</p>
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
            Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

