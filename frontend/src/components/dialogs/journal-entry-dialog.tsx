"use client";

import { useEffect, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  useJournalEntryStore,
  JournalEntryFormData,
} from "@/stores/journalEntry";

export interface Account {
  id: string;
  code: string;
  accountName: string;
  accountType: string;
}

export interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: JournalEntryFormData) => void;
  accounts?: Account[];
}

export function JournalEntryDialog({
  open,
  onOpenChange,
  title = "New Journal Entry",
  onSubmit,
  accounts = [],
}: JournalEntryDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm } =
    useJournalEntryStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof JournalEntryFormData, value: string) => {
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

  // Get selected account names for summary
  const selectedDebitAccount = useMemo(() => {
    return accounts.find((acc) => acc.id === formData.debitAccountId);
  }, [accounts, formData.debitAccountId]);

  const selectedCreditAccount = useMemo(() => {
    return accounts.find((acc) => acc.id === formData.creditAccountId);
  }, [accounts, formData.creditAccountId]);

  // Format amount for display
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const displayAmount = useMemo(() => {
    const amountNum = parseFloat(formData.amount) || 0;
    return formatCurrency(amountNum);
  }, [formData.amount]);

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
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber" className="text-sm">
                Reference Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) =>
                  handleChange("referenceNumber", e.target.value)
                }
                placeholder="e.g., SAL-001, EXP-045"
                className={errors.referenceNumber ? "border-destructive" : ""}
              />
              {errors.referenceNumber && (
                <p className="text-xs text-destructive">
                  {errors.referenceNumber}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter transaction description..."
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Debit Account and Credit Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debitAccount" className="text-sm">
                  Debit Account <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.debitAccountId}
                  onValueChange={(value) =>
                    handleChange("debitAccountId", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.debitAccountId ? "border-destructive" : ""
                    }
                  >
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.debitAccountId && (
                  <p className="text-xs text-destructive">
                    {errors.debitAccountId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAccount" className="text-sm">
                  Credit Account <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.creditAccountId}
                  onValueChange={(value) =>
                    handleChange("creditAccountId", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.creditAccountId ? "border-destructive" : ""
                    }
                  >
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.creditAccountId && (
                  <p className="text-xs text-destructive">
                    {errors.creditAccountId}
                  </p>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">
                Amount (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                className={errors.amount ? "border-destructive" : ""}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>

            <Separator />

            {/* Journal Entry Summary */}
            <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-foreground mb-2 ">
                Journal Entry Summary:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between ">
                  <Label className="text-sm font-medium text-foreground">
                    Debit:
                  </Label>
                  <span className="text-sm text-foreground">
                    {selectedDebitAccount
                      ? `${selectedDebitAccount.code} - ${selectedDebitAccount.accountName}`
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between ">
                  <Label className="text-sm font-medium text-foreground">
                    Credit:
                  </Label>
                  <span className="text-sm text-foreground">
                    {selectedCreditAccount
                      ? `${selectedCreditAccount.code} - ${selectedCreditAccount.accountName}`
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                  <Label className="text-sm font-semibold text-foreground">
                    Amount:
                  </Label>
                  <span className="text-sm font-semibold text-foreground">
                    {displayAmount}
                  </span>
                </div>
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
            Create Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
