import { create } from "zustand";

interface RbacState {
  roles: string[];
  permissions: string[];
  setRoles: (roles: string[]) => void;
  setPermissions: (perms: string[]) => void;
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
  isSuperAdmin: () => boolean;
}

export const useRbacStore = create<RbacState>((set, get) => ({
  roles: [],
  permissions: [],

  setRoles: (roles) => set({ roles }),

  setPermissions: (perms) => set({ permissions: perms }),

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

