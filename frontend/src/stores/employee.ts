import { create } from "zustand";

export interface EmployeeFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  streetAddress: string;
  city: string;
  province: string;
  zipCode: string;
  // Government IDs
  sssNumber: string;
  tin: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  // Employment Details
  department: string;
  position: string;
  employmentType: string;
  startDate: string;
  monthlySalary: string;
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

interface EmployeeState {
  formData: EmployeeFormData;
  errors: Partial<Record<keyof EmployeeFormData, string>>;
  isOpen: boolean;
  setFormData: (data: EmployeeFormData) => void;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
  setError: (field: keyof EmployeeFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof EmployeeFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof EmployeeFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: EmployeeFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  gender: "",
  civilStatus: "",
  streetAddress: "",
  city: "",
  province: "",
  zipCode: "",
  sssNumber: "",
  tin: "",
  philHealthNumber: "",
  pagIbigNumber: "",
  department: "",
  position: "",
  employmentType: "",
  startDate: "",
  monthlySalary: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
};

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
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
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    // Required fields validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.birthDate) newErrors.birthDate = "Birth Date is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.civilStatus)
      newErrors.civilStatus = "Civil Status is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip Code is required";
    if (!formData.sssNumber.trim())
      newErrors.sssNumber = "SSS Number is required";
    if (!formData.tin.trim()) newErrors.tin = "TIN is required";
    if (!formData.philHealthNumber.trim())
      newErrors.philHealthNumber = "PhilHealth Number is required";
    if (!formData.pagIbigNumber.trim())
      newErrors.pagIbigNumber = "Pag-IBIG Number is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.employmentType)
      newErrors.employmentType = "Employment Type is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.monthlySalary.trim())
      newErrors.monthlySalary = "Monthly Salary is required";
    if (!formData.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency Contact Name is required";
    if (!formData.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency Contact Phone is required";
    if (!formData.emergencyContactRelationship.trim())
      newErrors.emergencyContactRelationship = "Relationship is required";

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

