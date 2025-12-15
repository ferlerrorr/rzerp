import { useState, useMemo, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { DepartmentDialog } from "@/components/dialogs/department-dialog";
import { DepartmentViewDialog } from "@/components/dialogs/department-view-dialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import {
  DepartmentFormData,
  useDepartmentStore,
  DepartmentFromAPI,
} from "@/stores/department";
import { useEmployeeStore } from "@/stores/employee";
import { useSearchStore } from "@/stores/search";

// Department interface for display
interface Department {
  id: string;
  name: string;
  employeeCount: number;
  description?: string;
}

// Transform DepartmentFromAPI to Department for display
const transformDepartmentFromAPI = (
  department: DepartmentFromAPI,
  employeeCount: number = 0
): Department => {
  return {
    id: department.id.toString(),
    name: department.name,
    employeeCount: employeeCount,
    description: department.description || undefined,
  };
};

// Department table columns
const departmentColumns: ColumnDef<Department>[] = [
  {
    header: "Department Name",
    accessor: "name",
    className: "font-medium",
  },
  {
    header: "Employee Count",
    accessor: "employeeCount",
    className: "text-center",
    headerClassName: "text-center",
  },
];

export function DepartmentTab() {
  const {
    departments: departmentsFromAPI,
    loading,
    error,
    fetchDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    setFilters,
  } = useDepartmentStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { query: searchQuery } = useSearchStore();
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isViewDepartmentOpen, setIsViewDepartmentOpen] = useState(false);
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentFromAPI | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<
    number | undefined
  >();
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  // Fetch departments on mount and when search changes
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Fetch employees to calculate employee counts
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update store filters when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters({ search: searchQuery || undefined });
      fetchDepartments();
    }
  }, [searchQuery, setFilters, fetchDepartments]);

  // Transform API departments to display format with employee counts
  const departments = useMemo(() => {
    // Calculate employee counts for each department
    const employeeCounts = new Map<string, number>();
    employees.forEach((emp) => {
      if (emp.department) {
        const count = employeeCounts.get(emp.department) || 0;
        employeeCounts.set(emp.department, count + 1);
      }
    });

    return departmentsFromAPI.map((dept) =>
      transformDepartmentFromAPI(dept, employeeCounts.get(dept.name) || 0)
    );
  }, [departmentsFromAPI, employees]);

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    const query = searchQuery.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  // Handle department creation submission
  const handleDepartmentSubmit = async (data: DepartmentFormData) => {
    try {
      const newDepartment = await createDepartment(data);

      if (newDepartment) {
        toast.success("Department Created Successfully", {
          description: `${newDepartment.name} has been created.`,
          duration: 3000,
        });
        setIsAddDepartmentOpen(false);
      } else {
        if (error && !error.includes("validation")) {
          toast.error("Failed to Create Department", {
            description: error,
            duration: 4000,
          });
        }
      }
    } catch (err) {
      console.error("Error creating department:", err);
      toast.error("Failed to Create Department", {
        description:
          "An error occurred while creating the department. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle view department
  const handleViewDepartment = async (department: Department) => {
    try {
      const departmentData = await getDepartment(parseInt(department.id));
      if (departmentData) {
        setSelectedDepartment(departmentData);
        setIsViewDepartmentOpen(true);
      } else {
        toast.error("Failed to Load Department", {
          description: "Could not load department details.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading department:", err);
      toast.error("Failed to Load Department", {
        description: "An error occurred while loading department details.",
        duration: 4000,
      });
    }
  };

  // Handle edit department
  const handleEditDepartment = async (department: Department) => {
    try {
      const departmentData = await getDepartment(parseInt(department.id));
      if (departmentData) {
        setEditingDepartmentId(departmentData.id);
        setIsEditDepartmentOpen(true);
      } else {
        toast.error("Failed to Load Department", {
          description: "Could not load department details for editing.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading department:", err);
      toast.error("Failed to Load Department", {
        description: "An error occurred while loading department details.",
        duration: 4000,
      });
    }
  };

  // Handle department update submission
  const handleDepartmentUpdate = async (data: DepartmentFormData) => {
    if (!editingDepartmentId) return;

    try {
      const updatedDepartment = await updateDepartment(
        editingDepartmentId,
        data
      );

      if (updatedDepartment) {
        toast.success("Department Updated Successfully", {
          description: `${updatedDepartment.name} has been updated.`,
          duration: 3000,
        });
        setIsEditDepartmentOpen(false);
        setEditingDepartmentId(undefined);
        await fetchDepartments();
      } else {
        if (error && !error.includes("validation")) {
          toast.error("Failed to Update Department", {
            description: error,
            duration: 4000,
          });
        }
      }
    } catch (err) {
      console.error("Error updating department:", err);
      toast.error("Failed to Update Department", {
        description:
          "An error occurred while updating the department. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete button click - open confirmation dialog
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      const success = await deleteDepartment(parseInt(departmentToDelete.id));
      if (success) {
        toast.success("Department Deleted Successfully", {
          description: `${departmentToDelete.name} has been removed.`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setDepartmentToDelete(null);
      } else {
        toast.error("Failed to Delete Department", {
          description:
            error || "An error occurred while deleting the department.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      toast.error("Failed to Delete Department", {
        description: "An error occurred while deleting the department.",
        duration: 4000,
      });
    }
  };

  // Department actions
  const departmentActions: ActionItem<Department>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: handleViewDepartment,
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEditDepartment,
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

      {/* Top section: Search and Buttons */}
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-4">
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>
        </div>
        <AppButtons
          filter={false}
          add={true}
          addOrder={1}
          addLabel="Add Department"
          onAddClick={() => setIsAddDepartmentOpen(true)}
        />
      </div>

      {/* Table Section */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        ) : (
          <AppTable
            data={filteredDepartments}
            columns={departmentColumns}
            actions={departmentActions}
            itemsPerPage={10}
            caption="A list of departments."
            minWidth="600px"
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* Add Department Dialog */}
      <DepartmentDialog
        open={isAddDepartmentOpen}
        onOpenChange={setIsAddDepartmentOpen}
        title="Add Department"
        onSubmit={handleDepartmentSubmit}
        mode="create"
      />

      {/* View Department Dialog */}
      <DepartmentViewDialog
        open={isViewDepartmentOpen}
        onOpenChange={setIsViewDepartmentOpen}
        department={selectedDepartment}
        employeeCount={
          selectedDepartment
            ? departments.find((d) => d.id === selectedDepartment.id.toString())
                ?.employeeCount || 0
            : 0
        }
        onEdit={async (department) => {
          // Close view dialog and open edit dialog
          setIsViewDepartmentOpen(false);
          setEditingDepartmentId(department.id);
          setIsEditDepartmentOpen(true);
        }}
      />

      {/* Edit Department Dialog */}
      <DepartmentDialog
        open={isEditDepartmentOpen}
        onOpenChange={(open) => {
          setIsEditDepartmentOpen(open);
          if (!open) {
            setEditingDepartmentId(undefined);
          }
        }}
        title="Edit Department"
        onSubmit={handleDepartmentUpdate}
        mode="edit"
        departmentId={editingDepartmentId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Department"
        description={
          departmentToDelete
            ? `Are you sure you want to delete "${departmentToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this department? This action cannot be undone."
        }
        itemName={departmentToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </div>
  );
}
