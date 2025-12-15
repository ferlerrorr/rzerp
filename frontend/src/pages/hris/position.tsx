import { useState, useMemo, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { PositionDialog } from "@/components/dialogs/position-dialog";
import { PositionViewDialog } from "@/components/dialogs/position-view-dialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import {
  PositionFormData,
  usePositionStore,
  PositionFromAPI,
} from "@/stores/position";
import { useEmployeeStore } from "@/stores/employee";
import { useSearchStore } from "@/stores/search";

// Position interface for display
interface Position {
  id: string;
  name: string;
  employeeCount: number;
  department?: string;
  description?: string;
}

// Transform PositionFromAPI to Position for display
const transformPositionFromAPI = (
  position: PositionFromAPI,
  employeeCount: number = 0
): Position => {
  return {
    id: position.id.toString(),
    name: position.name,
    employeeCount: employeeCount,
    department: position.department?.name || undefined,
    description: position.description || undefined,
  };
};

// Position table columns
const positionColumns: ColumnDef<Position>[] = [
  {
    header: "Position Name",
    accessor: "name",
    className: "font-medium",
  },
  {
    header: "Department",
    accessor: "department",
  },
  {
    header: "Employee Count",
    accessor: "employeeCount",
    className: "text-center",
    headerClassName: "text-center",
  },
];

export function PositionTab() {
  const {
    positions: positionsFromAPI,
    loading,
    error,
    fetchPositions,
    getPosition,
    createPosition,
    updatePosition,
    deletePosition,
    setFilters,
  } = usePositionStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { query: searchQuery } = useSearchStore();
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [isViewPositionOpen, setIsViewPositionOpen] = useState(false);
  const [isEditPositionOpen, setIsEditPositionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<PositionFromAPI | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<
    number | undefined
  >();
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null
  );

  // Fetch positions on mount and when search changes
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Fetch employees to calculate employee counts
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Update store filters when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters({ search: searchQuery || undefined });
      fetchPositions();
    }
  }, [searchQuery, setFilters, fetchPositions]);

  // Transform API positions to display format with employee counts
  const positions = useMemo(() => {
    // Calculate employee counts for each position
    const employeeCounts = new Map<string, number>();
    employees.forEach((emp) => {
      if (emp.position) {
        const count = employeeCounts.get(emp.position) || 0;
        employeeCounts.set(emp.position, count + 1);
      }
    });

    return positionsFromAPI.map((pos) =>
      transformPositionFromAPI(pos, employeeCounts.get(pos.name) || 0)
    );
  }, [positionsFromAPI, employees]);

  // Filter positions based on search
  const filteredPositions = useMemo(() => {
    if (!searchQuery) return positions;
    const query = searchQuery.toLowerCase();
    return positions.filter(
      (pos) =>
        pos.name.toLowerCase().includes(query) ||
        pos.department?.toLowerCase().includes(query)
    );
  }, [positions, searchQuery]);

  // Handle position creation submission
  const handlePositionSubmit = async (data: PositionFormData) => {
    try {
      const newPosition = await createPosition(data);

      if (newPosition) {
        toast.success("Position Created Successfully", {
          description: `${newPosition.name} has been created.`,
          duration: 3000,
        });
        setIsAddPositionOpen(false);
      } else {
        if (error && !error.includes("validation")) {
          toast.error("Failed to Create Position", {
            description: error,
            duration: 4000,
          });
        }
      }
    } catch (err) {
      console.error("Error creating position:", err);
      toast.error("Failed to Create Position", {
        description:
          "An error occurred while creating the position. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle view position
  const handleViewPosition = async (position: Position) => {
    try {
      const positionData = await getPosition(parseInt(position.id));
      if (positionData) {
        setSelectedPosition(positionData);
        setIsViewPositionOpen(true);
      } else {
        toast.error("Failed to Load Position", {
          description: "Could not load position details.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading position:", err);
      toast.error("Failed to Load Position", {
        description: "An error occurred while loading position details.",
        duration: 4000,
      });
    }
  };

  // Handle edit position
  const handleEditPosition = async (position: Position) => {
    try {
      const positionData = await getPosition(parseInt(position.id));
      if (positionData) {
        setEditingPositionId(positionData.id);
        setIsEditPositionOpen(true);
      } else {
        toast.error("Failed to Load Position", {
          description: "Could not load position details for editing.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading position:", err);
      toast.error("Failed to Load Position", {
        description: "An error occurred while loading position details.",
        duration: 4000,
      });
    }
  };

  // Handle position update submission
  const handlePositionUpdate = async (data: PositionFormData) => {
    if (!editingPositionId) return;

    try {
      const updatedPosition = await updatePosition(editingPositionId, data);

      if (updatedPosition) {
        toast.success("Position Updated Successfully", {
          description: `${updatedPosition.name} has been updated.`,
          duration: 3000,
        });
        setIsEditPositionOpen(false);
        setEditingPositionId(undefined);
        await fetchPositions();
      } else {
        if (error && !error.includes("validation")) {
          toast.error("Failed to Update Position", {
            description: error,
            duration: 4000,
          });
        }
      }
    } catch (err) {
      console.error("Error updating position:", err);
      toast.error("Failed to Update Position", {
        description:
          "An error occurred while updating the position. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete button click - open confirmation dialog
  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!positionToDelete) return;

    try {
      const success = await deletePosition(parseInt(positionToDelete.id));
      if (success) {
        toast.success("Position Deleted Successfully", {
          description: `${positionToDelete.name} has been removed.`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setPositionToDelete(null);
      } else {
        toast.error("Failed to Delete Position", {
          description:
            error || "An error occurred while deleting the position.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error deleting position:", err);
      toast.error("Failed to Delete Position", {
        description: "An error occurred while deleting the position.",
        duration: 4000,
      });
    }
  };

  // Position actions
  const positionActions: ActionItem<Position>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: handleViewPosition,
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEditPosition,
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
          addLabel="Add Position"
          onAddClick={() => setIsAddPositionOpen(true)}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-md p-4">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading positions...</p>
          </div>
        ) : (
          <AppTable
            data={filteredPositions}
            columns={positionColumns}
            actions={positionActions}
            itemsPerPage={10}
            caption="A list of positions."
            minWidth="800px"
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* Add Position Dialog */}
      <PositionDialog
        open={isAddPositionOpen}
        onOpenChange={setIsAddPositionOpen}
        title="Add Position"
        onSubmit={handlePositionSubmit}
        mode="create"
      />

      {/* View Position Dialog */}
      <PositionViewDialog
        open={isViewPositionOpen}
        onOpenChange={setIsViewPositionOpen}
        position={selectedPosition}
        employeeCount={
          selectedPosition
            ? positions.find((p) => p.id === selectedPosition.id.toString())
                ?.employeeCount || 0
            : 0
        }
        onEdit={async (position) => {
          // Close view dialog and open edit dialog
          setIsViewPositionOpen(false);
          setEditingPositionId(position.id);
          setIsEditPositionOpen(true);
        }}
      />

      {/* Edit Position Dialog */}
      <PositionDialog
        open={isEditPositionOpen}
        onOpenChange={(open) => {
          setIsEditPositionOpen(open);
          if (!open) {
            setEditingPositionId(undefined);
          }
        }}
        title="Edit Position"
        onSubmit={handlePositionUpdate}
        mode="edit"
        positionId={editingPositionId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Position"
        description={
          positionToDelete
            ? `Are you sure you want to delete "${positionToDelete.name}"? This will affect ${positionToDelete.employeeCount} employee(s). This action cannot be undone.`
            : "Are you sure you want to delete this position? This action cannot be undone."
        }
        itemName={positionToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </div>
  );
}
