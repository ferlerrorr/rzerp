import { create } from "zustand";
import { NestedPermissions } from "../lib/types";

interface RbacState {
  roles: string[];
  permissions: string[];
  nestedPermissions: NestedPermissions | null;
  setRoles: (roles: string[]) => void;
  setPermissions: (perms: string[] | NestedPermissions) => void;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
  isSuperAdmin: () => boolean;
}

/**
 * Extract flat permissions list from nested structure
 */
function extractFlatPermissions(nested: NestedPermissions): string[] {
  const flat: string[] = [];
  
  if (nested.user_management) {
    if (nested.user_management.roles) {
      flat.push(...nested.user_management.roles);
    }
    if (nested.user_management.users) {
      flat.push(...nested.user_management.users);
    }
  }
  
  if (nested.hris) {
    if (nested.hris.leaves) flat.push(...nested.hris.leaves);
    if (nested.hris.payroll) flat.push(...nested.hris.payroll);
    if (nested.hris.reports) flat.push(...nested.hris.reports);
    if (nested.hris.holidays) flat.push(...nested.hris.holidays);
    if (nested.hris.employees) flat.push(...nested.hris.employees);
    if (nested.hris.attendance) flat.push(...nested.hris.attendance);
    if (nested.hris.reference_data) flat.push(...nested.hris.reference_data);
    if (nested.hris.reimbursements) flat.push(...nested.hris.reimbursements);
  }
  
  if (nested.settings?.system) {
    flat.push(...nested.settings.system);
  }
  
  return flat;
}

export const useRbacStore = create<RbacState>((set, get) => ({
  roles: [],
  permissions: [],
  nestedPermissions: null,

  setRoles: (roles) => set({ roles }),

  setPermissions: (perms) => {
    // Check if it's nested structure
    if (typeof perms === "object" && perms !== null && !Array.isArray(perms)) {
      const nested = perms as NestedPermissions;
      const flat = extractFlatPermissions(nested);
      set({ 
        permissions: flat,
        nestedPermissions: nested 
      });
    } else {
      // It's a flat array
      set({ 
        permissions: perms as string[],
        nestedPermissions: null 
      });
    }
  },

  isSuperAdmin: () => {
    return get().roles.includes("super-admin");
  },

  hasPermission: (perm) => {
    // Super-admin has all permissions
    if (get().isSuperAdmin()) {
      return true;
    }
    return get().permissions.includes(perm);
  },

  hasAnyPermission: (perms) => {
    // Super-admin has all permissions
    if (get().isSuperAdmin()) {
      return true;
    }
    return perms.some((p) => get().permissions.includes(p));
  },

  hasAllPermissions: (perms) => {
    // Super-admin has all permissions
    if (get().isSuperAdmin()) {
      return true;
    }
    return perms.every((p) => get().permissions.includes(p));
  },
}));

