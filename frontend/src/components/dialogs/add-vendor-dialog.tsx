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
import { useVendorStore, VendorFormData } from "@/stores/vendor";

export interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: VendorFormData) => void;
}

export function AddVendorDialog({
  open,
  onOpenChange,
  title = "Add Vendor",
  onSubmit,
}: AddVendorDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm } =
    useVendorStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof VendorFormData, value: string) => {
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

  // Common vendor categories
  const categoryOptions = [
    "Electronics",
    "Office Supplies",
    "Manufacturing",
    "General Merchandise",
    "Food & Beverages",
    "Construction",
    "Automotive",
    "Healthcare",
    "Textiles",
    "Other",
  ];

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
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Enter company name"
                className={errors.companyName ? "border-destructive" : ""}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-sm">
                Contact Person <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
                placeholder="Enter contact person name"
                className={errors.contactPerson ? "border-destructive" : ""}
              />
              {errors.contactPerson && (
                <p className="text-xs text-destructive">
                  {errors.contactPerson}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+63 917 123 4567"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter full address"
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>

            {/* TIN / Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="tin" className="text-sm">
                TIN / Tax ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tin"
                value={formData.tin}
                onChange={(e) => handleChange("tin", e.target.value)}
                placeholder="XXX-XXX-XXX-XXX"
                className={errors.tin ? "border-destructive" : ""}
              />
              {errors.tin && (
                <p className="text-xs text-destructive">{errors.tin}</p>
              )}
            </div>

            {/* Payment Terms and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleChange("status", value as "Active" | "Inactive")
                  }
                >
                  <SelectTrigger
                    className={errors.status ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status}</p>
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
            Add Vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

