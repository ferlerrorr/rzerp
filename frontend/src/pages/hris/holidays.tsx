import { useState, useMemo, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import {
  useHolidayStore,
  HolidayFromAPI,
} from "@/stores/holiday";
import { useSearchStore } from "@/stores/search";

// Holiday interface for display
interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  isActive: boolean;
}

// Transform HolidayFromAPI to Holiday for display
const transformHolidayFromAPI = (holiday: HolidayFromAPI): Holiday => {
  return {
    id: holiday.id.toString(),
    name: holiday.name,
    date: holiday.date,
    type: holiday.type === "regular" ? "Regular" : "Special Non-Working",
    isActive: holiday.is_active,
  };
};

// Table column definitions
const holidayColumns: ColumnDef<Holiday>[] = [
  {
    header: "Date",
    accessor: "date",
    cell: (row) => {
      const date = new Date(row.date);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    className: "font-medium",
  },
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Type",
    accessor: "type",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Status",
    accessor: "isActive",
    cell: (row) => (row.isActive ? "Active" : "Inactive"),
    useBadge: true,
    badgeVariantMap: {
      Active: "success",
      Inactive: "warning",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

export function HolidaysTab() {
  const {
    holidays: holidaysFromAPI,
    loading,
    error,
    fetchHolidays,
    getHoliday,
    deleteHoliday,
    setFilters,
  } = useHolidayStore();
  const { query: searchQuery } = useSearchStore();
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);
  const [_isEditHolidayOpen, setIsEditHolidayOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [_editingHolidayId, setEditingHolidayId] = useState<number | undefined>();
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  // Fetch holidays on mount and when search changes
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Update store filters when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setFilters({ search: searchQuery || undefined });
      fetchHolidays();
    }
  }, [searchQuery, setFilters, fetchHolidays]);

  // Transform API holidays to display format
  const holidays = useMemo(() => {
    return holidaysFromAPI.map(transformHolidayFromAPI);
  }, [holidaysFromAPI]);

  // Filter holidays based on search
  const filteredHolidays = useMemo(() => {
    if (!searchQuery) return holidays;
    const query = searchQuery.toLowerCase();
    return holidays.filter(
      (holiday) =>
        holiday.name.toLowerCase().includes(query) ||
        holiday.date.toLowerCase().includes(query)
    );
  }, [holidays, searchQuery]);

  // Handle holiday creation submission (for future dialog implementation)
  // TODO: Implement when dialog is created
  // const handleHolidaySubmit = async (data: Record<string, any>) => {
  //   try {
  //     const newHoliday = await createHoliday(data);
  //     if (newHoliday) {
  //       toast.success("Holiday Created Successfully", {
  //         description: `${newHoliday.name} has been created.`,
  //         duration: 3000,
  //       });
  //       setIsAddHolidayOpen(false);
  //     }
  //   } catch (err) {
  //     console.error("Error creating holiday:", err);
  //   }
  // };

  // Handle edit holiday
  const handleEditHoliday = async (holiday: Holiday) => {
    try {
      const holidayData = await getHoliday(parseInt(holiday.id));
      if (holidayData) {
        setEditingHolidayId(holidayData.id);
        setIsEditHolidayOpen(true);
      } else {
        toast.error("Failed to Load Holiday", {
          description: "Could not load holiday details for editing.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error loading holiday:", err);
      toast.error("Failed to Load Holiday", {
        description: "An error occurred while loading holiday details.",
        duration: 4000,
      });
    }
  };

  // Handle holiday update submission (for future dialog implementation)
  // TODO: Implement when dialog is created
  // const handleHolidayUpdate = async (data: Record<string, any>) => {
  //   if (!editingHolidayId) return;
  //   try {
  //     const updatedHoliday = await updateHoliday(editingHolidayId, data);
  //     if (updatedHoliday) {
  //       toast.success("Holiday Updated Successfully", {
  //         description: `${updatedHoliday.name} has been updated.`,
  //         duration: 3000,
  //       });
  //       setIsEditHolidayOpen(false);
  //       setEditingHolidayId(undefined);
  //       await fetchHolidays();
  //     }
  //   } catch (err) {
  //     console.error("Error updating holiday:", err);
  //     toast.error("Failed to Update Holiday", {
  //       description: "An error occurred while updating the holiday.",
  //       duration: 4000,
  //     });
  //   }
  // };

  // Handle delete button click
  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;

    try {
      const success = await deleteHoliday(parseInt(holidayToDelete.id));
      if (success) {
        toast.success("Holiday Deleted Successfully", {
          description: `${holidayToDelete.name} has been removed.`,
          duration: 3000,
        });
        setIsDeleteDialogOpen(false);
        setHolidayToDelete(null);
      } else {
        toast.error("Failed to Delete Holiday", {
          description:
            error || "An error occurred while deleting the holiday.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error deleting holiday:", err);
      toast.error("Failed to Delete Holiday", {
        description: "An error occurred while deleting the holiday.",
        duration: 4000,
      });
    }
  };

  // Holiday actions
  const holidayActions: ActionItem<Holiday>[] = [
    {
      label: "View",
      icon: Eye,
      onClick: (holiday) => {
        console.log("View holiday:", holiday);
      },
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEditHoliday,
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
        <AppButtons
          filter={false}
          add={true}
          addOrder={1}
          addLabel="Add Holiday"
          onAddClick={() => setIsAddHolidayOpen(true)}
        />
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading holidays...</p>
          </div>
        ) : (
          <AppTable
            data={filteredHolidays}
            columns={holidayColumns}
            actions={holidayActions}
            itemsPerPage={10}
            caption="A list of holidays."
            minWidth="800px"
            getRowId={(row) => row.id}
          />
        )}
      </div>

      {/* Add/Edit Holiday Dialog - would need to create this component */}
      {/* For now, using placeholder */}
      {isAddHolidayOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Add Holiday Dialog - To be implemented</p>
            <button onClick={() => setIsAddHolidayOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Holiday"
        description={
          holidayToDelete
            ? `Are you sure you want to delete "${holidayToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this holiday? This action cannot be undone."
        }
        itemName={holidayToDelete?.name}
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </div>
  );
}

