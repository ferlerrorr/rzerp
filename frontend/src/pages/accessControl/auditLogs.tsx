import { AppButtons } from "@/components/common/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";
import { Activity, CheckCircle, XCircle, Calendar } from "lucide-react";

interface AuditLogCounts {
  totalEvents: string;
  successful: string;
  failed: string;
  today: string;
}

interface AuditLogCardConfig {
  title: string;
  dataKey: keyof AuditLogCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Activity | typeof CheckCircle | typeof XCircle | typeof Calendar;
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

const auditLogCounts: AuditLogCounts = {
  totalEvents: "5",
  successful: "4",
  failed: "1",
  today: "5",
};

const auditLogCardConfig: AuditLogCardConfig[] = [
  {
    title: "Total Events",
    dataKey: "totalEvents",
    countColor: "black",
    bgColor: "bg-white",
    icon: Activity,
    iconBgColor: "blue",
  },
  {
    title: "Successful",
    dataKey: "successful",
    countColor: "green",
    bgColor: "bg-white",
    icon: CheckCircle,
    iconBgColor: "green",
  },
  {
    title: "Failed",
    dataKey: "failed",
    countColor: "red",
    bgColor: "bg-white",
    icon: XCircle,
    iconBgColor: "red",
  },
  {
    title: "Today",
    dataKey: "today",
    countColor: "blue",
    bgColor: "bg-white",
    icon: Calendar,
    iconBgColor: "blue",
  },
];

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: "Success" | "Failed";
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-12-10 10:30 AM",
    user: "John Doe",
    action: "Login",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    status: "Success",
  },
  {
    id: "2",
    timestamp: "2024-12-10 09:15 AM",
    user: "Jane Smith",
    action: "Create User",
    module: "User Management",
    details: "Created new user account",
    ipAddress: "192.168.1.101",
    status: "Success",
  },
  {
    id: "3",
    timestamp: "2024-12-10 08:45 AM",
    user: "Mike Johnson",
    action: "Delete Record",
    module: "HRIS",
    details: "Attempted to delete employee record",
    ipAddress: "192.168.1.102",
    status: "Failed",
  },
  {
    id: "4",
    timestamp: "2024-12-10 08:20 AM",
    user: "Sarah Williams",
    action: "Update Role",
    module: "Access Control",
    details: "Updated user role permissions",
    ipAddress: "192.168.1.103",
    status: "Success",
  },
  {
    id: "5",
    timestamp: "2024-12-10 07:50 AM",
    user: "David Brown",
    action: "Export Data",
    module: "Reports",
    details: "Exported financial report",
    ipAddress: "192.168.1.104",
    status: "Success",
  },
];

const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    header: "Timestamp",
    accessor: "timestamp",
    className: "font-medium",
  },
  {
    header: "User",
    accessor: "user",
  },
  {
    header: "Action",
    accessor: "action",
  },
  {
    header: "Module",
    accessor: "module",
  },
  {
    header: "Details",
    accessor: "details",
  },
  {
    header: "IP Address",
    accessor: "ipAddress",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Success: "success",
      Failed: "error",
    },
  },
];

export function AuditLogsTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-base font-semibold text-gray-900">
          System Audit Logs
        </h1>
        <AppButtons
          filter={false}
          add={false}
          exportLogs={true}
          exportLogsOrder={1}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {auditLogCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={auditLogCounts[config.dataKey]}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-1">
        {/* Left side: Search and Filter */}
      </div>
      <div className="w-full">
        <AppTable
          data={auditLogs}
          columns={auditLogColumns}
          itemsPerPage={5}
          caption="Audit Logs"
          minWidth="1200px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
