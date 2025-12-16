import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(";").shift() || "");
  }
  return null;
}

/**
 * Delete a cookie by name
 * @param name Cookie name
 * @param path Cookie path (default: '/')
 * @param domain Cookie domain (optional)
 */
export function deleteCookie(
  name: string,
  path: string = "/",
  domain?: string
): void {
  if (typeof document === "undefined") return;

  // Delete for the specified domain if provided
  if (domain) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
  }

  // Always delete for current domain (works for localhost)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;

  // Also try without domain explicitly set (for localhost)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Lax;`;
}

/**
 * Check if an endpoint is an auth endpoint (to avoid retry loops)
 */
export function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh") ||
    url.includes("/csrf-cookie") ||
    url.includes("/sanctum/csrf-cookie")
  );
}
