import { useState, useMemo, useEffect } from "react";
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
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { FilterDialog, FilterGroup } from "@/components/dialogs/filter-dialog";
import { EmployeeOnboardingDialog } from "@/components/dialogs/employee-onboarding-dialog";
import { EmployeeViewDialog } from "@/components/dialogs/employee-view-dialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import {
  EmployeeFormData,
  useEmployeeStore,
  EmployeeFromAPI,
} from "@/stores/employee";
import { useSearchStore } from "@/stores/search";

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

// Employee interface for display
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: string;
  status: string;
}

// Transform EmployeeFromAPI to Employee for display
const transformEmployeeFromAPI = (employee: EmployeeFromAPI): Employee => {
  const fullName = [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  // Format salary with peso sign
  const salary = employee.monthly_salary
    ? `₱${parseFloat(employee.monthly_salary).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱0.00";

  return {
    id: employee.id.toString(),
    name: fullName,
    position: employee.position,
    department: employee.department,
    salary: salary,
    status: "Active", // You can add status field to the API later
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

// Table action items - will be created inside component to access handlers

export function EmployeesTab() {
  // Use Zustand store
  const {
    employees: employeesFromAPI,
    loading,
    error,
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setFilters,
    clearFilters,
  } = useEmployeeStore();

  const { query: searchQuery } = useSearchStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isViewEmployeeOpen, setIsViewEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeFromAPI | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<
    number | undefined
  >();
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

  // Filter state - using a single object for all filters
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    department: [],
    status: [],
    position: [],
  });

  // Fetch employees on mount and when filters/search change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update store filters when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters({ search: searchQuery || undefined });
      fetchEmployees();
    }
  }, [searchQuery, setFilters, fetchEmployees]);

  // Transform API employees to display format
  const employees = useMemo(() => {
    return employeesFromAPI.map(transformEmployeeFromAPI);
  }, [employeesFromAPI]);

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

    // Update store filters
    const storeFilters: Record<string, string> = {};
    if (filters.department.length > 0) {
      storeFilters.department = filters.department[0];
    }
    if (filters.position.length > 0) {
      storeFilters.position = filters.position[0];
    }
    setFilters(storeFilters);
    fetchEmployees();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedFilters({
      department: [],
      status: [],
      position: [],
    });
    clearFilters();
    fetchEmployees();
  };

  // Handle employee onboarding submission
  const handleEmployeeSubmit = async (data: EmployeeFormData) => {
    try {
      const newEmployee = await createEmployee(data);

      if (newEmployee) {
        const fullName = [
          newEmployee.first_name,
          newEmployee.middle_name,
          newEmployee.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        toast.success("Employee Added Successfully", {
          description: `${fullName} has been added to the system.`,
          duration: 3000,
        });
        setIsAddEmployeeOpen(false);
        // Reset form is handled by the dialog when it closes
      } else {
        // Error handling is done in the store, but show a toast if there's a general error
        if (error && !error.includes("validation")) {
          toast.error("Failed to Add Employee", {
            description: error,
            duration: 4000,
          });
        }
        // If there are validation errors, they're already shown in the form fields
        // Don't close the dialog so user can fix the errors
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      toast.error("Failed to Add Employee", {
        description:
          "An error occurred while saving the employee. Please try again.",
        duration: 4000,
      });
      // Don't close dialog on error so user can see validation errors
    }
  };

  // Handle view employee
  const handleViewEmployee = async (employee: Employee) => {
    try {
      const employeeData = await getEmployee(parseInt(employee.id));
      if (employeeData) {
        setSelectedEmployee(employeeData);
        setIsViewEmployeeOpen(true);
      } else {
        toast.error("Failed to Load Employee", {
          description: "Could not load employee details.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading employee:", err);
      toast.error("Failed to Load Employee", {
        description: "An error occurred while loading employee details.",
        duration: 4000,
      });
    }
  };

  // Handle edit employee
  const handleEditEmployee = async (employee: Employee) => {
    try {
      const employeeData = await getEmployee(parseInt(employee.id));
      if (employeeData) {
        setEditingEmployeeId(employeeData.id);
        setIsEditEmployeeOpen(true);
      } else {
        toast.error("Failed to Load Employee", {
          description: "Could not load employee details for editing.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading employee:", err);
      toast.error("Failed to Load Employee", {
        description: "An error occurred while loading employee details.",
        duration: 4000,
      });
    }
  };

  // Handle employee update submission
  const handleEmployeeUpdate = async (data: EmployeeFormData) => {
    if (!editingEmployeeId) return;

    try {
      const updatedEmployee = await updateEmployee(editingEmployeeId, data);

      if (updatedEmployee) {
        const fullName = [
          updatedEmployee.first_name,
          updatedEmployee.middle_name,
          updatedEmployee.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        toast.success("Employee Updated Successfully", {
          description: `${fullName} has been updated.`,
          duration: 3000,
        });
        setIsEditEmployeeOpen(false);
        setEditingEmployeeId(undefined);
        // Refresh employee list
        await fetchEmployees();
      } else {
        if (error && !error.includes("validation")) {
          toast.error("Failed to Update Employee", {
            description: error,
            duration: 4000,
          });
        }
        // Validation errors are shown in form fields
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("Failed to Update Employee", {
        description:
          "An error occurred while updating the employee. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete button click - open confirmation dialog
  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const success = await deleteEmployee(parseInt(employeeToDelete.id));
      if (success) {
        toast.success("Employee Deleted Successfully", {
          description: `${employeeToDelete.name} has been removed from the system.`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      } else {
        toast.error("Failed to Delete Employee", {
          description:
            error || "An error occurred while deleting the employee.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error("Failed to Delete Employee", {
        description: "An error occurred while deleting the employee.",
        duration: 4000,
      });
    }
  };

  // Table action items
  const employeeActions: ActionItem<Employee>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: handleViewEmployee,
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEditEmployee,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDeleteClick,
      variant: "destructive",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {/* Error message */}
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : (
          <AppTable
            data={filteredEmployees}
            columns={employeeColumns}
            actions={employeeActions}
            itemsPerPage={5}
            caption="A list of employees."
            minWidth="800px"
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Employees"
        filterGroups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Add Employee Dialog */}
      <EmployeeOnboardingDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        title="Add Employee"
        onSubmit={handleEmployeeSubmit}
        mode="create"
      />

      {/* Edit Employee Dialog */}
      <EmployeeOnboardingDialog
        open={isEditEmployeeOpen}
        onOpenChange={(open) => {
          setIsEditEmployeeOpen(open);
          if (!open) {
            setEditingEmployeeId(undefined);
          }
        }}
        title="Edit Employee"
        onSubmit={handleEmployeeUpdate}
        mode="edit"
        employeeId={editingEmployeeId}
      />

      {/* View Employee Dialog */}
      <EmployeeViewDialog
        open={isViewEmployeeOpen}
        onOpenChange={setIsViewEmployeeOpen}
        employee={selectedEmployee}
        onEdit={async (employee) => {
          // Close view dialog and open edit dialog
          setIsViewEmployeeOpen(false);
          setEditingEmployeeId(employee.id);
          setIsEditEmployeeOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Employee"
        description={
          employeeToDelete
            ? `Are you sure you want to delete "${employeeToDelete.name}"? This action cannot be undone and all associated data will be permanently removed.`
            : "Are you sure you want to delete this employee? This action cannot be undone."
        }
        itemName={employeeToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </div>
  );
}
