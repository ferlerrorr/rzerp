import { useRbacStore } from "../stores/rbac";

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: string): boolean {
  return useRbacStore((state) => state.hasPermission(permission));
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  return useRbacStore((state) => state.hasAnyPermission(permissions));
}

/**
 * Hook to check if user has all of the specified permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  return useRbacStore((state) => state.hasAllPermissions(permissions));
}

