"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";

export interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: string;
    balance: string;
  } | null;
  onRecordPayment?: (invoiceId: string, paymentAmount: number) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoice,
  onRecordPayment,
}: RecordPaymentDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState("");

  // Reset payment amount when dialog opens/closes or invoice changes
  useEffect(() => {
    if (open && invoice) {
      setPaymentAmount(invoice.balance.replace(/[₱,]/g, ""));
    } else {
      setPaymentAmount("");
    }
  }, [open, invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    const balance = parseFloat(invoice.balance.replace(/[₱,]/g, ""));

    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (amount > balance) {
      return;
    }

    onRecordPayment?.(invoice.id, amount);
    onOpenChange(false);
    setPaymentAmount("");
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[₱,]/g, "")) || 0;
  };

  const currentBalance = invoice ? parseCurrency(invoice.balance) : 0;
  const payment = parseFloat(paymentAmount) || 0;
  const remainingBalance = Math.max(0, currentBalance - payment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {invoice && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Invoice Number
                  </Label>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Total Amount
                  </Label>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.amount}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Current Balance
                  </Label>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.balance}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount" className="text-sm">
                    Payment Amount (₱) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={currentBalance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  {payment > currentBalance && (
                    <p className="text-xs text-destructive">
                      Payment amount cannot exceed current balance
                    </p>
                  )}
                </div>
                <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground">
                      Remaining Balance:
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </>
            )}
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
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="default"
            disabled={!invoice || payment <= 0 || payment > currentBalance}
          >
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

