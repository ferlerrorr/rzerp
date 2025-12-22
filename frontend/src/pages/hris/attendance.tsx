import { OverViewCard } from "@/components/card/overViewCard";
import {
  UserCheck,
  CalendarOff,
  UserX,
  Clock,
  LucideIcon,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import {
  RevenueChart,
  RevenueChartData,
} from "@/components/charts/revenueChart";

interface AttendanceData {
  present: number;
  on_leave: number;
  absent: number;
  late: number;
}

interface AttendanceCardConfig {
  title: string;
  dataKey: keyof AttendanceData;
  icon: LucideIcon;
  iconBgColor: "green" | "orange";
  valueColor: "green" | "brown" | "red" | "orange";
}

// Sample data - This would typically come from an API/database
const attendanceData: AttendanceData = {
  present: 85,
  on_leave: 8,
  absent: 5,
  late: 12,
};

// Card configuration - maps to dummy data
const attendanceCardConfig: AttendanceCardConfig[] = [
  {
    title: "Present",
    dataKey: "present",
    icon: UserCheck,
    iconBgColor: "green",
    valueColor: "green",
  },
  {
    title: "On Leave",
    dataKey: "on_leave",
    icon: CalendarOff,
    iconBgColor: "orange",
    valueColor: "brown",
  },
  {
    title: "Absent",
    dataKey: "absent",
    icon: UserX,
    iconBgColor: "orange",
    valueColor: "red",
  },
  {
    title: "Late",
    dataKey: "late",
    icon: Clock,
    iconBgColor: "orange",
    valueColor: "orange",
  },
];

// Daily Time Record (DTR) interface
interface DailyTimeRecord {
  id: string;
  employee: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: string;
  status: string;
}

// Sample DTR data - This would typically come from an API/database
const dailyTimeRecords: DailyTimeRecord[] = [
  {
    id: "DTR001",
    employee: "John Doe",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR002",
    employee: "Jane Smith",
    timeIn: "08:15 AM",
    timeOut: "05:15 PM",
    hoursWorked: "9.0",
    status: "Late",
  },
  {
    id: "DTR003",
    employee: "Mike Johnson",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR004",
    employee: "Sarah Williams",
    timeIn: "-",
    timeOut: "-",
    hoursWorked: "-",
    status: "Absent",
  },
  {
    id: "DTR005",
    employee: "David Brown",
    timeIn: "-",
    timeOut: "-",
    hoursWorked: "-",
    status: "On Leave",
  },
  {
    id: "DTR006",
    employee: "Emily Davis",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR007",
    employee: "Robert Wilson",
    timeIn: "08:30 AM",
    timeOut: "05:30 PM",
    hoursWorked: "9.0",
    status: "Late",
  },
  {
    id: "DTR008",
    employee: "Lisa Anderson",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR009",
    employee: "Michael Chen",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR010",
    employee: "Jessica Taylor",
    timeIn: "-",
    timeOut: "-",
    hoursWorked: "-",
    status: "Absent",
  },
  {
    id: "DTR011",
    employee: "Christopher Lee",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    hoursWorked: "9.0",
    status: "Present",
  },
  {
    id: "DTR012",
    employee: "Amanda White",
    timeIn: "08:20 AM",
    timeOut: "05:20 PM",
    hoursWorked: "9.0",
    status: "Late",
  },
];

// Table column definitions
const dtrColumns: ColumnDef<DailyTimeRecord>[] = [
  {
    header: "Employee",
    accessor: "employee",
    className: "font-medium",
  },
  {
    header: "Time In",
    accessor: "timeIn",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Time Out",
    accessor: "timeOut",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Hours Worked",
    accessor: "hoursWorked",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Present: "success",
      Late: "warning",
      Absent: "error",
      "On Leave": "pending",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Table action items
const dtrActions: ActionItem<DailyTimeRecord>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (record) => {
      console.log("View DTR:", record);
      // Handle view action
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (record) => {
      console.log("Edit DTR:", record);
      // Handle edit action
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (record) => {
      console.log("Delete DTR:", record);
      // Handle delete action
    },
    variant: "destructive",
  },
];

// Attendance chart data
const attendanceChartData: RevenueChartData[] = [
  {
    month: "January",
    averageAttendance: 85,
    totalHoursWorked: 765,
    overtimeHours: 45,
  },
  {
    month: "February",
    averageAttendance: 88,
    totalHoursWorked: 792,
    overtimeHours: 52,
  },
  {
    month: "March",
    averageAttendance: 82,
    totalHoursWorked: 738,
    overtimeHours: 38,
  },
  {
    month: "April",
    averageAttendance: 90,
    totalHoursWorked: 810,
    overtimeHours: 60,
  },
  {
    month: "May",
    averageAttendance: 87,
    totalHoursWorked: 783,
    overtimeHours: 48,
  },
  {
    month: "June",
    averageAttendance: 89,
    totalHoursWorked: 801,
    overtimeHours: 55,
  },
];

// Attendance chart configuration
const attendanceChartConfig = {
  averageAttendance: {
    label: "Average Attendance",
    color: "hsl(142, 71%, 45%)", // Green - matches theme
  },
  totalHoursWorked: {
    label: "Total Hours Worked",
    color: "hsl(217, 91%, 60%)", // Blue - matches theme
  },
  overtimeHours: {
    label: "Overtime Hours",
    color: "hsl(25, 95%, 53%)", // Orange - matches theme
  },
} as const;

export function AttendanceTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="w-full">
        <RevenueChart
          data={attendanceChartData}
          config={attendanceChartConfig}
          title="Attendance Overview"
          value="85%"
          xAxisKey="month"
          xAxisFormatter={(value) => value.slice(0, 3)}
          height="200px"
          filters={[]}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {attendanceCardConfig.map((card) => (
          <OverViewCard
            key={card.dataKey}
            title={card.title}
            value={attendanceData[card.dataKey]}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            valueColor={card.valueColor}
            ariaLabel={`${card.title} employees count`}
          />
        ))}
      </div>
      <div className="w-full">
        <AppTable
          data={dailyTimeRecords}
          columns={dtrColumns}
          actions={dtrActions}
          itemsPerPage={5}
          caption="Daily Time Record (DTR)"
          minWidth="800px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
