import { AppTabs } from "@/components/app-Tabs";
import { UserManagementTab } from "./userManagement";
import { RolesTab } from "./roles";
import { PermissionsTab } from "./permissions";
import { AuditLogsTab } from "./auditLogs";
import { UserActivityTab } from "./userActivity";

export function AccessControlPage() {
  const tabs = [
    {
      value: "user-management",
      label: "User Management",
      content: <UserManagementTab />,
    },
    {
      value: "roles",
      label: "Roles",
      content: <RolesTab />,
    },
    {
      value: "permissions",
      label: "Permissions",
      content: <PermissionsTab />,
    },
    {
      value: "audit-logs",
      label: "Audit Logs",
      content: <AuditLogsTab />,
    },
    {
      value: "user-activity",
      label: "User Activity",
      content: <UserActivityTab />,
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 px-2 sm:px-0">
      <AppTabs
        className="mt-4"
        tabs={tabs}
        defaultValue="user-management"
        tabsListClassName="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      />
    </div>
  );
}
