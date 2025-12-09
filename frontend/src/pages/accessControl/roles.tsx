import { AppButtons } from "@/components/app-Buttons";
import { RoleCard } from "@/components/card/roleCard";
import { Shield } from "lucide-react";

interface Role {
  id: string;
  roleName: string;
  description: string;
  userCount: number;
  permissionCount: number;
  createdDate: string;
  iconBgColor?:
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

const roles: Role[] = [
  {
    id: "1",
    roleName: "Admin",
    description: "Full system access with all permissions",
    userCount: 1,
    permissionCount: 4,
    createdDate: "2024-01-01",
    iconBgColor: "blue",
  },
  {
    id: "2",
    roleName: "Manager",
    description: "Management access with limited permissions",
    userCount: 3,
    permissionCount: 8,
    createdDate: "2024-01-15",
    iconBgColor: "green",
  },
  {
    id: "3",
    roleName: "Editor",
    description: "Edit access for content management",
    userCount: 5,
    permissionCount: 6,
    createdDate: "2024-02-01",
    iconBgColor: "purple",
  },
  {
    id: "4",
    roleName: "Viewer",
    description: "Read-only access to view content",
    userCount: 10,
    permissionCount: 2,
    createdDate: "2024-02-10",
    iconBgColor: "orange",
  },
  {
    id: "5",
    roleName: "User",
    description: "Basic user access with standard permissions",
    userCount: 15,
    permissionCount: 3,
    createdDate: "2024-02-20",
    iconBgColor: "indigo",
  },
];

export function RolesTab() {
  const handleViewDetails = (roleId: string) => {
    console.log(`View details for role ${roleId}`);
  };

  const handleEdit = (roleId: string) => {
    console.log(`Edit role ${roleId}`);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 ">
        <h1 className="text-base font-semibold text-gray-900">
          Role Management
        </h1>
        <AppButtons
          filter={false}
          add={false}
          addRole={true}
          addRoleOrder={1}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {roles.map((role) => (
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
    </div>
  );
}
