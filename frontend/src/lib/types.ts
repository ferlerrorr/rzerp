// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Permission structure types
export interface NestedPermissions {
  user_management?: {
    roles?: string[];
    users?: string[];
  };
  hris?: {
    leaves?: string[];
    payroll?: string[];
    reports?: string[];
    holidays?: string[];
    employees?: string[];
    attendance?: string[];
    reference_data?: string[];
    reimbursements?: string[];
  };
  settings?: {
    system?: string[];
  };
}

// User type (example - adjust based on your backend)
export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: NestedPermissions | string[];
}

