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
// Track failed refresh attempts to prevent infinite loops
let refreshFailed = false;

/**
 * Attempt to refresh the session
 * Uses a shared promise to prevent concurrent refresh requests
 * Only refreshes if session exists in database (backend validates this)
 */
async function attemptRefresh(): Promise<void> {
  // If refresh already failed, don't try again
  if (refreshFailed) {
    throw new Error("Refresh already failed - session invalid");
  }

  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Create a new refresh promise
  refreshPromise = (async () => {
    try {
      const response = await api.post("/api/auth/refresh");
      // If refresh succeeds, check if it actually validated the session
      if (response.data?.success) {
        // Reset failed flag on success
        refreshFailed = false;
        return;
      }
      // If refresh returns non-success, session doesn't exist - logout
      refreshFailed = true;
      useAuthStore.getState().logout();
      throw new Error("Refresh failed - session not found in database");
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - means session doesn't exist in database
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        // Session doesn't exist in database - force logout to clear cookies
        refreshFailed = true;
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
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Initialize retry count
    if (originalRequest._retryCount === undefined) {
      originalRequest._retryCount = 0;
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
      originalRequest._retryCount < 1 && // Only retry once
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      try {
        // Attempt to refresh - backend will check if session exists in database
        // If session doesn't exist, refresh will return 401 and logout will be called
        await attemptRefresh();
        // If refresh succeeded, session exists in database - retry original request
        try {
          const retryResponse = await api(originalRequest);
          return retryResponse;
        } catch (retryError) {
          // If retry still fails with 401, mark refresh as failed to prevent further attempts
          const retryAxiosError = retryError as AxiosError;
          if (retryAxiosError.response?.status === 401) {
            refreshFailed = true;
            useAuthStore.getState().logout();
          }
          return Promise.reject(retryError);
        }
      } catch (refreshError) {
        // Refresh failed - session doesn't exist in database
        // Logout already handled in attemptRefresh (clears cookies and state)
        refreshFailed = true;
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

// ============================================================================
// Invoice API Functions
// ============================================================================

/**
 * Get list of invoices with optional filters and pagination
 * GET /api/invoices?per_page=15&search=...
 */
export async function getInvoices(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.vendor_id) params.vendor_id = filters.vendor_id;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/invoices", { params });
  return response.data;
}

/**
 * Get a single invoice by ID
 * GET /api/invoices/{id}
 */
export async function getInvoice(id: number) {
  const response = await api.get(`/api/invoices/${id}`);
  return response.data;
}

/**
 * Create a new invoice
 * POST /api/invoices
 */
export async function createInvoice(data: Record<string, any>) {
  const response = await api.post("/api/invoices", data);
  return response.data;
}

/**
 * Update an invoice
 * PUT /api/invoices/{id}
 */
export async function updateInvoice(
  id: number,
  data: Record<string, any>
) {
  const response = await api.put(`/api/invoices/${id}`, data);
  return response.data;
}

/**
 * Delete an invoice
 * DELETE /api/invoices/{id}
 */
export async function deleteInvoice(id: number) {
  const response = await api.delete(`/api/invoices/${id}`);
  return response.data;
}

/**
 * Approve an invoice
 * POST /api/invoices/{id}/approve
 */
export async function approveInvoice(id: number) {
  const response = await api.post(`/api/invoices/${id}/approve`);
  return response.data;
}

/**
 * Mark invoice as paid
 * POST /api/invoices/{id}/pay
 */
export async function payInvoice(id: number) {
  const response = await api.post(`/api/invoices/${id}/pay`);
  return response.data;
}

// ============================================================================
// Vendor API Functions
// ============================================================================

/**
 * Get list of vendors with optional filters and pagination
 * GET /api/vendors?per_page=100&search=...
 */
export async function getVendors(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 100;

  const response = await api.get("/api/vendors", { params });
  return response.data;
}

/**
 * Get a single vendor by ID
 * GET /api/vendors/{id}
 */
export async function getVendor(id: number) {
  const response = await api.get(`/api/vendors/${id}`);
  return response.data;
}

/**
 * Create a new vendor
 * POST /api/vendors
 */
export async function createVendor(data: Record<string, any>) {
  const response = await api.post("/api/vendors", data);
  return response.data;
}

/**
 * Update a vendor
 * PUT /api/vendors/{id}
 */
export async function updateVendor(
  id: number,
  data: Record<string, any>
) {
  const response = await api.put(`/api/vendors/${id}`, data);
  return response.data;
}

/**
 * Delete a vendor
 * DELETE /api/vendors/{id}
 */
export async function deleteVendor(id: number) {
  const response = await api.delete(`/api/vendors/${id}`);
  return response.data;
}

// ============================================================================
// Customer API Functions
// ============================================================================

/**
 * Get list of customers with optional filters and pagination
 * GET /api/customers?per_page=100&search=...
 */
export async function getCustomers(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 100;

  const response = await api.get("/api/customers", { params });
  return response.data;
}

/**
 * Get a single customer by ID
 * GET /api/customers/{id}
 */
export async function getCustomer(id: number) {
  const response = await api.get(`/api/customers/${id}`);
  return response.data;
}

// ============================================================================
// Receivable Invoice API Functions
// ============================================================================

/**
 * Get list of receivable invoices with optional filters and pagination
 * GET /api/receivable-invoices?per_page=15&search=...
 */
export async function getReceivableInvoices(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.customer_id) params.customer_id = filters.customer_id;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/receivable-invoices", { params });
  return response.data;
}

/**
 * Get a single receivable invoice by ID
 * GET /api/receivable-invoices/{id}
 */
export async function getReceivableInvoice(id: number) {
  const response = await api.get(`/api/receivable-invoices/${id}`);
  return response.data;
}

/**
 * Create a new receivable invoice
 * POST /api/receivable-invoices
 */
export async function createReceivableInvoice(data: Record<string, any>) {
  const response = await api.post("/api/receivable-invoices", data);
  return response.data;
}

/**
 * Update a receivable invoice
 * PUT /api/receivable-invoices/{id}
 */
export async function updateReceivableInvoice(
  id: number,
  data: Record<string, any>
) {
  const response = await api.put(`/api/receivable-invoices/${id}`, data);
  return response.data;
}

/**
 * Delete a receivable invoice
 * DELETE /api/receivable-invoices/{id}
 */
export async function deleteReceivableInvoice(id: number) {
  const response = await api.delete(`/api/receivable-invoices/${id}`);
  return response.data;
}

// ============================================================================
// Payment API Functions
// ============================================================================

/**
 * Record a payment for a receivable invoice
 * POST /api/payments
 */
export async function recordPayment(data: Record<string, any>) {
  const response = await api.post("/api/payments", data);
  return response.data;
}

/**
 * Get payments for a receivable invoice
 * GET /api/payments/invoice/{invoiceId}
 */
export async function getPaymentsByInvoice(invoiceId: number) {
  const response = await api.get(`/api/payments/invoice/${invoiceId}`);
  return response.data;
}

// ============================================================================
// Purchase Order API Functions
// ============================================================================

/**
 * Get list of purchase orders with optional filters and pagination
 * GET /api/purchase-orders?per_page=15&search=...
 */
export async function getPurchaseOrders(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};

  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.vendor_id) params.vendor_id = filters.vendor_id;

  // Default per_page if not provided
  if (!params.per_page) params.per_page = 15;

  const response = await api.get("/api/purchase-orders", { params });
  return response.data;
}

/**
 * Get a single purchase order by ID
 * GET /api/purchase-orders/{id}
 */
export async function getPurchaseOrder(id: number) {
  const response = await api.get(`/api/purchase-orders/${id}`);
  return response.data;
}

/**
 * Create a new purchase order
 * POST /api/purchase-orders
 */
export async function createPurchaseOrder(data: Record<string, any>) {
  const response = await api.post("/api/purchase-orders", data);
  return response.data;
}

/**
 * Update a purchase order
 * PUT /api/purchase-orders/{id}
 */
export async function updatePurchaseOrder(
  id: number,
  data: Record<string, any>
) {
  const response = await api.put(`/api/purchase-orders/${id}`, data);
  return response.data;
}

/**
 * Update purchase order status
 * PATCH /api/purchase-orders/{id}/status
 */
export async function updatePurchaseOrderStatus(
  id: number,
  status: string
) {
  const response = await api.patch(`/api/purchase-orders/${id}/status`, { status });
  return response.data;
}

/**
 * Delete a purchase order
 * DELETE /api/purchase-orders/{id}
 */
export async function deletePurchaseOrder(id: number) {
  const response = await api.delete(`/api/purchase-orders/${id}`);
  return response.data;
}

// ============================================================================
// Holiday API Functions
// ============================================================================

export async function getHolidays(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.type) params.type = filters.type;
  if (filters?.is_active !== undefined) params.is_active = filters.is_active;
  if (filters?.year) params.year = filters.year;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/holidays", { params });
  return response.data;
}

export async function getHoliday(id: number) {
  const response = await api.get(`/api/holidays/${id}`);
  return response.data;
}

export async function createHoliday(data: Record<string, any>) {
  const response = await api.post("/api/holidays", data);
  return response.data;
}

export async function updateHoliday(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/holidays/${id}`, data);
  return response.data;
}

export async function deleteHoliday(id: number) {
  const response = await api.delete(`/api/holidays/${id}`);
  return response.data;
}

// ============================================================================
// Leave Type API Functions
// ============================================================================

export async function getLeaveTypes(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (filters?.is_active !== undefined) params.is_active = filters.is_active;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/leave-types", { params });
  return response.data;
}

export async function getLeaveType(id: number) {
  const response = await api.get(`/api/leave-types/${id}`);
  return response.data;
}

export async function createLeaveType(data: Record<string, any>) {
  const response = await api.post("/api/leave-types", data);
  return response.data;
}

export async function updateLeaveType(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/leave-types/${id}`, data);
  return response.data;
}

export async function deleteLeaveType(id: number) {
  const response = await api.delete(`/api/leave-types/${id}`);
  return response.data;
}

// ============================================================================
// Leave Request API Functions
// ============================================================================

export async function getLeaveRequests(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.employee_id) params.employee_id = filters.employee_id;
  if (filters?.status) params.status = filters.status;
  if (filters?.leave_type_id) params.leave_type_id = filters.leave_type_id;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/leave-requests", { params });
  return response.data;
}

export async function createLeaveRequest(data: Record<string, any>) {
  const response = await api.post("/api/leave-requests", data);
  return response.data;
}

export async function approveLeaveRequest(id: number) {
  const response = await api.post(`/api/leave-requests/${id}/approve`);
  return response.data;
}

export async function rejectLeaveRequest(id: number, reason: string) {
  const response = await api.post(`/api/leave-requests/${id}/reject`, { reason });
  return response.data;
}

// ============================================================================
// Leave Balance API Functions
// ============================================================================

export async function getLeaveBalances(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.employee_id) params.employee_id = filters.employee_id;
  if (filters?.year) params.year = filters.year;
  const response = await api.get("/api/leave-balances", { params });
  return response.data;
}

// ============================================================================
// Attendance API Functions
// ============================================================================

export async function getAttendances(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.employee_id) params.employee_id = filters.employee_id;
  if (filters?.date) params.date = filters.date;
  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;
  if (filters?.status) params.status = filters.status;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/attendances", { params });
  return response.data;
}

export async function timeIn(data: Record<string, any>) {
  const response = await api.post("/api/attendances/time-in", data);
  return response.data;
}

export async function timeOut(id: number, data: Record<string, any>) {
  const response = await api.post(`/api/attendances/${id}/time-out`, data);
  return response.data;
}

// ============================================================================
// Payroll Period API Functions
// ============================================================================

export async function getPayrollPeriods(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.status) params.status = filters.status;
  if (filters?.type) params.type = filters.type;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/payroll-periods", { params });
  return response.data;
}

export async function createPayrollPeriod(data: Record<string, any>) {
  const response = await api.post("/api/payroll-periods", data);
  return response.data;
}

// ============================================================================
// Payroll Run API Functions
// ============================================================================

export async function getPayrollRuns(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.payroll_period_id) params.payroll_period_id = filters.payroll_period_id;
  if (filters?.status) params.status = filters.status;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/payroll-runs", { params });
  return response.data;
}

export async function createPayrollRun(data: Record<string, any>) {
  const response = await api.post("/api/payroll-runs", data);
  return response.data;
}

export async function processPayrollRun(id: number) {
  const response = await api.post(`/api/payroll-runs/${id}/process`);
  return response.data;
}

export async function approvePayrollRun(id: number) {
  const response = await api.post(`/api/payroll-runs/${id}/approve`);
  return response.data;
}

export async function getPayrollRunEntries(id: number) {
  const response = await api.get(`/api/payroll-runs/${id}/entries`);
  return response.data;
}

// ============================================================================
// Payroll Entry API Functions
// ============================================================================

export async function getPayrollEntries(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.payroll_run_id) params.payroll_run_id = filters.payroll_run_id;
  const response = await api.get("/api/payroll-entries", { params });
  return response.data;
}

// ============================================================================
// Salary Component API Functions
// ============================================================================

export async function getSalaryComponents(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.employee_id) params.employee_id = filters.employee_id;
  const response = await api.get("/api/salary-components", { params });
  return response.data;
}

export async function createSalaryComponent(data: Record<string, any>) {
  const response = await api.post("/api/salary-components", data);
  return response.data;
}

export async function updateSalaryComponent(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/salary-components/${id}`, data);
  return response.data;
}

export async function deleteSalaryComponent(id: number) {
  const response = await api.delete(`/api/salary-components/${id}`);
  return response.data;
}

// ============================================================================
// Deduction API Functions
// ============================================================================

export async function getDeductions(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.employee_id) params.employee_id = filters.employee_id;
  const response = await api.get("/api/deductions", { params });
  return response.data;
}

export async function createDeduction(data: Record<string, any>) {
  const response = await api.post("/api/deductions", data);
  return response.data;
}

export async function updateDeduction(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/deductions/${id}`, data);
  return response.data;
}

export async function deleteDeduction(id: number) {
  const response = await api.delete(`/api/deductions/${id}`);
  return response.data;
}

// ============================================================================
// Setting API Functions
// ============================================================================

export async function getSettings() {
  const response = await api.get("/api/settings");
  return response.data;
}

export async function getSetting(key: string) {
  const response = await api.get(`/api/settings/${key}`);
  return response.data;
}

export async function setSetting(data: Record<string, any>) {
  const response = await api.post("/api/settings", data);
  return response.data;
}

export async function updateSetting(key: string, data: Record<string, any>) {
  const response = await api.put(`/api/settings/${key}`, data);
  return response.data;
}

export async function deleteSetting(key: string) {
  const response = await api.delete(`/api/settings/${key}`);
  return response.data;
}

// ============================================================================
// Notification API Functions
// ============================================================================

export async function getNotifications(filters?: Record<string, any>) {
  const params: Record<string, string | number | boolean> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.is_read !== undefined) params.is_read = filters.is_read;
  if (filters?.type) params.type = filters.type;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/notifications", { params });
  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await api.get("/api/notifications/unread-count");
  return response.data;
}

export async function markNotificationAsRead(id: number) {
  const response = await api.post(`/api/notifications/${id}/mark-as-read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.post("/api/notifications/mark-all-as-read");
  return response.data;
}

export async function deleteNotification(id: number) {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
}

// ============================================================================
// Employment Type API Functions
// ============================================================================

export async function getEmploymentTypes(filters?: Record<string, any>) {
  const params: Record<string, string | number> = {};
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.page) params.page = filters.page;
  if (filters?.search) params.search = filters.search;
  if (!params.per_page) params.per_page = 15;
  const response = await api.get("/api/employment-types", { params });
  return response.data;
}

export async function getEmploymentType(id: number) {
  const response = await api.get(`/api/employment-types/${id}`);
  return response.data;
}

export async function createEmploymentType(data: Record<string, any>) {
  const response = await api.post("/api/employment-types", data);
  return response.data;
}

export async function updateEmploymentType(id: number, data: Record<string, any>) {
  const response = await api.put(`/api/employment-types/${id}`, data);
  return response.data;
}

export async function deleteEmploymentType(id: number) {
  const response = await api.delete(`/api/employment-types/${id}`);
  return response.data;
}
