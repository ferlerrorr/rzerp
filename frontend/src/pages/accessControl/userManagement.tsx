import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useSearchStore } from "@/stores/search";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { AddUserDialog } from "@/components/dialogs/add-user-dialog";
import { UserFormData } from "@/stores/userManagement";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface UserCounts {
  totalUsers: string;
  activeUsers: string;
  inactiveUsers: string;
  rolesDefined: string;
}

interface UserCardConfig {
  title: string;
  dataKey: keyof UserCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Users | typeof UserCheck | typeof UserX | typeof Shield;
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


const userCardConfig: UserCardConfig[] = [
  {
    title: "Total Users",
    dataKey: "totalUsers",
    countColor: "black",
    bgColor: "bg-white",
    icon: Users,
    iconBgColor: "blue",
  },
  {
    title: "Active Users",
    dataKey: "activeUsers",
    countColor: "green",
    bgColor: "bg-white",
    icon: UserCheck,
    iconBgColor: "green",
  },
  {
    title: "Inactive Users",
    dataKey: "inactiveUsers",
    countColor: "black",
    bgColor: "bg-white",
    icon: UserX,
    iconBgColor: "gray",
  },
  {
    title: "Roles Defined",
    dataKey: "rolesDefined",
    countColor: "black",
    bgColor: "bg-white",
    icon: Shield,
    iconBgColor: "purple",
  },
];

interface Permission {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    role_id: number;
    permission_id: number;
  };
}

interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    user_id: number;
    role_id: number;
  };
  permissions: Permission[];
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
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

interface RoleOption {
  id: number;
  name: string;
}


// Transform User to table row format
const transformUserForTable = (user: User) => {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    roles: user.roles.map((role) => role.name).join(", ") || "No roles",
    status: user.email_verified_at ? "Active" : "Inactive",
    created_at: new Date(user.created_at).toLocaleDateString(),
  };
};

type UserTableRow = ReturnType<typeof transformUserForTable>;

const userColumns: ColumnDef<UserTableRow>[] = [
  {
    header: "Name",
    accessor: "name",
    className: "font-medium",
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Roles",
    accessor: "roles",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Active: "success",
      Inactive: "default",
    },
  },
  {
    header: "Created",
    accessor: "created_at",
  },
];


export function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { query: searchQuery } = useSearchStore();

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await api.get<ApiResponse<UsersData>>("/api/users", {
        params,
      });
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<RoleOption[]>>("/api/roles");
      if (response.data.success && response.data.data) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Calculate user counts dynamically
  const userCounts = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.email_verified_at).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    // Get unique roles from all users
    const uniqueRoles = new Set<number>();
    users.forEach((user) => {
      user.roles.forEach((role) => uniqueRoles.add(role.id));
    });
    const rolesDefined = uniqueRoles.size;

    return {
      totalUsers: totalUsers.toString(),
      activeUsers: activeUsers.toString(),
      inactiveUsers: inactiveUsers.toString(),
      rolesDefined: rolesDefined.toString(),
    };
  }, [users]);

  // Transform users for table
  const tableData = useMemo(() => {
    return users.map(transformUserForTable);
  }, [users]);

  // Handle user creation
  const handleUserSubmit = async (data: UserFormData) => {
    try {
      // Create user with password confirmation
      const createPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      const response = await api.post<ApiResponse<User>>(
        "/api/users",
        createPayload
      );

      if (response.data.success && response.data.data) {
        const newUser = response.data.data;

        // Assign roles if any are selected
        if (data.role_ids.length > 0) {
          try {
            await api.post(`/api/users/${newUser.id}/roles`, {
              roles: data.role_ids,
            });
          } catch (roleErr) {
            console.error("Failed to assign roles:", roleErr);
            toast.warning("Roles Not Assigned", {
              description:
                "User created successfully but failed to assign roles. Please edit the user to assign roles.",
              duration: 5000,
            });
          }
        }

        toast.success("User Created Successfully", {
          description: `${data.name} has been created.`,
          duration: 3000,
        });

        // Refresh users list
        fetchUsers();
      } else {
        const errorMsg = response.data.message || "Failed to create user";
        setError(errorMsg);
        toast.error("Failed to Create User", {
          description: errorMsg,
          duration: 4000,
        });
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        setError(errorMessages);
        toast.error("Validation Error", {
          description: errorMessages,
          duration: 4000,
        });
      } else {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create user";
        setError(errorMsg);
        toast.error("Failed to Create User", {
          description: errorMsg,
          duration: 4000,
        });
      }
    }
  };

  // Handle user deletion
  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await api.delete<ApiResponse<void>>(
        `/api/users/${userId}`
      );
      if (response.data.success) {
        setError(null);
        toast.success("User Deleted Successfully", {
          description: "User has been deleted.",
          duration: 3000,
        });
        fetchUsers();
      } else {
        const errorMsg = response.data.message || "Failed to delete user";
        setError(errorMsg);
        toast.error("Failed to Delete User", {
          description: errorMsg,
          duration: 4000,
        });
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMsg);
      toast.error("Failed to Delete User", {
        description: errorMsg,
        duration: 4000,
      });
    }
  };

  // User actions
  const userActions: ActionItem<UserTableRow>[] = useMemo(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: (record) => {
          console.log("View user:", record);
        },
      },
      {
        label: "Edit",
        icon: Edit,
        onClick: (record) => {
          console.log("Edit user:", record);
        },
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: (record) => {
          const user = users.find((u) => u.id.toString() === record.id);
          if (user) {
            handleDelete(user.id);
          }
        },
        variant: "destructive",
      },
    ],
    [users]
  );

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={userCounts[config.dataKey]}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-1">
        {/* Left side: Search and Filter */}
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>
        </div>
        {/* Right side: Add Button */}

        <AppButtons
          filter={false}
          add={false}
          addUser={true}
          addUserOrder={1}
          onAddUserClick={() => setIsAddUserOpen(true)}
        />
      </div>
      <div className="w-full">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <AppTable
            data={tableData}
            columns={userColumns}
            actions={userActions}
            itemsPerPage={10}
            caption="User Management"
            minWidth="1000px"
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        title="Add User"
        roles={roles}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
