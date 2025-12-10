import { create } from "zustand";

export interface VendorFormData {
  companyName: string;
  contactPerson: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  tin: string;
  paymentTerms: string;
  status: "Active" | "Inactive";
}

interface VendorState {
  formData: VendorFormData;
  errors: Partial<Record<keyof VendorFormData, string>>;
  isOpen: boolean;
  setFormData: (data: VendorFormData) => void;
  updateField: (field: keyof VendorFormData, value: string) => void;
  setError: (field: keyof VendorFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof VendorFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof VendorFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: VendorFormData = {
  companyName: "",
  contactPerson: "",
  category: "",
  email: "",
  phone: "",
  address: "",
  tin: "",
  paymentTerms: "",
  status: "Active",
};

export const useVendorStore = create<VendorState>((set, get) => ({
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
    const newErrors: Partial<Record<keyof VendorFormData, string>> = {};

    // Required fields validation
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact Person is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.tin.trim()) newErrors.tin = "TIN / Tax ID is required";
    if (!formData.paymentTerms) newErrors.paymentTerms = "Payment Terms is required";

    // Validate email format
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Invalid email format";
      }
    }

    // Validate phone format (basic validation for Philippine format)
    if (formData.phone.trim()) {
      const phoneRegex = /^\+?63\s?\d{3}\s?\d{3}\s?\d{4}$/;
      const cleanedPhone = formData.phone.trim().replace(/\s/g, "");
      if (!phoneRegex.test(cleanedPhone) && !/^\+63\d{10}$/.test(cleanedPhone)) {
        // Allow flexible format but must start with +63 or 63
        if (!cleanedPhone.startsWith("+63") && !cleanedPhone.startsWith("63")) {
          newErrors.phone = "Phone must start with +63 or 63";
        }
      }
    }

    // Validate TIN format (XXX-XXX-XXX-XXX)
    if (formData.tin.trim()) {
      const tinRegex = /^\d{3}-\d{3}-\d{3}-\d{3}$/;
      if (!tinRegex.test(formData.tin.trim())) {
        newErrors.tin = "TIN must be in format XXX-XXX-XXX-XXX";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

