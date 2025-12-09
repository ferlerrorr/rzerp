import { AppButtons } from "@/components/app-Buttons";
import { SimpleCard } from "@/components/card/simpleCard";
import { ProgressCard } from "@/components/card/progressCard";
import {
  Clock,
  CheckCircle,
  Calendar,
  CalendarOff,
  LucideIcon,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";

interface LeaveData {
  pending_request: number;
  approve_this_month: number;
  total_days_used: number;
  available_leave_credits: number;
}

interface LeaveCardConfig {
  title: string;
  dataKey: keyof LeaveData;
  icon: LucideIcon;
  countColor: "default" | "green" | "blue" | "black";
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray";
}

// Sample data - This would typically come from an API/database
const leaveData: LeaveData = {
  pending_request: 12,
  approve_this_month: 8,
  total_days_used: 45,
  available_leave_credits: 15,
};

// Card configuration - maps to dummy data
const leaveCardConfig: LeaveCardConfig[] = [
  {
    title: "Pending Request",
    dataKey: "pending_request",
    icon: Clock,
    countColor: "default",
    iconBgColor: "orange",
  },
  {
    title: "Approve this month",
    dataKey: "approve_this_month",
    icon: CheckCircle,
    countColor: "green",
    iconBgColor: "green",
  },
  {
    title: "Total days used",
    dataKey: "total_days_used",
    icon: Calendar,
    countColor: "blue",
    iconBgColor: "blue",
  },
  {
    title: "Available leave credits",
    dataKey: "available_leave_credits",
    icon: CalendarOff,
    countColor: "black",
    iconBgColor: "indigo",
  },
];

// Leave Record interface
interface LeaveRecord {
  id: string;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

// Sample leave records data - This would typically come from an API/database
const leaveRecords: LeaveRecord[] = [
  {
    id: "LEAVE001",
    employee: "John Doe",
    leaveType: "Vacation",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    days: 6,
    status: "Approved",
  },
  {
    id: "LEAVE002",
    employee: "Jane Smith",
    leaveType: "Sick Leave",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    days: 3,
    status: "Approved",
  },
  {
    id: "LEAVE003",
    employee: "Mike Johnson",
    leaveType: "Personal",
    startDate: "2024-01-18",
    endDate: "2024-01-19",
    days: 2,
    status: "Pending",
  },
  {
    id: "LEAVE004",
    employee: "Sarah Williams",
    leaveType: "Vacation",
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    days: 5,
    status: "Pending",
  },
  {
    id: "LEAVE005",
    employee: "David Brown",
    leaveType: "Sick Leave",
    startDate: "2024-01-08",
    endDate: "2024-01-09",
    days: 2,
    status: "Approved",
  },
  {
    id: "LEAVE006",
    employee: "Emily Davis",
    leaveType: "Maternity",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    days: 90,
    status: "Approved",
  },
  {
    id: "LEAVE007",
    employee: "Robert Wilson",
    leaveType: "Vacation",
    startDate: "2024-01-25",
    endDate: "2024-01-30",
    days: 6,
    status: "Pending",
  },
  {
    id: "LEAVE008",
    employee: "Lisa Anderson",
    leaveType: "Personal",
    startDate: "2024-01-14",
    endDate: "2024-01-14",
    days: 1,
    status: "Approved",
  },
  {
    id: "LEAVE009",
    employee: "Michael Chen",
    leaveType: "Sick Leave",
    startDate: "2024-01-16",
    endDate: "2024-01-17",
    days: 2,
    status: "Approved",
  },
  {
    id: "LEAVE010",
    employee: "Jessica Taylor",
    leaveType: "Vacation",
    startDate: "2024-01-28",
    endDate: "2024-02-02",
    days: 6,
    status: "Pending",
  },
  {
    id: "LEAVE011",
    employee: "Christopher Lee",
    leaveType: "Personal",
    startDate: "2024-01-12",
    endDate: "2024-01-13",
    days: 2,
    status: "Approved",
  },
  {
    id: "LEAVE012",
    employee: "Amanda White",
    leaveType: "Sick Leave",
    startDate: "2024-01-20",
    endDate: "2024-01-21",
    days: 2,
    status: "Pending",
  },
];

// Table column definitions
const leaveColumns: ColumnDef<LeaveRecord>[] = [
  {
    header: "Employee",
    accessor: "employee",
    className: "font-medium",
  },
  {
    header: "Leave Type",
    accessor: "leaveType",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Start Date",
    accessor: "startDate",
    cell: (row) => {
      const date = new Date(row.startDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "End Date",
    accessor: "endDate",
    cell: (row) => {
      const date = new Date(row.endDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Days",
    accessor: "days",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Approved: "success",
      Pending: "pending",
      Rejected: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Table action items
const leaveActions: ActionItem<LeaveRecord>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (record) => {
      console.log("View leave:", record);
      // Handle view action
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (record) => {
      console.log("Edit leave:", record);
      // Handle edit action
    },
  },
  {
    label: "Approve",
    icon: CheckCircle2,
    onClick: (record) => {
      console.log("Approve leave:", record);
      // Handle approve action
    },
  },
  {
    label: "Reject",
    icon: XCircle,
    onClick: (record) => {
      console.log("Reject leave:", record);
      // Handle reject action
    },
    variant: "destructive",
  },
];

// Leave type progress data - This would typically come from an API/database
interface LeaveTypeProgress {
  title: string;
  used: number;
  balance: number;
  usedColor?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "red"
    | "gray";
  balanceColor?: "gray" | "muted";
}

const leaveTypeProgress: LeaveTypeProgress[] = [
  {
    title: "Vacation Leave",
    used: 8,
    balance: 7,
    usedColor: "blue",
    balanceColor: "gray",
  },
  {
    title: "Sick Leave",
    used: 5,
    balance: 10,
    usedColor: "red",
    balanceColor: "gray",
  },
  {
    title: "Personal Leave",
    used: 3,
    balance: 2,
    usedColor: "purple",
    balanceColor: "gray",
  },
  {
    title: "Maternity Leave",
    used: 90,
    balance: 0,
    usedColor: "pink",
    balanceColor: "gray",
  },
];

export function LeaveTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex justify-end">
        <AppButtons
          filter={false}
          add={false}
          addOrder={1}
          leaveRequest={true}
          leaveRequestOrder={2}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {leaveCardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={leaveData[card.dataKey]}
            icon={card.icon}
            countColor={card.countColor}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>
      <div className="w-full">
        <AppTable
          data={leaveRecords}
          columns={leaveColumns}
          actions={leaveActions}
          itemsPerPage={5}
          caption="Leave Management Records"
          minWidth="800px"
          getRowId={(row) => row.id}
        />
      </div>
      <div className="w-full rounded-3xl p-4">
        <h1 className="text-base font-semibold mb-4">Leave Balance Summary</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {leaveTypeProgress.map((leaveType) => (
            <ProgressCard
              key={leaveType.title}
              title={leaveType.title}
              used={leaveType.used}
              balance={leaveType.balance}
              usedColor={leaveType.usedColor}
              balanceColor={leaveType.balanceColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
