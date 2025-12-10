import { create } from "zustand";

export interface WarehouseFormData {
  name: string;
  location: string;
  manager: string;
  capacity: string;
  status: "Active" | "Inactive";
}

interface WarehouseState {
  formData: WarehouseFormData;
  errors: Partial<Record<keyof WarehouseFormData, string>>;
  isOpen: boolean;
  setFormData: (data: WarehouseFormData) => void;
  updateField: (field: keyof WarehouseFormData, value: string) => void;
  setError: (field: keyof WarehouseFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof WarehouseFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof WarehouseFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: WarehouseFormData = {
  name: "",
  location: "",
  manager: "",
  capacity: "",
  status: "Active",
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
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
    const newErrors: Partial<Record<keyof WarehouseFormData, string>> = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Warehouse Name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.manager.trim()) newErrors.manager = "Manager is required";
    if (!formData.capacity.trim()) newErrors.capacity = "Capacity is required";

    // Validate capacity format (should be numeric with optional "units" suffix)
    if (formData.capacity.trim()) {
      const capacityValue = formData.capacity.replace(/[,\s]units?/gi, "").trim();
      const capacityNum = parseInt(capacityValue);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        newErrors.capacity = "Capacity must be a positive number";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

