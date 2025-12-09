import { PermissionCard } from "@/components/card/permissionCard";
import { Square } from "lucide-react";

interface Permission {
  id: string;
  title: string;
  description: string;
  permissionId: string;
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

interface PermissionModule {
  name: string;
  permissions: Permission[];
}

const permissionModules: PermissionModule[] = [
  {
    name: "HRIS Module",
    permissions: [
      {
        id: "1",
        title: "View HRIS Data",
        description: "View employee records and HR data",
        permissionId: "hris.view",
        iconBgColor: "blue",
      },
      {
        id: "2",
        title: "Edit HRIS Data",
        description: "Edit employee records and HR information",
        permissionId: "hris.edit",
        iconBgColor: "green",
      },
      {
        id: "3",
        title: "Manage Employees",
        description: "Add, update, and delete employee records",
        permissionId: "hris.manage",
        iconBgColor: "purple",
      },
      {
        id: "4",
        title: "Process Payroll",
        description: "Process and manage payroll operations",
        permissionId: "hris.payroll",
        iconBgColor: "orange",
      },
    ],
  },
  {
    name: "Finance Module",
    permissions: [
      {
        id: "5",
        title: "View Financial Data",
        description: "View financial reports and transactions",
        permissionId: "finance.view",
        iconBgColor: "blue",
      },
      {
        id: "6",
        title: "Create Journal Entries",
        description: "Create and manage journal entries",
        permissionId: "finance.journal",
        iconBgColor: "green",
      },
      {
        id: "7",
        title: "Manage Accounts",
        description: "Add, edit, and manage chart of accounts",
        permissionId: "finance.accounts",
        iconBgColor: "purple",
      },
      {
        id: "8",
        title: "Generate Reports",
        description: "Generate and export financial reports",
        permissionId: "finance.reports",
        iconBgColor: "orange",
      },
    ],
  },
  {
    name: "Inventory Module",
    permissions: [
      {
        id: "9",
        title: "View Inventory",
        description: "View product and stock information",
        permissionId: "inventory.view",
        iconBgColor: "blue",
      },
      {
        id: "10",
        title: "Manage Products",
        description: "Add, edit, and delete products",
        permissionId: "inventory.products",
        iconBgColor: "green",
      },
      {
        id: "11",
        title: "Stock Movements",
        description: "Manage stock in, out, and transfers",
        permissionId: "inventory.movements",
        iconBgColor: "purple",
      },
      {
        id: "12",
        title: "Manage Warehouses",
        description: "Create and manage warehouse locations",
        permissionId: "inventory.warehouses",
        iconBgColor: "orange",
      },
    ],
  },
  {
    name: "System Administration",
    permissions: [
      {
        id: "13",
        title: "Manage Users",
        description: "Create, edit, and delete system users",
        permissionId: "system.users",
        iconBgColor: "red",
      },
      {
        id: "14",
        title: "Manage Roles",
        description: "Create and assign user roles",
        permissionId: "system.roles",
        iconBgColor: "indigo",
      },
      {
        id: "15",
        title: "System Settings",
        description: "Configure system-wide settings",
        permissionId: "system.settings",
        iconBgColor: "gray",
      },
      {
        id: "16",
        title: "View Audit Logs",
        description: "View system activity and audit trails",
        permissionId: "system.audit",
        iconBgColor: "teal",
      },
    ],
  },
];

export function PermissionsTab() {
  return (
    <div className="flex flex-col gap-4 sm:gap-8 px-2 sm:px-4 md:px-6">
      <h1 className="text-base sm:text-lg font-semibold text-gray-900">
        Permission Matrix
      </h1>
      <div className="space-y-6 sm:space-y-8">
        {permissionModules.map((module) => (
          <div
            key={module.name}
            className="bg-white border border-gray-200 rounded-2xl p-4"
          >
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
              {module.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
              {module.permissions.map((permission) => (
                <PermissionCard
                  key={permission.id}
                  title={permission.title}
                  description={permission.description}
                  permissionId={permission.permissionId}
                  icon={Square}
                  iconBgColor={permission.iconBgColor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
