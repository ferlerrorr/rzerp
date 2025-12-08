// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// User type (example - adjust based on your backend)
export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

