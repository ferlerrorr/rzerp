import { create } from "zustand";

export interface RoleFormData {
  name: string;
  description: string;
  permission_ids: number[];
}

interface RoleState {
  formData: RoleFormData;
  errors: Partial<Record<keyof Omit<RoleFormData, "permission_ids">, string>> & {
    permission_ids?: string;
  };
  isOpen: boolean;
  setFormData: (data: RoleFormData) => void;
  updateField: (field: keyof Omit<RoleFormData, "permission_ids">, value: string) => void;
  updatePermissionIds: (permissionIds: number[]) => void;
  setError: (field: keyof RoleFormData | "permission_ids", error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof RoleFormData | "permission_ids", string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof RoleFormData | "permission_ids") => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: RoleFormData = {
  name: "",
  description: "",
  permission_ids: [],
};

export const useRoleStore = create<RoleState>((set, get) => ({
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

  updatePermissionIds: (permissionIds) => {
    set((state) => ({
      formData: { ...state.formData, permission_ids: permissionIds },
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
    const newErrors: Partial<Record<keyof RoleFormData | "permission_ids", string>> = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Role name is required";
    
    // Name validation (no special characters, alphanumeric and hyphens/underscores)
    if (formData.name.trim()) {
      const nameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name = "Role name can only contain letters, numbers, hyphens, and underscores";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

