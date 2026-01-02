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
import { useReceivableInvoiceStore, ReceivableInvoiceFormData } from "@/stores/receivableInvoice";
import { useCustomerStore } from "@/stores/customer";

export interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: ReceivableInvoiceFormData) => void;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  title = "Create Invoice",
  onSubmit,
}: CreateInvoiceDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm, createReceivableInvoice } =
    useReceivableInvoiceStore();
  
  const { customers, fetchCustomers } = useCustomerStore();

  // Fetch customers on mount
  useEffect(() => {
    const { setFilters } = useCustomerStore.getState();
    setFilters({ per_page: 1000 });
    fetchCustomers();
  }, [fetchCustomers]);

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof ReceivableInvoiceFormData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await createReceivableInvoice(formData);
      if (result) {
        onOpenChange(false);
        resetForm();
        onSubmit?.(formData);
      }
    }
  };

  // Payment terms options
  const paymentTermsOptions = [
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
    "Due on Receipt",
    "2/10 Net 30",
    "1/15 Net 30",
    "Custom",
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
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="text-sm">
                Invoice Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                placeholder="INV-2024-XXX"
                className={errors.invoiceNumber ? "border-destructive" : ""}
              />
              {errors.invoiceNumber && (
                <p className="text-xs text-destructive">
                  {errors.invoiceNumber}
                </p>
              )}
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm">
                Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => handleChange("customerId", value)}
              >
                <SelectTrigger
                  className={errors.customerId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-xs text-destructive">{errors.customerId}</p>
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
                placeholder="Enter invoice description..."
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Invoice Date and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate" className="text-sm">
                  Invoice Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleChange("invoiceDate", e.target.value)}
                  className={errors.invoiceDate ? "border-destructive" : ""}
                />
                {errors.invoiceDate && (
                  <p className="text-xs text-destructive">
                    {errors.invoiceDate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className={errors.dueDate ? "border-destructive" : ""}
                />
                {errors.dueDate && (
                  <p className="text-xs text-destructive">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Amount and Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-sm">
                  Payment Terms <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) => handleChange("paymentTerms", value)}
                >
                  <SelectTrigger
                    className={errors.paymentTerms ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentTerms && (
                  <p className="text-xs text-destructive">
                    {errors.paymentTerms}
                  </p>
                )}
                {formData.paymentTerms === "Custom" && (
                  <div className="mt-2">
                    <Input
                      id="customPaymentTerms"
                      value={formData.customPaymentTerms}
                      onChange={(e) => handleChange("customPaymentTerms", e.target.value)}
                      placeholder="Enter custom payment terms"
                      className={errors.customPaymentTerms ? "border-destructive" : ""}
                    />
                    {errors.customPaymentTerms && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.customPaymentTerms}
                      </p>
                    )}
                  </div>
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
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

