import { useMemo, useEffect } from "react";
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
import { useAttendanceStore, AttendanceFromAPI } from "@/stores/attendance";
import { AppSearch } from "@/components/common/app-Serach";
import { useSearchStore } from "@/stores/search";

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

// Transform AttendanceFromAPI to display format
const transformAttendance = (attendance: AttendanceFromAPI) => {
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return {
    id: attendance.id.toString(),
    employee: attendance.employee?.name || `Employee ${attendance.employee_id}`,
    timeIn: formatTime(attendance.time_in),
    timeOut: formatTime(attendance.time_out),
    hoursWorked: attendance.total_hours > 0 ? attendance.total_hours.toFixed(1) : "-",
    status: attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1),
  };
};

// Table column definitions
const dtrColumns: ColumnDef<ReturnType<typeof transformAttendance>>[] = [
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
      "On leave": "pending",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Table action items
const dtrActions: ActionItem<ReturnType<typeof transformAttendance>>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (record) => {
      console.log("View DTR:", record);
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (record) => {
      console.log("Edit DTR:", record);
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (record) => {
      console.log("Delete DTR:", record);
    },
    variant: "destructive",
  },
];

// Attendance chart data - using useMemo version instead (see below)

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
  const {
    attendances,
    loading,
    error,
    fetchAttendances,
    setFilters,
  } = useAttendanceStore();
  const { query: searchQuery } = useSearchStore();

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters({ search: searchQuery || undefined });
      fetchAttendances();
    }
  }, [searchQuery, setFilters, fetchAttendances]);

  // Calculate attendance data from API
  const attendanceData = useMemo(() => {
    const present = attendances.filter((a) => a.status === "present").length;
    const onLeave = attendances.filter((a) => a.status === "on_leave").length;
    const absent = attendances.filter((a) => a.status === "absent").length;
    const late = attendances.filter((a) => a.status === "late").length;

    return {
      present,
      on_leave: onLeave,
      absent,
      late,
    };
  }, [attendances]);

  // Transform attendances for table
  const dailyTimeRecords = useMemo(() => {
    return attendances.map(transformAttendance);
  }, [attendances]);

  // Calculate chart data (simplified - would need date grouping)
  const attendanceChartData: RevenueChartData[] = useMemo(() => {
    // This would need proper date grouping in a real implementation
    return [
      {
        month: "January",
        averageAttendance: attendanceData.present,
        totalHoursWorked: attendances.reduce((sum, a) => sum + a.total_hours, 0),
        overtimeHours: attendances.reduce((sum, a) => sum + a.overtime_hours, 0),
      },
    ];
  }, [attendances, attendanceData]);

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-4">
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>
        </div>
      </div>

      <div className="w-full">
        <RevenueChart
          data={attendanceChartData}
          config={attendanceChartConfig}
          title="Attendance Overview"
          value={`${attendanceData.present}%`}
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading attendances...</p>
          </div>
        ) : (
          <AppTable
            data={dailyTimeRecords}
            columns={dtrColumns}
            actions={dtrActions}
            itemsPerPage={5}
            caption="Daily Time Record (DTR)"
            minWidth="800px"
            getRowId={(row) => row.id}
          />
        )}
      </div>
    </div>
  );
}
