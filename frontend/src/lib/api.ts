import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth";
import { getCookie, isAuthEndpoint } from "./utils";

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
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_HOST || "",
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
      // If refresh succeeds, return
      if (response.data?.success) {
        return;
      }
      // If refresh returns non-success, logout
      useAuthStore.getState().logout();
      throw new Error("Refresh failed");
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - other errors might be network issues
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
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

    // Unauthorized (401) – try refresh once
    // Skip if this is an auth endpoint (including refresh) or already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        // Use shared refresh promise to prevent concurrent refresh requests
        await attemptRefresh();
        return api(originalRequest);
      } catch {
        // Refresh failed, logout already handled in attemptRefresh
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
