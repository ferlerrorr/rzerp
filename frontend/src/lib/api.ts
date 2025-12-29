import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth";
import { getCookie, isAuthEndpoint } from "./utils";

// Environment configuration
// Set to 'local' for local development or 'staging' for staging environment
// You can set VITE_ENVIRONMENT=staging in your .env file or vite.config.ts
const ENVIRONMENT: "local" | "staging" =
  (import.meta.env.VITE_ENVIRONMENT as "local" | "staging") || "local";

const API_CONFIG = {
  local: {
    baseURL: "",
  },
  staging: {
    baseURL: "https://rzerp-api.chysev.cloud",
  },
} as const;

/**
 * Fetch CSRF cookie from backend
 */
export async function fetchCsrfCookie(): Promise<void> {
  try {
    await axios.get("/csrf-cookie", {
      withCredentials: true,
    });
  } catch {
    // Try alternative endpoint
    try {
      await axios.get("/sanctum/csrf-cookie", {
        withCredentials: true,
      });
    } catch {
      // Silently fail - CSRF might not be required for all endpoints
    }
  }
}

/**
 * Axios instance with credentials and CSRF handling
 */
export const api = axios.create({
  baseURL: import.meta.env.DEV
    ? API_CONFIG[ENVIRONMENT]?.baseURL || ""
    : import.meta.env.VITE_API_HOST || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track refresh promise to prevent concurrent refresh requests
let refreshPromise: Promise<void> | null = null;

/**
 * Attempt to refresh the session
 * Uses a shared promise to prevent concurrent refresh requests
 * Only refreshes if session exists in database (backend validates this)
 */
async function attemptRefresh(): Promise<void> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Create a new refresh promise
  refreshPromise = (async () => {
    try {
      const response = await api.post("/api/auth/refresh");
      // If refresh succeeds, session exists in database and was refreshed
      if (response.data?.success) {
        return;
      }
      // If refresh returns non-success, session doesn't exist - logout
      useAuthStore.getState().logout();
      throw new Error("Refresh failed - session not found in database");
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - means session doesn't exist in database
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        // Session doesn't exist in database - force logout to clear cookies
        useAuthStore.getState().logout();
      }
      throw error;
    } finally {
      // Clear the promise after completion
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request interceptor: attach CSRF token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie("XSRF-TOKEN");
  if (token && !config.headers["X-XSRF-TOKEN"]) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

// Response interceptor: handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // CSRF token mismatch (419)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      await fetchCsrfCookie();
      return api(originalRequest);
    }

    // Unauthorized (401) – try refresh once only if session might exist
    // Skip if this is an auth endpoint (including refresh) or already retried
    // Backend /user endpoint validates session exists in database before returning 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh - backend will check if session exists in database
        // If session doesn't exist, refresh will return 401 and logout will be called
        await attemptRefresh();
        // If refresh succeeded, session exists in database - retry original request
        return api(originalRequest);
      } catch {
        // Refresh failed - session doesn't exist in database
        // Logout already handled in attemptRefresh (clears cookies and state)
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Employee API Functions
// ============================================================================

/**
 * Get list of employees with optional filters and pagination
 * GET /api/employees?per_page=15&search=...
 */
export async function getEmployees(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.department) params.department = filters.department;
  if (filters?.position) params.position = filters.position;
  if (filters?.employment_type)
    params.employment_type = filters.employment_type;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/employees", { params });
  return response.data;
}

/**
 * Get a single employee by ID
 * GET /api/employees/{id}
 */
export async function getEmployee(id: number) {
  const response = await api.get(`/api/employees/${id}`);
  return response.data;
}

/**
 * Create a new employee
 * POST /api/employees
 */
export async function createEmployee(data: Record<string, any>) {
  const response = await api.post("/api/employees", data);
  return response.data;
}

/**
 * Update an employee
 * PUT /api/employees/{id}
 */
export async function updateEmployee(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/employees/${id}`, data);
  return response.data;
}

/**
 * Delete an employee
 * DELETE /api/employees/{id}
 */
export async function deleteEmployee(id: number) {
  const response = await api.delete(`/api/employees/${id}`);
  return response.data;
}

// ============================================================================
// Department API Functions
// ============================================================================

/**
 * Get list of departments with optional filters and pagination
 * GET /api/departments?per_page=15&search=...
 */
export async function getDepartments(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/departments", { params });
  return response.data;
}

/**
 * Get a single department by ID
 * GET /api/departments/{id}
 */
export async function getDepartment(id: number) {
  const response = await api.get(`/api/departments/${id}`);
  return response.data;
}

/**
 * Create a new department
 * POST /api/departments
 */
export async function createDepartment(data: Record<string, any>) {
  const response = await api.post("/api/departments", data);
  return response.data;
}

/**
 * Update a department
 * PUT /api/departments/{id}
 */
export async function updateDepartment(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/departments/${id}`, data);
  return response.data;
}

/**
 * Delete a department
 * DELETE /api/departments/{id}
 */
export async function deleteDepartment(id: number) {
  const response = await api.delete(`/api/departments/${id}`);
  return response.data;
}

// ============================================================================
// Position API Functions
// ============================================================================

/**
 * Get list of positions with optional filters and pagination
 * GET /api/positions?per_page=15&search=...
 */
export async function getPositions(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.department_id) params.department_id = filters.department_id;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/positions", { params });
  return response.data;
}

/**
 * Get a single position by ID
 * GET /api/positions/{id}
 */
export async function getPosition(id: number) {
  const response = await api.get(`/api/positions/${id}`);
  return response.data;
}

/**
 * Create a new position
 * POST /api/positions
 */
export async function createPosition(data: Record<string, any>) {
  const response = await api.post("/api/positions", data);
  return response.data;
}

/**
 * Update a position
 * PUT /api/positions/{id}
 */
export async function updatePosition(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/positions/${id}`, data);
  return response.data;
}

/**
 * Delete a position
 * DELETE /api/positions/{id}
 */
export async function deletePosition(id: number) {
  const response = await api.delete(`/api/positions/${id}`);
  return response.data;
}

// ============================================================================
// Account API Functions
// ============================================================================

/**
 * Get list of accounts with optional filters and pagination
 * GET /api/accounts?per_page=15&search=...
 */
export async function getAccounts(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.account_type) params.account_type = filters.account_type;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/accounts", { params });
  return response.data;
}

/**
 * Get a single account by ID
 * GET /api/accounts/{id}
 */
export async function getAccount(id: number) {
  const response = await api.get(`/api/accounts/${id}`);
  return response.data;
}

/**
 * Create a new account
 * POST /api/accounts
 */
export async function createAccount(data: Record<string, any>) {
  const response = await api.post("/api/accounts", data);
  return response.data;
}

/**
 * Update an account
 * PUT /api/accounts/{id}
 */
export async function updateAccount(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/accounts/${id}`, data);
  return response.data;
}

/**
 * Delete an account
 * DELETE /api/accounts/{id}
 */
export async function deleteAccount(id: number) {
  const response = await api.delete(`/api/accounts/${id}`);
  return response.data;
}

// ============================================================================
// Journal Entry API Functions
// ============================================================================

/**
 * Get list of journal entries with optional filters and pagination
 * GET /api/journal-entries?per_page=15&search=...
 */
export async function getJournalEntries(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/journal-entries", { params });
  return response.data;
}

/**
 * Get a single journal entry by ID
 * GET /api/journal-entries/{id}
 */
export async function getJournalEntry(id: number) {
  const response = await api.get(`/api/journal-entries/${id}`);
  return response.data;
}

/**
 * Create a new journal entry
 * POST /api/journal-entries
 */
export async function createJournalEntry(data: Record<string, any>) {
  const response = await api.post("/api/journal-entries", data);
  return response.data;
}

/**
 * Update a journal entry
 * PUT /api/journal-entries/{id}
 */
export async function updateJournalEntry(
  id: number,
  data: Record<string, any>
) {
  const response = await api.put(`/api/journal-entries/${id}`, data);
  return response.data;
}

/**
 * Delete a journal entry
 * DELETE /api/journal-entries/{id}
 */
export async function deleteJournalEntry(id: number) {
  const response = await api.delete(`/api/journal-entries/${id}`);
  return response.data;
}

/**
 * Post a journal entry (change status from Draft to Posted)
 * POST /api/journal-entries/{id}/post
 */
export async function postJournalEntry(id: number) {
  const response = await api.post(`/api/journal-entries/${id}/post`);
  return response.data;
}

// ============================================================================
// Budget API Functions
// ============================================================================

/**
 * Get list of budgets with optional filters and pagination
 * GET /api/budgets?per_page=15&search=...
 */
export async function getBudgets(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.period) params.period = filters.period;
  if (filters?.category) params.category = filters.category;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/budgets", { params });
  return response.data;
}

/**
 * Get a single budget by ID
 * GET /api/budgets/{id}
 */
export async function getBudget(id: number) {
  const response = await api.get(`/api/budgets/${id}`);
  return response.data;
}

/**
 * Create a new budget
 * POST /api/budgets
 */
export async function createBudget(data: Record<string, any>) {
  const response = await api.post("/api/budgets", data);
  return response.data;
}

/**
 * Update a budget
 * PUT /api/budgets/{id}
 */
export async function updateBudget(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/budgets/${id}`, data);
  return response.data;
}

/**
 * Delete a budget
 * DELETE /api/budgets/{id}
 */
export async function deleteBudget(id: number) {
  const response = await api.delete(`/api/budgets/${id}`);
  return response.data;
}
