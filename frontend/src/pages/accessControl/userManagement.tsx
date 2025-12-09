import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
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

const userCounts: UserCounts = {
  totalUsers: "5",
  activeUsers: "5",
  inactiveUsers: "0",
  rolesDefined: "5",
};

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

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

const users: User[] = [
  {
    id: "1",
    username: "johndoe",
    fullName: "John Doe",
    email: "john.doe@example.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "2024-12-10 09:30 AM",
  },
  {
    id: "2",
    username: "janesmith",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-12-10 08:15 AM",
  },
  {
    id: "3",
    username: "mikejohnson",
    fullName: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "User",
    status: "Active",
    lastLogin: "2024-12-09 04:20 PM",
  },
  {
    id: "4",
    username: "sarahwilliams",
    fullName: "Sarah Williams",
    email: "sarah.williams@example.com",
    role: "Editor",
    status: "Active",
    lastLogin: "2024-12-10 10:45 AM",
  },
  {
    id: "5",
    username: "davidbrown",
    fullName: "David Brown",
    email: "david.brown@example.com",
    role: "Viewer",
    status: "Active",
    lastLogin: "2024-12-09 02:10 PM",
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    header: "Username",
    accessor: "username",
    className: "font-medium",
  },
  {
    header: "Full Name",
    accessor: "fullName",
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Role",
    accessor: "role",
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
    header: "Last Login",
    accessor: "lastLogin",
  },
];

const userActions: ActionItem<User>[] = [
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
      console.log("Delete user:", record);
    },
    variant: "destructive",
  },
];

export function UserManagementTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
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
        />
      </div>
      <div className="w-full">
        <AppTable
          data={users}
          columns={userColumns}
          actions={userActions}
          itemsPerPage={5}
          caption="User Management"
          minWidth="1000px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
