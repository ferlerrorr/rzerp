import { create } from "zustand";
import {
  getPurchaseOrders,
  getPurchaseOrder as getPurchaseOrderAPI,
  createPurchaseOrder as createPurchaseOrderAPI,
  updatePurchaseOrder as updatePurchaseOrderAPI,
  updatePurchaseOrderStatus as updatePurchaseOrderStatusAPI,
  deletePurchaseOrder as deletePurchaseOrderAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { toast } from "sonner";

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
  vendorId?: number | null;
  requestedBy: string;
  orderDate: string;
  expectedDelivery: string;
  items: POItem[];
  notes: string;
}

// Purchase Order from API (snake_case)
export interface PurchaseOrderFromAPI {
  id: number;
  po_number: string;
  vendor_id: number | null;
  vendor_name: string;
  requested_by: string;
  order_date: string;
  expected_delivery: string;
  total_amount: string;
  status: "pending" | "approved" | "ordered" | "received";
  notes: string | null;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Purchase Orders data response
export interface PurchaseOrdersData {
  purchase_orders: PurchaseOrderFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface PurchaseOrderState {
  // Form state
  formData: PurchaseOrderFormData;
  errors: Partial<Record<keyof Omit<PurchaseOrderFormData, "items">, string>> & {
    items?: string;
  };
  isOpen: boolean;

  // Data state
  purchaseOrders: PurchaseOrderFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    status?: "pending" | "approved" | "ordered" | "received";
    vendor_id?: number;
    per_page?: number;
    page?: number;
  };

  // Form actions
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

  // Data actions
  fetchPurchaseOrders: () => Promise<void>;
  getPurchaseOrder: (id: number) => Promise<PurchaseOrderFromAPI | null>;
  createPurchaseOrder: (data: PurchaseOrderFormData) => Promise<PurchaseOrderFromAPI | null>;
  updatePurchaseOrder: (id: number, data: PurchaseOrderFormData) => Promise<PurchaseOrderFromAPI | null>;
  updateStatus: (id: number, status: "pending" | "approved" | "ordered" | "received") => Promise<boolean>;
  deletePurchaseOrder: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<PurchaseOrderState["filters"]>) => void;
  clearFilters: () => void;
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

  purchaseOrders: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
  filters: {
    per_page: 15,
  },

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
    // PO Number is optional - backend will auto-generate if not provided
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

  fetchPurchaseOrders: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getPurchaseOrders(filters)) as ApiResponse<PurchaseOrdersData>;

      if (response.success && response.data) {
        set({
          purchaseOrders: response.data.purchase_orders,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch purchase orders",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch purchase orders";
      set({ error: errorMessage, loading: false });
    }
  },

  getPurchaseOrder: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getPurchaseOrderAPI(id)) as ApiResponse<PurchaseOrderFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch purchase order",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch purchase order";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createPurchaseOrder: async (data: PurchaseOrderFormData) => {
    try {
      set({ loading: true, error: null });

      // Find vendor ID from vendor name
      const { useVendorStore } = await import("@/stores/vendor");
      const vendorStore = useVendorStore.getState();
      const vendor = vendorStore.vendors.find(v => v.company_name === data.vendor);

      // Transform camelCase to snake_case for API
      const apiData = {
        po_number: data.poNumber || null,
        vendor_id: vendor?.id || data.vendorId || null,
        vendor_name: data.vendor,
        requested_by: data.requestedBy,
        order_date: data.orderDate,
        expected_delivery: data.expectedDelivery,
        status: "pending",
        notes: data.notes || null,
        items: data.items.map(item => ({
          product_name: item.productName,
          quantity: parseInt(item.quantity) || 0,
          unit_price: parseFloat(item.unitPrice) || 0,
        })),
      };

      const response = (await createPurchaseOrderAPI(apiData)) as ApiResponse<PurchaseOrderFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Purchase order created successfully");
        // Refresh purchase orders list
        await get().fetchPurchaseOrders();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to create purchase order";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create purchase order";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  updatePurchaseOrder: async (id: number, data: PurchaseOrderFormData) => {
    try {
      set({ loading: true, error: null });

      // Find vendor ID from vendor name
      const { useVendorStore } = await import("@/stores/vendor");
      const vendorStore = useVendorStore.getState();
      const vendor = vendorStore.vendors.find(v => v.company_name === data.vendor);

      // Transform camelCase to snake_case for API
      const apiData = {
        po_number: data.poNumber || null,
        vendor_id: vendor?.id || data.vendorId || null,
        vendor_name: data.vendor,
        requested_by: data.requestedBy,
        order_date: data.orderDate,
        expected_delivery: data.expectedDelivery,
        notes: data.notes || null,
        items: data.items.map(item => ({
          product_name: item.productName,
          quantity: parseInt(item.quantity) || 0,
          unit_price: parseFloat(item.unitPrice) || 0,
        })),
      };

      const response = (await updatePurchaseOrderAPI(id, apiData)) as ApiResponse<PurchaseOrderFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Purchase order updated successfully");
        // Refresh purchase orders list
        await get().fetchPurchaseOrders();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to update purchase order";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update purchase order";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  updateStatus: async (id: number, status: "pending" | "approved" | "ordered" | "received") => {
    try {
      set({ loading: true, error: null });
      const response = (await updatePurchaseOrderStatusAPI(id, status)) as ApiResponse<PurchaseOrderFromAPI>;

      if (response.success) {
        set({ loading: false });
        toast.success("Purchase order status updated successfully");
        // Refresh purchase orders list
        await get().fetchPurchaseOrders();
        return true;
      } else {
        const errorMessage = response.message || "Failed to update status";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update status";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  },

  deletePurchaseOrder: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deletePurchaseOrderAPI(id)) as ApiResponse<null>;

      if (response.success) {
        set({ loading: false });
        toast.success("Purchase order deleted successfully");
        // Refresh purchase orders list
        await get().fetchPurchaseOrders();
        return true;
      } else {
        const errorMessage = response.message || "Failed to delete purchase order";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete purchase order";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        per_page: 15,
      },
    });
  },
}));

