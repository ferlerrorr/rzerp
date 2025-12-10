import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { AppButtons } from "@/components/app-Buttons";
import { RoleCard } from "@/components/card/roleCard";
import { AddRoleDialog } from "@/components/add-role-dialog";
import { RoleFormData } from "@/stores/role";
import { Shield } from "lucide-react";

interface RoleFromAPI {
  id: number;
  name: string;
  permissions: string[]; // Array of permission names
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
}

interface UsersData {
  users: User[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface RoleForDisplay {
  id: string;
  roleName: string;
  description: string;
  userCount: number;
  permissionCount: number;
  createdDate: string;
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray"
    | "red";
}

const iconBgColorOptions: Array<
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "indigo"
  | "teal"
  | "yellow"
  | "gray"
  | "red"
> = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "indigo",
  "teal",
  "yellow",
  "gray",
  "red",
];

interface Permission {
  id: number;
  name: string;
}

export function RolesTab() {
  const [roles, setRoles] = useState<RoleFromAPI[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<RoleFromAPI[]>>("/api/roles");
      if (response.data.success && response.data.data) {
        setRoles(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load roles");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    }
  }, []);

  // Fetch users to calculate userCount for each role
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<UsersData>>("/api/users");
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  // Fetch permissions (placeholder - API endpoint may not exist yet)
  const fetchPermissions = useCallback(async () => {
    try {
      // TODO: Replace with actual API endpoint when available
      // const response = await api.get<ApiResponse<Permission[]>>("/api/permissions");
      // if (response.data.success && response.data.data) {
      //   setPermissions(response.data.data);
      // }

      // For now, use empty array or extract from existing roles
      // You can extract unique permissions from roles if needed
      const allPermissions = new Set<string>();
      roles.forEach((role) => {
        role.permissions?.forEach((perm) => allPermissions.add(perm));
      });

      // Convert to Permission format with IDs (using index as ID for now)
      const permissionsList: Permission[] = Array.from(allPermissions).map(
        (name, index) => ({
          id: index + 1,
          name,
        })
      );
      setPermissions(permissionsList);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setPermissions([]);
    }
  }, [roles]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchRoles, fetchUsers]);

  // Fetch permissions after roles are loaded
  useEffect(() => {
    if (roles.length > 0) {
      fetchPermissions();
    }
  }, [roles, fetchPermissions]);

  // Transform roles for display
  const rolesForDisplay = useMemo(() => {
    return roles.map((role, index) => {
      // Calculate userCount - count how many users have this role
      const userCount = users.filter((user) =>
        user.roles.some((userRole) => userRole.id === role.id)
      ).length;

      // Get permissionCount from permissions array (array of permission names)
      const permissionCount = role.permissions?.length || 0;

      // Format created date
      const createdDate = role.created_at
        ? new Date(role.created_at).toLocaleDateString()
        : "N/A";

      // Generate description based on role name and permissions
      const description =
        permissionCount > 0
          ? `${permissionCount} permission${
              permissionCount !== 1 ? "s" : ""
            } assigned`
          : "No permissions assigned";

      // Assign icon color based on index
      const iconBgColor = iconBgColorOptions[index % iconBgColorOptions.length];

      return {
        id: role.id.toString(),
        roleName: role.name,
        description,
        userCount,
        permissionCount,
        createdDate,
        iconBgColor,
      } as RoleForDisplay;
    });
  }, [roles, users]);

  const handleViewDetails = (roleId: string) => {
    console.log(`View details for role ${roleId}`);
  };

  const handleEdit = (roleId: string) => {
    console.log(`Edit role ${roleId}`);
  };

  // Handle role submission (placeholder - API endpoint doesn't exist yet)
  const handleRoleSubmit = async (data: RoleFormData) => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await api.post<ApiResponse<RoleFromAPI>>("/api/roles", {
      //   name: data.name,
      //   description: data.description,
      //   permission_ids: data.permission_ids,
      // });

      // if (response.data.success) {
      //   toast.success("Role Created Successfully", {
      //     description: `${data.name} has been created.`,
      //     duration: 3000,
      //   });
      //   fetchRoles(); // Refresh roles list
      // } else {
      //   toast.error("Failed to Create Role", {
      //     description: response.data.message || "Failed to create role",
      //     duration: 4000,
      //   });
      // }

      // Placeholder: Just show a message that API is not ready
      console.log("Role data to be submitted:", data);
      toast.info("API Endpoint Not Ready", {
        description:
          "The role creation API endpoint is not yet available. Data prepared: " +
          JSON.stringify(data),
        duration: 5000,
      });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        toast.error("Validation Error", {
          description: errorMessages,
          duration: 4000,
        });
      } else {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create role";
        toast.error("Failed to Create Role", {
          description: errorMsg,
          duration: 4000,
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 ">
        <h1 className="text-base font-semibold text-gray-900">
          Role Management
        </h1>
        <AppButtons
          filter={false}
          add={false}
          addRole={true}
          addRoleOrder={1}
          onAddRoleClick={() => setIsAddRoleOpen(true)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading roles...
        </div>
      ) : rolesForDisplay.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No roles found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {rolesForDisplay.map((role) => (
            <RoleCard
              key={role.id}
              roleName={role.roleName}
              description={role.description}
              userCount={role.userCount}
              permissionCount={role.permissionCount}
              createdDate={role.createdDate}
              icon={Shield}
              iconBgColor={role.iconBgColor}
              onViewDetails={() => handleViewDetails(role.id)}
              onEdit={() => handleEdit(role.id)}
            />
          ))}
        </div>
      )}

      {/* Add Role Dialog */}
      <AddRoleDialog
        open={isAddRoleOpen}
        onOpenChange={setIsAddRoleOpen}
        title="Add Role"
        permissions={permissions}
        onSubmit={handleRoleSubmit}
      />
    </div>
  );
}
