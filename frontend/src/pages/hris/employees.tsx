import { useState, useMemo } from "react";
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
import { toast } from "sonner";
import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { FilterDialog, FilterGroup } from "@/components/filter-dialog";
import { EmployeeOnboardingDialog } from "@/components/employee-onboarding-dialog";
import { EmployeeFormData } from "@/stores/employee";

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

// Default employee data - This would typically come from an API/database
const defaultEmployees: Employee[] = [
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

// LocalStorage key
const EMPLOYEES_STORAGE_KEY = "rzerp_employees";
const EMPLOYEE_COUNTER_KEY = "rzerp_employee_counter";

// Helper functions for localStorage
const loadEmployeesFromStorage = (): Employee[] => {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const employees = JSON.parse(stored);
      // Sort by employee ID when loading from storage (after refresh)
      return sortEmployeesById(employees);
    }
    // Initialize with default employees if no data exists
    const sortedDefault = sortEmployeesById(defaultEmployees);
    saveEmployeesToStorage(sortedDefault);
    // Initialize counter to 12 (since we have 12 default employees)
    if (!localStorage.getItem(EMPLOYEE_COUNTER_KEY)) {
      localStorage.setItem(EMPLOYEE_COUNTER_KEY, "12");
    }
    return sortedDefault;
  } catch (error) {
    console.error("Error loading employees from localStorage:", error);
    return sortEmployeesById(defaultEmployees);
  }
};

// Sort employees by ID (EMP001, EMP002, etc.)
const sortEmployeesById = (employees: Employee[]): Employee[] => {
  return [...employees].sort((a, b) => {
    // Extract numeric part from ID (e.g., "EMP001" -> 1)
    const numA = parseInt(a.id.replace("EMP", ""), 10);
    const numB = parseInt(b.id.replace("EMP", ""), 10);
    return numA - numB;
  });
};

const saveEmployeesToStorage = (employees: Employee[]) => {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error("Error saving employees to localStorage:", error);
  }
};

const getNextEmployeeId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(EMPLOYEE_COUNTER_KEY) || "12",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(EMPLOYEE_COUNTER_KEY, nextCounter.toString());
    return `EMP${nextCounter.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error getting next employee ID:", error);
    return `EMP${Date.now()}`;
  }
};

// Transform EmployeeFormData to Employee
const transformFormDataToEmployee = (formData: EmployeeFormData): Employee => {
  const fullName = [formData.firstName, formData.middleName, formData.lastName]
    .filter(Boolean)
    .join(" ");

  // Format salary with peso sign
  const salary = formData.monthlySalary
    ? `₱${parseFloat(formData.monthlySalary).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱0.00";

  return {
    id: getNextEmployeeId(),
    name: fullName,
    position: formData.position,
    department: formData.department,
    salary: salary,
    status: "Active",
  };
};

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
  // Load employees from localStorage on mount
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadEmployeesFromStorage()
  );

  // Filter state - using a single object for all filters
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    department: [],
    status: [],
    position: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(employees.map((emp) => emp.department))).sort();
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(employees.map((emp) => emp.status))).sort();
  }, [employees]);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(employees.map((emp) => emp.position))).sort();
  }, [employees]);

  // Prepare filter groups for FilterDialog
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        label: "Department",
        key: "department",
        options: uniqueDepartments.map((dept) => ({
          label: dept,
          value: dept,
        })),
      },
      {
        label: "Status",
        key: "status",
        options: uniqueStatuses.map((status) => ({
          label: status,
          value: status,
        })),
      },
      {
        label: "Position",
        key: "position",
        options: uniquePositions.map((position) => ({
          label: position,
          value: position,
        })),
      },
    ],
    [uniqueDepartments, uniqueStatuses, uniquePositions]
  );

  // Filter employees based on selected filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const departmentMatch =
        selectedFilters.department.length === 0 ||
        selectedFilters.department.includes(employee.department);
      const statusMatch =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(employee.status);
      const positionMatch =
        selectedFilters.position.length === 0 ||
        selectedFilters.position.includes(employee.position);

      return departmentMatch && statusMatch && positionMatch;
    });
  }, [employees, selectedFilters]);

  // Calculate employees data for cards
  const employeesData = useMemo(() => {
    const activeEmployees = employees.filter(
      (emp) => emp.status === "Active"
    ).length;
    // For now, we'll just count new employees (you can add createdAt field later)
    const newThisMonth = employees.filter((emp) => {
      return emp.status === "Active";
    }).length;
    const totalDepartments = uniqueDepartments.length;

    return {
      total_employees: employees.length,
      active_employees: activeEmployees,
      new_this_month: newThisMonth,
      total_departments: totalDepartments,
    };
  }, [employees, uniqueDepartments]);

  // Handle filter changes from FilterDialog
  const handleFilterChange = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      department: [],
      status: [],
      position: [],
    });
  };

  // Handle employee onboarding submission
  const handleEmployeeSubmit = (data: EmployeeFormData) => {
    try {
      // Transform form data to employee format
      const newEmployee = transformFormDataToEmployee(data);

      // Add new employee to the beginning of the list (so it appears at the top)
      const updatedEmployees = [newEmployee, ...employees];

      // Save to localStorage
      saveEmployeesToStorage(updatedEmployees);

      // Update state to trigger re-render
      setEmployees(updatedEmployees);

      // Show success toast
      toast.success("Employee Added Successfully", {
        description: `${newEmployee.name} has been added to the system.`,
        duration: 3000,
      });

      console.log("Employee added successfully:", newEmployee);
    } catch (error) {
      console.error("Error saving employee:", error);
      // Show error toast
      toast.error("Failed to Add Employee", {
        description:
          "An error occurred while saving the employee. Please try again.",
        duration: 4000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {/* Top section: Search and Buttons - Responsive layout */}
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-4">
        {/* Left side: Search and Filter */}
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>

          <AppButtons
            filter={true}
            add={false}
            filterOrder={1}
            onFilterClick={() => setIsFilterOpen(true)}
          />
        </div>
        {/* Right side: Add Button */}

        <AppButtons
          filter={false}
          add={true}
          addOrder={1}
          onAddClick={() => setIsAddEmployeeOpen(true)}
        />
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
          data={filteredEmployees}
          columns={employeeColumns}
          actions={employeeActions}
          itemsPerPage={5}
          caption="A list of employees."
          minWidth="800px"
          getRowId={(row) => row.id}
        />
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Employees"
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Add Employee Dialog */}
      <EmployeeOnboardingDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        title="Add Employee"
        onSubmit={handleEmployeeSubmit}
        departments={uniqueDepartments}
        positions={uniquePositions}
      />
    </div>
  );
}
