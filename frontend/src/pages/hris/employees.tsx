import {
  UsersRound,
  UserCheck,
  UserPlus,
  Building2,
  LucideIcon,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";

interface EmployeesData {
  total_employees: number;
  active_employees: number;
  new_this_month: number;
  total_departments: number;
}

interface CardConfig {
  title: string;
  dataKey: keyof EmployeesData;
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
const employeesData: EmployeesData = {
  total_employees: 100,
  active_employees: 85,
  new_this_month: 12,
  total_departments: 8,
};

// Card configuration - maps to dummy data
const cardConfig: CardConfig[] = [
  {
    title: "Total Employees",
    dataKey: "total_employees",
    icon: UsersRound,
    countColor: "default",
    iconBgColor: "blue",
  },
  {
    title: "Active",
    dataKey: "active_employees",
    icon: UserCheck,
    countColor: "green",
    iconBgColor: "green",
  },
  {
    title: "New this month",
    dataKey: "new_this_month",
    icon: UserPlus,
    countColor: "blue",
    iconBgColor: "purple",
  },
  {
    title: "Department",
    dataKey: "total_departments",
    icon: Building2,
    countColor: "black",
    iconBgColor: "indigo",
  },
];

// Employee interface
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: string;
  status: string;
}

// Sample employee data - This would typically come from an API/database
const employees: Employee[] = [
  {
    id: "EMP001",
    name: "John Doe",
    position: "Software Engineer",
    department: "IT",
    salary: "$75,000",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    position: "HR Manager",
    department: "Human Resources",
    salary: "$65,000",
    status: "Active",
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    position: "Sales Representative",
    department: "Sales",
    salary: "$55,000",
    status: "Active",
  },
  {
    id: "EMP004",
    name: "Sarah Williams",
    position: "Accountant",
    department: "Finance",
    salary: "$60,000",
    status: "Active",
  },
  {
    id: "EMP005",
    name: "David Brown",
    position: "Marketing Specialist",
    department: "Marketing",
    salary: "$58,000",
    status: "Active",
  },
  {
    id: "EMP006",
    name: "Emily Davis",
    position: "Operations Manager",
    department: "Operations",
    salary: "$70,000",
    status: "Active",
  },
  {
    id: "EMP007",
    name: "Robert Wilson",
    position: "Product Manager",
    department: "Product",
    salary: "$80,000",
    status: "Active",
  },
  {
    id: "EMP008",
    name: "Lisa Anderson",
    position: "Designer",
    department: "Design",
    salary: "$62,000",
    status: "Active",
  },
  {
    id: "EMP009",
    name: "Michael Chen",
    position: "Developer",
    department: "IT",
    salary: "$72,000",
    status: "Active",
  },
  {
    id: "EMP010",
    name: "Jessica Taylor",
    position: "Analyst",
    department: "Finance",
    salary: "$59,000",
    status: "Active",
  },
  {
    id: "EMP011",
    name: "Christopher Lee",
    position: "Manager",
    department: "Operations",
    salary: "$85,000",
    status: "Active",
  },
  {
    id: "EMP012",
    name: "Amanda White",
    position: "Coordinator",
    department: "HR",
    salary: "$52,000",
    status: "Active",
  },
];

// Table column definitions
const employeeColumns: ColumnDef<Employee>[] = [
  {
    header: "Employee ID",
    accessor: "id",
    width: "100px",
    className: "font-medium",
  },
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Position",
    accessor: "position",
  },
  {
    header: "Department",
    accessor: "department",
  },
  {
    header: "Salary",
    accessor: "salary",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      Active: "success",
      Inactive: "warning",
      Terminated: "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

// Table action items
const employeeActions: ActionItem<Employee>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (employee) => {
      console.log("View employee:", employee);
      // Handle view action
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (employee) => {
      console.log("Edit employee:", employee);
      // Handle edit action
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (employee) => {
      console.log("Delete employee:", employee);
      // Handle delete action
    },
    variant: "destructive",
  },
];

export function EmployeesTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {/* Top section: Search and Buttons - Responsive layout */}
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-4">
        {/* Left side: Search and Filter */}
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>

          <AppButtons filter={true} add={false} filterOrder={1} />
        </div>
        {/* Right side: Add Button */}

        <AppButtons filter={false} add={true} addOrder={1} />
      </div>

      {/* Cards Grid - Already responsive but ensuring proper spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cardConfig.map((card) => (
          <SimpleCard
            key={card.dataKey}
            title={card.title}
            count={employeesData[card.dataKey]}
            icon={card.icon}
            countColor={card.countColor}
            iconBgColor={card.iconBgColor}
          />
        ))}
      </div>

      {/* Table Section - Responsive table with horizontal scroll on mobile */}
      <div className="w-full">
        <AppTable
          data={employees}
          columns={employeeColumns}
          actions={employeeActions}
          itemsPerPage={5}
          caption="A list of employees."
          minWidth="800px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
