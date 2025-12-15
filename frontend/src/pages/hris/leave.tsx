import { useState, useMemo } from "react";
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
import { LeaveRequestFormData } from "@/stores/leave";

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

// Default leave records data - This would typically come from an API/database
const defaultLeaveRecords: LeaveRecord[] = [
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

// LocalStorage keys
const LEAVE_RECORDS_STORAGE_KEY = "rzerp_leave_records";
const LEAVE_COUNTER_KEY = "rzerp_leave_counter";

// Helper functions for localStorage
const loadLeaveRecordsFromStorage = (): LeaveRecord[] => {
  try {
    const stored = localStorage.getItem(LEAVE_RECORDS_STORAGE_KEY);
    if (stored) {
      const records = JSON.parse(stored);
      // Sort by leave ID when loading from storage (after refresh)
      return sortLeaveRecordsById(records);
    }
    // Initialize with default records if no data exists
    const sortedDefault = sortLeaveRecordsById(defaultLeaveRecords);
    saveLeaveRecordsToStorage(sortedDefault);
    // Initialize counter to 12 (since we have 12 default records)
    if (!localStorage.getItem(LEAVE_COUNTER_KEY)) {
      localStorage.setItem(LEAVE_COUNTER_KEY, "12");
    }
    return sortedDefault;
  } catch (error) {
    console.error("Error loading leave records from localStorage:", error);
    return sortLeaveRecordsById(defaultLeaveRecords);
  }
};

// Sort leave records by ID (LEAVE001, LEAVE002, etc.)
const sortLeaveRecordsById = (records: LeaveRecord[]): LeaveRecord[] => {
  return [...records].sort((a, b) => {
    // Extract numeric part from ID (e.g., "LEAVE001" -> 1)
    const numA = parseInt(a.id.replace("LEAVE", ""), 10);
    const numB = parseInt(b.id.replace("LEAVE", ""), 10);
    return numA - numB;
  });
};

const saveLeaveRecordsToStorage = (records: LeaveRecord[]) => {
  try {
    localStorage.setItem(LEAVE_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Error saving leave records to localStorage:", error);
  }
};

const getNextLeaveId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(LEAVE_COUNTER_KEY) || "12",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(LEAVE_COUNTER_KEY, nextCounter.toString());
    return `LEAVE${nextCounter.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error getting next leave ID:", error);
    return `LEAVE${Date.now()}`;
  }
};

// Transform LeaveRequestFormData to LeaveRecord
const transformFormDataToLeaveRecord = (
  formData: LeaveRequestFormData
): LeaveRecord => {
  // Calculate days between start and end date
  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  const days =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    id: getNextLeaveId(),
    employee: formData.employeeName,
    leaveType: formData.leaveType,
    startDate: formData.startDate,
    endDate: formData.endDate,
    days: days,
    status: "Pending",
  };
};

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

// Table action items - will be defined inside component to use handlers

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
  // Load leave records from localStorage on mount
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(() =>
    loadLeaveRecordsFromStorage()
  );

  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);

  // Get unique employee names from leave records
  const uniqueEmployees = useMemo(() => {
    return Array.from(
      new Set(leaveRecords.map((record) => record.employee))
    ).sort();
  }, [leaveRecords]);

  // Calculate leave data for cards
  const leaveData = useMemo(() => {
    const pendingRequest = leaveRecords.filter(
      (record) => record.status === "Pending"
    ).length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const approveThisMonth = leaveRecords.filter((record) => {
      const recordDate = new Date(record.startDate);
      return (
        record.status === "Approved" &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    }).length;
    const totalDaysUsed = leaveRecords
      .filter((record) => record.status === "Approved")
      .reduce((sum, record) => sum + record.days, 0);
    const availableLeaveCredits = 15; // This could be calculated based on employee leave balance

    return {
      pending_request: pendingRequest,
      approve_this_month: approveThisMonth,
      total_days_used: totalDaysUsed,
      available_leave_credits: availableLeaveCredits,
    };
  }, [leaveRecords]);

  // Handle leave request submission
  const handleLeaveRequestSubmit = (data: LeaveRequestFormData) => {
    try {
      // Transform form data to leave record format
      const newLeaveRecord = transformFormDataToLeaveRecord(data);

      // Add new leave record to the beginning of the list (so it appears at the top)
      const updatedRecords = [newLeaveRecord, ...leaveRecords];

      // Save to localStorage
      saveLeaveRecordsToStorage(updatedRecords);

      // Update state to trigger re-render
      setLeaveRecords(updatedRecords);

      // Show success toast
      toast.success("Leave Request Submitted", {
        description: `Leave request for ${data.employeeName} has been submitted successfully.`,
        duration: 3000,
      });

      console.log("Leave request added successfully:", newLeaveRecord);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      // Show error toast
      toast.error("Failed to Submit Leave Request", {
        description:
          "An error occurred while submitting the leave request. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle approve leave request
  const handleApproveLeave = (record: LeaveRecord) => {
    try {
      const updatedRecords = leaveRecords.map((r) =>
        r.id === record.id ? { ...r, status: "Approved" } : r
      );

      // Save to localStorage
      saveLeaveRecordsToStorage(updatedRecords);

      // Update state to trigger re-render
      setLeaveRecords(updatedRecords);

      // Show success toast
      toast.success("Leave Request Approved", {
        description: `Leave request ${record.id} for ${record.employee} has been approved.`,
        duration: 3000,
      });

      console.log("Leave request approved:", record.id);
    } catch (error) {
      console.error("Error approving leave request:", error);
      // Show error toast
      toast.error("Failed to Approve Leave Request", {
        description:
          "An error occurred while approving the leave request. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle reject leave request
  const handleRejectLeave = (record: LeaveRecord) => {
    try {
      const updatedRecords = leaveRecords.map((r) =>
        r.id === record.id ? { ...r, status: "Rejected" } : r
      );

      // Save to localStorage
      saveLeaveRecordsToStorage(updatedRecords);

      // Update state to trigger re-render
      setLeaveRecords(updatedRecords);

      // Show success toast
      toast.success("Leave Request Rejected", {
        description: `Leave request ${record.id} for ${record.employee} has been rejected.`,
        duration: 3000,
      });

      console.log("Leave request rejected:", record.id);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      // Show error toast
      toast.error("Failed to Reject Leave Request", {
        description:
          "An error occurred while rejecting the leave request. Please try again.",
        duration: 4000,
      });
    }
  };

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

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={isLeaveRequestOpen}
        onOpenChange={setIsLeaveRequestOpen}
        title="File Leave Request"
        onSubmit={handleLeaveRequestSubmit}
        employees={uniqueEmployees}
      />
    </div>
  );
}
