import { create } from "zustand";

export interface POItem {
  id: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  subtotal: number;
}

export interface PurchaseOrderFormData {
  poNumber: string;
  vendor: string;
  requestedBy: string;
  orderDate: string;
  expectedDelivery: string;
  items: POItem[];
  notes: string;
}

interface PurchaseOrderState {
  formData: PurchaseOrderFormData;
  errors: Partial<Record<keyof Omit<PurchaseOrderFormData, "items">, string>> & {
    items?: string;
  };
  isOpen: boolean;
  setFormData: (data: PurchaseOrderFormData) => void;
  updateField: (field: keyof Omit<PurchaseOrderFormData, "items">, value: string) => void;
  addItem: () => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, field: keyof POItem, value: string | number) => void;
  setError: (field: keyof PurchaseOrderFormData | "items", error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof PurchaseOrderFormData | "items", string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof PurchaseOrderFormData | "items") => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: PurchaseOrderFormData = {
  poNumber: "",
  vendor: "",
  requestedBy: "",
  orderDate: "",
  expectedDelivery: "",
  items: [],
  notes: "",
};

export const usePurchaseOrderStore = create<PurchaseOrderState>((set, get) => ({
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

  addItem: () => {
    const newItem: POItem = {
      id: Date.now().toString(),
      productName: "",
      quantity: "",
      unitPrice: "",
      subtotal: 0,
    };
    set((state) => ({
      formData: {
        ...state.formData,
        items: [...state.formData.items, newItem],
      },
    }));
  },

  removeItem: (itemId) => {
    set((state) => ({
      formData: {
        ...state.formData,
        items: state.formData.items.filter((item) => item.id !== itemId),
      },
    }));
  },

  updateItem: (itemId, field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        items: state.formData.items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, [field]: value };
            // Calculate subtotal if quantity or unitPrice changed
            if (field === "quantity" || field === "unitPrice") {
              const qty = field === "quantity" ? (value as number) : parseFloat(item.quantity) || 0;
              const price = field === "unitPrice" ? (value as number) : parseFloat(item.unitPrice) || 0;
              updatedItem.subtotal = qty * price;
            }
            return updatedItem;
          }
          return item;
        }),
      },
    }));
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
    const newErrors: Partial<Record<keyof PurchaseOrderFormData | "items", string>> = {};

    // Required fields validation
    if (!formData.poNumber.trim()) newErrors.poNumber = "PO Number is required";
    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.requestedBy.trim()) newErrors.requestedBy = "Requested By is required";
    if (!formData.orderDate.trim()) newErrors.orderDate = "Order Date is required";
    if (!formData.expectedDelivery.trim()) newErrors.expectedDelivery = "Expected Delivery is required";

    // Validate items
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productName.trim()) {
          newErrors.items = `Item ${index + 1}: Product Name is required`;
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          newErrors.items = `Item ${index + 1}: Quantity must be greater than 0`;
        }
        if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
          newErrors.items = `Item ${index + 1}: Unit Price must be greater than 0`;
        }
      });
    }

    // Validate expected delivery is after order date
    if (formData.orderDate && formData.expectedDelivery) {
      const orderDate = new Date(formData.orderDate);
      const expectedDelivery = new Date(formData.expectedDelivery);
      if (expectedDelivery < orderDate) {
        newErrors.expectedDelivery = "Expected Delivery must be after Order Date";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

