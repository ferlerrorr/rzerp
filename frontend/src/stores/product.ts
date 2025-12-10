import { create } from "zustand";

export interface ProductFormData {
  sku: string;
  productName: string;
  category: string;
  supplier: string;
  initialQuantity: string;
  reorderLevel: string;
  costPrice: string;
  sellingPrice: string;
  warehouse: string;
}

interface ProductState {
  formData: ProductFormData;
  errors: Partial<Record<keyof ProductFormData, string>>;
  isOpen: boolean;
  setFormData: (data: ProductFormData) => void;
  updateField: (field: keyof ProductFormData, value: string) => void;
  setError: (field: keyof ProductFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof ProductFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof ProductFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: ProductFormData = {
  sku: "",
  productName: "",
  category: "",
  supplier: "",
  initialQuantity: "",
  reorderLevel: "",
  costPrice: "",
  sellingPrice: "",
  warehouse: "",
};

export const useProductStore = create<ProductState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  setFormData: (data) => set({ formData: data }),

  updateField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
    // Clear error when user starts typing
    const currentErrors = get().errors;
    if (currentErrors[field]) {
      set({
        errors: { ...currentErrors, [field]: undefined },
      });
    }
  },

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    }));
  },

  setErrors: (errors) => set({ errors }),

  clearErrors: () => set({ errors: {} }),

  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      errors: {},
    });
  },

  setIsOpen: (open) => {
    set({ isOpen: open });
    // Reset form when dialog closes
    if (!open) {
      set({
        formData: initialFormData,
        errors: {},
      });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    // Required fields validation
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.productName.trim()) newErrors.productName = "Product Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    if (!formData.initialQuantity.trim()) newErrors.initialQuantity = "Initial Quantity is required";
    if (!formData.reorderLevel.trim()) newErrors.reorderLevel = "Reorder Level is required";
    if (!formData.costPrice.trim()) newErrors.costPrice = "Cost Price is required";
    if (!formData.sellingPrice.trim()) newErrors.sellingPrice = "Selling Price is required";
    if (!formData.warehouse) newErrors.warehouse = "Warehouse is required";

    // Validate numeric fields
    if (formData.initialQuantity.trim()) {
      const qty = parseInt(formData.initialQuantity);
      if (isNaN(qty) || qty < 0) {
        newErrors.initialQuantity = "Initial Quantity must be a non-negative number";
      }
    }

    if (formData.reorderLevel.trim()) {
      const reorder = parseInt(formData.reorderLevel);
      if (isNaN(reorder) || reorder < 0) {
        newErrors.reorderLevel = "Reorder Level must be a non-negative number";
      }
    }

    if (formData.costPrice.trim()) {
      const cost = parseFloat(formData.costPrice);
      if (isNaN(cost) || cost <= 0) {
        newErrors.costPrice = "Cost Price must be a positive number";
      }
    }

    if (formData.sellingPrice.trim()) {
      const price = parseFloat(formData.sellingPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.sellingPrice = "Selling Price must be a positive number";
      }
    }

    // Validate selling price is greater than cost price
    if (formData.costPrice.trim() && formData.sellingPrice.trim()) {
      const cost = parseFloat(formData.costPrice);
      const price = parseFloat(formData.sellingPrice);
      if (!isNaN(cost) && !isNaN(price) && price < cost) {
        newErrors.sellingPrice = "Selling Price should be greater than or equal to Cost Price";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

