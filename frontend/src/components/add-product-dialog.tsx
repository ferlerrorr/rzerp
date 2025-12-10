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
import { useProductStore, ProductFormData } from "@/stores/product";

export interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: ProductFormData) => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  title = "Add Product",
  onSubmit,
}: AddProductDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm } =
    useProductStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof ProductFormData, value: string) => {
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

  // Common categories
  const categoryOptions = [
    "Electronics",
    "Accessories",
    "Furniture",
    "Office Supplies",
    "Software",
    "Hardware",
    "Clothing",
    "Food & Beverages",
    "Other",
  ];

  // Default suppliers (can be loaded from a suppliers list later)
  const supplierOptions = [
    "ABC Suppliers Inc.",
    "XYZ Trading Co.",
    "Global Distributors",
    "Tech Solutions Ltd.",
    "Office Depot",
    "Other",
  ];

  // Default warehouses
  const warehouseOptions = [
    "Main Warehouse",
    "Secondary Warehouse",
    "Distribution Center",
    "Retail Store",
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
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm">
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="e.g., SKU-001"
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku}</p>
              )}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                placeholder="Enter product name"
                className={errors.productName ? "border-destructive" : ""}
              />
              {errors.productName && (
                <p className="text-xs text-destructive">
                  {errors.productName}
                </p>
              )}
            </div>

            {/* Category and Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm">
                  Supplier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) => handleChange("supplier", value)}
                >
                  <SelectTrigger
                    className={errors.supplier ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierOptions.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplier && (
                  <p className="text-xs text-destructive">{errors.supplier}</p>
                )}
              </div>
            </div>

            {/* Initial Quantity and Reorder Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialQuantity" className="text-sm">
                  Initial Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="initialQuantity"
                  type="number"
                  min="0"
                  value={formData.initialQuantity}
                  onChange={(e) => handleChange("initialQuantity", e.target.value)}
                  placeholder="0"
                  className={errors.initialQuantity ? "border-destructive" : ""}
                />
                {errors.initialQuantity && (
                  <p className="text-xs text-destructive">
                    {errors.initialQuantity}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel" className="text-sm">
                  Reorder Level <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange("reorderLevel", e.target.value)}
                  placeholder="0"
                  className={errors.reorderLevel ? "border-destructive" : ""}
                />
                {errors.reorderLevel && (
                  <p className="text-xs text-destructive">
                    {errors.reorderLevel}
                  </p>
                )}
              </div>
            </div>

            {/* Cost Price and Selling Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-sm">
                  Cost Price (₱) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => handleChange("costPrice", e.target.value)}
                  placeholder="0.00"
                  className={errors.costPrice ? "border-destructive" : ""}
                />
                {errors.costPrice && (
                  <p className="text-xs text-destructive">{errors.costPrice}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice" className="text-sm">
                  Selling Price (₱) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", e.target.value)}
                  placeholder="0.00"
                  className={errors.sellingPrice ? "border-destructive" : ""}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-destructive">
                    {errors.sellingPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="warehouse" className="text-sm">
                Warehouse <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.warehouse}
                onValueChange={(value) => handleChange("warehouse", value)}
              >
                <SelectTrigger
                  className={errors.warehouse ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.warehouse && (
                <p className="text-xs text-destructive">{errors.warehouse}</p>
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
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

