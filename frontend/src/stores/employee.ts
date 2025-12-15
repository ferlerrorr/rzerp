import { create } from "zustand";
import {
  getEmployees,
  getEmployee as getEmployeeAPI,
  createEmployee as createEmployeeAPI,
  updateEmployee as updateEmployeeAPI,
  deleteEmployee as deleteEmployeeAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

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

// Employee from API (snake_case)
export interface EmployeeFromAPI {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  civil_status: string;
  street_address: string;
  city: string;
  province: string;
  zip_code: string;
  sss_number: string;
  tin: string;
  phil_health_number: string;
  pag_ibig_number: string;
  department: string;
  position: string;
  employment_type: string;
  start_date: string;
  monthly_salary: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  created_at: string;
  updated_at: string;
}

// Employees data response
export interface EmployeesData {
  employees: EmployeeFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Employee for display (camelCase)
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: string;
  status: string;
}

interface EmployeeState {
  // Form state
  formData: EmployeeFormData;
  errors: Partial<Record<keyof EmployeeFormData, string>>;
  isOpen: boolean;

  // Data state
  employees: EmployeeFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;

  // Filters
  filters: {
    search?: string;
    department?: string;
    position?: string;
    employment_type?: string;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: EmployeeFormData) => void;
  updateField: (field: keyof EmployeeFormData, value: string) => void;
  setError: (field: keyof EmployeeFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof EmployeeFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof EmployeeFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchEmployees: () => Promise<void>;
  getEmployee: (id: number) => Promise<EmployeeFromAPI | null>;
  createEmployee: (data: EmployeeFormData) => Promise<EmployeeFromAPI | null>;
  updateEmployee: (
    id: number,
    data: EmployeeFormData
  ) => Promise<EmployeeFromAPI | null>;
  deleteEmployee: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<EmployeeState["filters"]>) => void;
  clearFilters: () => void;
  loadEmployeeForEdit: (employee: EmployeeFromAPI) => void;
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
  // Form state
  formData: initialFormData,
  errors: {},
  isOpen: false,

  // Data state
  employees: [],
  loading: false,
  error: null,
  pagination: null,

  // Filters
  filters: { per_page: 15 }, // Default per_page

  // Form actions
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
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
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

  // Data actions
  getEmployee: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getEmployeeAPI(id)) as ApiResponse<EmployeeFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load employee",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load employee",
      });
      return null;
    }
  },

  fetchEmployees: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.position) params.position = filters.position;
      if (filters.employment_type)
        params.employment_type = filters.employment_type;

      const response = await getEmployees(filters);

      if (response.success && response.data) {
        set({
          employees: response.data.employees,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load employees",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load employees",
      });
    }
  },

  createEmployee: async (data: EmployeeFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      const response = (await createEmployeeAPI(
        data
      )) as ApiResponse<EmployeeFromAPI>;

      if (response.success && response.data) {
        const newEmployee = response.data;
        // Add to employees list
        set((state) => ({
          employees: [newEmployee, ...state.employees],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchEmployees();
        return newEmployee;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

          // Map API errors (snake_case) to form fields (camelCase)
          const fieldMapping: Record<string, keyof EmployeeFormData> = {
            first_name: "firstName",
            middle_name: "middleName",
            last_name: "lastName",
            birth_date: "birthDate",
            civil_status: "civilStatus",
            street_address: "streetAddress",
            zip_code: "zipCode",
            sss_number: "sssNumber",
            phil_health_number: "philHealthNumber",
            pag_ibig_number: "pagIbigNumber",
            employment_type: "employmentType",
            start_date: "startDate",
            monthly_salary: "monthlySalary",
            emergency_contact_name: "emergencyContactName",
            emergency_contact_phone: "emergencyContactPhone",
            emergency_contact_relationship: "emergencyContactRelationship",
          };

          Object.entries(response.errors).forEach(([key, messages]) => {
            const formField =
              fieldMapping[key] || (key as keyof EmployeeFormData);
            if (Array.isArray(messages) && messages.length > 0) {
              apiErrors[formField] = messages[0];
            }
          });

          set({
            loading: false,
            errors: apiErrors,
            error: response.message || "Please fix the validation errors",
          });
        } else {
          set({
            loading: false,
            error: response.message || "Failed to create employee",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

        // Map API errors (snake_case) to form fields (camelCase)
        const fieldMapping: Record<string, keyof EmployeeFormData> = {
          first_name: "firstName",
          middle_name: "middleName",
          last_name: "lastName",
          birth_date: "birthDate",
          civil_status: "civilStatus",
          street_address: "streetAddress",
          zip_code: "zipCode",
          sss_number: "sssNumber",
          phil_health_number: "philHealthNumber",
          pag_ibig_number: "pagIbigNumber",
          employment_type: "employmentType",
          start_date: "startDate",
          monthly_salary: "monthlySalary",
          emergency_contact_name: "emergencyContactName",
          emergency_contact_phone: "emergencyContactPhone",
          emergency_contact_relationship: "emergencyContactRelationship",
        };

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          const formField =
            fieldMapping[key] || (key as keyof EmployeeFormData);
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[formField] = messages[0];
          }
        });

        set({
          loading: false,
          errors: apiErrors,
          error:
            err?.response?.data?.message || "Please fix the validation errors",
        });
      } else {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create employee",
        });
      }
      return null;
    }
  },

  updateEmployee: async (id: number, data: EmployeeFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      const response = (await updateEmployeeAPI(
        id,
        data
      )) as ApiResponse<EmployeeFromAPI>;

      if (response.success && response.data) {
        const updatedEmployee = response.data;
        // Update in employees list
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? updatedEmployee : emp
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedEmployee;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

          // Map API errors (snake_case) to form fields (camelCase)
          const fieldMapping: Record<string, keyof EmployeeFormData> = {
            first_name: "firstName",
            middle_name: "middleName",
            last_name: "lastName",
            birth_date: "birthDate",
            civil_status: "civilStatus",
            street_address: "streetAddress",
            zip_code: "zipCode",
            sss_number: "sssNumber",
            phil_health_number: "philHealthNumber",
            pag_ibig_number: "pagIbigNumber",
            employment_type: "employmentType",
            start_date: "startDate",
            monthly_salary: "monthlySalary",
            emergency_contact_name: "emergencyContactName",
            emergency_contact_phone: "emergencyContactPhone",
            emergency_contact_relationship: "emergencyContactRelationship",
          };

          Object.entries(response.errors).forEach(([key, messages]) => {
            const formField =
              fieldMapping[key] || (key as keyof EmployeeFormData);
            if (Array.isArray(messages) && messages.length > 0) {
              apiErrors[formField] = messages[0];
            }
          });

          set({
            loading: false,
            errors: apiErrors,
            error: response.message || "Please fix the validation errors",
          });
        } else {
          set({
            loading: false,
            error: response.message || "Failed to update employee",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

        // Map API errors (snake_case) to form fields (camelCase)
        const fieldMapping: Record<string, keyof EmployeeFormData> = {
          first_name: "firstName",
          middle_name: "middleName",
          last_name: "lastName",
          birth_date: "birthDate",
          civil_status: "civilStatus",
          street_address: "streetAddress",
          zip_code: "zipCode",
          sss_number: "sssNumber",
          phil_health_number: "philHealthNumber",
          pag_ibig_number: "pagIbigNumber",
          employment_type: "employmentType",
          start_date: "startDate",
          monthly_salary: "monthlySalary",
          emergency_contact_name: "emergencyContactName",
          emergency_contact_phone: "emergencyContactPhone",
          emergency_contact_relationship: "emergencyContactRelationship",
        };

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          const formField =
            fieldMapping[key] || (key as keyof EmployeeFormData);
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[formField] = messages[0];
          }
        });

        set({
          loading: false,
          errors: apiErrors,
          error:
            err?.response?.data?.message || "Please fix the validation errors",
        });
      } else {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update employee",
        });
      }
      return null;
    }
  },

  deleteEmployee: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteEmployeeAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from employees list
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchEmployees();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete employee",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete employee",
      });
      return false;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: { per_page: 15 } }); // Keep default per_page
  },

  // Load employee data into form for editing
  loadEmployeeForEdit: (employee: EmployeeFromAPI) => {
    const formData: EmployeeFormData = {
      firstName: employee.first_name,
      middleName: employee.middle_name || "",
      lastName: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      birthDate: employee.birth_date.split("T")[0], // Extract date part
      gender: employee.gender,
      civilStatus: employee.civil_status,
      streetAddress: employee.street_address,
      city: employee.city,
      province: employee.province,
      zipCode: employee.zip_code,
      sssNumber: employee.sss_number,
      tin: employee.tin,
      philHealthNumber: employee.phil_health_number,
      pagIbigNumber: employee.pag_ibig_number,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employment_type,
      startDate: employee.start_date.split("T")[0], // Extract date part
      monthlySalary: employee.monthly_salary,
      emergencyContactName: employee.emergency_contact_name,
      emergencyContactPhone: employee.emergency_contact_phone,
      emergencyContactRelationship: employee.emergency_contact_relationship,
    };
    set({ formData, errors: {} });
  },
}));
