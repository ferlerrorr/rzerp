import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
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
import { LeaveRequestDialog } from "@/components/dialogs/leave-request-dialog";
import {
  useLeaveRequestStore,
  LeaveRequestFormData,
  LeaveRequestDialogFormData,
  LeaveRequestFromAPI,
  LeaveBalanceFromAPI,
} from "@/stores/leave";
import { useEmployeeStore } from "@/stores/employee";

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

// Transform LeaveRequestFromAPI to display format
const transformLeaveRequest = (request: LeaveRequestFromAPI) => {
  return {
    id: request.id.toString(),
    employee: request.employee?.name || `Employee ${request.employee_id}`,
    leaveType: request.leave_type?.name || "Unknown",
    startDate: request.start_date,
    endDate: request.end_date,
    days: request.total_days,
    status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
  };
};

// Table column definitions
const leaveColumns: ColumnDef<ReturnType<typeof transformLeaveRequest>>[] = [
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
      Cancelled: "warning",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Transform leave balances to progress format
const transformLeaveBalances = (balances: LeaveBalanceFromAPI[]) => {
  const colors = ["blue", "green", "purple", "orange", "pink", "indigo", "teal", "yellow", "red"];
  return balances.map((balance, index) => ({
    title: balance.leave_type?.name || "Unknown",
    used: balance.used_days,
    balance: balance.available_days,
    usedColor: (colors[index % colors.length] || "blue") as any,
    balanceColor: "gray" as const,
  }));
};

export function LeaveTab() {
  const {
    leaveRequests,
    leaveTypes,
    leaveBalances,
    loading,
    error,
    fetchLeaveRequests,
    fetchLeaveTypes,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useLeaveRequestStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
    fetchEmployees();
  }, [fetchLeaveRequests, fetchLeaveTypes, fetchEmployees]);

  // Get employee options for leave request dialog
  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      id: emp.id.toString(),
      name: `${emp.first_name} ${emp.last_name}`,
    }));
  }, [employees]);

  // Calculate leave data for cards
  const leaveData = useMemo(() => {
    const pendingRequest = leaveRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const approveThisMonth = leaveRequests.filter((r) => {
      const recordDate = new Date(r.start_date);
      return (
        r.status === "approved" &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    }).length;
    const totalDaysUsed = leaveRequests
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.total_days, 0);
    const availableLeaveCredits = leaveBalances.reduce(
      (sum, b) => sum + b.available_days,
      0
    );

    return {
      pending_request: pendingRequest,
      approve_this_month: approveThisMonth,
      total_days_used: totalDaysUsed,
      available_leave_credits: availableLeaveCredits,
    };
  }, [leaveRequests, leaveBalances]);

  // Transform leave requests for table
  const leaveRecords = useMemo(() => {
    return leaveRequests.map(transformLeaveRequest);
  }, [leaveRequests]);

  // Transform leave balances for progress cards
  const leaveTypeProgress = useMemo(() => {
    return transformLeaveBalances(leaveBalances);
  }, [leaveBalances]);

  // Handle leave request submission
  const handleLeaveRequestSubmit = async (data: LeaveRequestDialogFormData) => {
    // Transform form data to API format
    // Find employee ID from name
    const employee = employees.find(
      (emp) => `${emp.first_name} ${emp.last_name}` === data.employeeName
    );
    // Find leave type ID from name
    const leaveType = leaveTypes.find((lt) => lt.name === data.leaveType);

    if (!employee) {
      toast.error("Invalid Employee", {
        description: "Please select a valid employee.",
        duration: 4000,
      });
      return;
    }

    if (!leaveType) {
      toast.error("Invalid Leave Type", {
        description: "Please select a valid leave type.",
        duration: 4000,
      });
      return;
    }

    const apiData: LeaveRequestFormData = {
      employee_id: Number(employee.id),
      leave_type_id: leaveType.id,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason || undefined,
    };

    const result = await createLeaveRequest(apiData);
    if (result) {
      toast.success("Leave Request Submitted", {
        description: "Leave request has been submitted successfully.",
        duration: 3000,
      });
      setIsLeaveRequestOpen(false);
    } else {
      toast.error("Failed to Submit Leave Request", {
        description: "An error occurred while submitting the leave request.",
        duration: 4000,
      });
    }
  };

  // Handle approve leave request
  const handleApproveLeave = async (record: ReturnType<typeof transformLeaveRequest>) => {
    const result = await approveLeaveRequest(parseInt(record.id));
    if (result) {
      toast.success("Leave Request Approved", {
        description: `Leave request for ${record.employee} has been approved.`,
        duration: 3000,
      });
    } else {
      toast.error("Failed to Approve Leave Request", {
        description: "An error occurred while approving the leave request.",
        duration: 4000,
      });
    }
  };

  // Handle reject leave request
  const handleRejectLeave = async (record: ReturnType<typeof transformLeaveRequest>) => {
    const result = await rejectLeaveRequest(parseInt(record.id), "Rejected by manager");
    if (result) {
      toast.success("Leave Request Rejected", {
        description: `Leave request for ${record.employee} has been rejected.`,
        duration: 3000,
      });
    } else {
      toast.error("Failed to Reject Leave Request", {
        description: "An error occurred while rejecting the leave request.",
        duration: 4000,
      });
    }
  };

  // Table action items
  const leaveActions: ActionItem<ReturnType<typeof transformLeaveRequest>>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (record) => {
        console.log("View leave:", record);
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (record) => {
        console.log("Edit leave:", record);
      },
    },
    {
      label: "Approve",
      icon: CheckCircle2,
      onClick: handleApproveLeave,
    },
    {
      label: "Reject",
      icon: XCircle,
      onClick: handleRejectLeave,
      variant: "destructive",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">
          Leave Management
        </h1>
        <AppButtons
          filter={false}
          add={false}
          addOrder={1}
          leaveRequest={true}
          leaveRequestOrder={2}
          onLeaveRequestClick={() => setIsLeaveRequestOpen(true)}
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading leave requests...</p>
          </div>
        ) : (
          <AppTable
            data={leaveRecords}
            columns={leaveColumns}
            actions={leaveActions}
            itemsPerPage={5}
            caption="Leave Management Records"
            minWidth="800px"
            getRowId={(row) => row.id}
          />
        )}
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

      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={isLeaveRequestOpen}
        onOpenChange={setIsLeaveRequestOpen}
        title="File Leave Request"
        onSubmit={handleLeaveRequestSubmit}
        employees={employeeOptions.map((e) => e.name)}
        leaveTypes={leaveTypes.map((lt) => lt.name)}
      />
    </div>
  );
}
