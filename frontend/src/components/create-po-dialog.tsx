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
import { Plus, X } from "lucide-react";
import {
  usePurchaseOrderStore,
  PurchaseOrderFormData,
  POItem,
} from "@/stores/purchaseOrder";

export interface CreatePODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: PurchaseOrderFormData) => void;
}

export function CreatePODialog({
  open,
  onOpenChange,
  title = "Create Purchase Order",
  onSubmit,
}: CreatePODialogProps) {
  const {
    formData,
    errors,
    updateField,
    addItem,
    removeItem,
    updateItem,
    setIsOpen,
    validateForm,
    resetForm,
  } = usePurchaseOrderStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (
    field: keyof Omit<PurchaseOrderFormData, "items">,
    value: string
  ) => {
    updateField(field, value);
  };

  const handleItemChange = (
    itemId: string,
    field: keyof POItem,
    value: string
  ) => {
    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value) || 0;
      updateItem(itemId, field, numValue);
    } else {
      updateItem(itemId, field, value);
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

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [formData.items]);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Default vendors
  const vendorOptions = [
    "Tech Supplies Inc.",
    "Office Depot PH",
    "ABC Suppliers Co.",
    "XYZ Trading Co.",
    "Global Distributors",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
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
            {/* Order Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Order Information
              </h3>
              <div className="space-y-4">
                {/* PO Number */}
                <div className="space-y-2">
                  <Label htmlFor="poNumber" className="text-sm">
                    PO Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="poNumber"
                    value={formData.poNumber}
                    onChange={(e) => handleChange("poNumber", e.target.value)}
                    placeholder="PO-2024-XXX"
                    className={errors.poNumber ? "border-destructive" : ""}
                  />
                  {errors.poNumber && (
                    <p className="text-xs text-destructive">{errors.poNumber}</p>
                  )}
                </div>

                {/* Vendor and Requested By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor" className="text-sm">
                      Vendor <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.vendor}
                      onValueChange={(value) => handleChange("vendor", value)}
                    >
                      <SelectTrigger
                        className={errors.vendor ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select Vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorOptions.map((vendor) => (
                          <SelectItem key={vendor} value={vendor}>
                            {vendor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vendor && (
                      <p className="text-xs text-destructive">{errors.vendor}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedBy" className="text-sm">
                      Requested By <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="requestedBy"
                      value={formData.requestedBy}
                      onChange={(e) => handleChange("requestedBy", e.target.value)}
                      placeholder="Enter requester name"
                      className={errors.requestedBy ? "border-destructive" : ""}
                    />
                    {errors.requestedBy && (
                      <p className="text-xs text-destructive">
                        {errors.requestedBy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Date and Expected Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderDate" className="text-sm">
                      Order Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => handleChange("orderDate", e.target.value)}
                      className={errors.orderDate ? "border-destructive" : ""}
                    />
                    {errors.orderDate && (
                      <p className="text-xs text-destructive">
                        {errors.orderDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedDelivery" className="text-sm">
                      Expected Delivery <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expectedDelivery"
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) =>
                        handleChange("expectedDelivery", e.target.value)
                      }
                      className={
                        errors.expectedDelivery ? "border-destructive" : ""
                      }
                    />
                    {errors.expectedDelivery && (
                      <p className="text-xs text-destructive">
                        {errors.expectedDelivery}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                  No items added. Click "Add Item" to add products.
                </div>
              )}

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Item {index + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Product name</Label>
                        <Input
                          value={item.productName}
                          onChange={(e) =>
                            handleItemChange(item.id, "productName", e.target.value)
                          }
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(item.id, "quantity", e.target.value)
                          }
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Unit Price (₱)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(item.id, "unitPrice", e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Subtotal: </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="text-xs text-destructive mt-2">{errors.items}</p>
              )}
            </div>

            <Separator />

            {/* Total Amount */}
            <div className="flex justify-end">
              <div className="text-base">
                <span className="text-muted-foreground">Total Amount: </span>
                <span className="font-bold text-foreground">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Enter any additional notes..."
                rows={3}
              />
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
            Create PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

