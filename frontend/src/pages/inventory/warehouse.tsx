import { useState } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/app-Buttons";
import { WarehouseCard } from "@/components/card/warehouseCard";
import { AddWarehouseDialog } from "@/components/add-warehouse-dialog";
import { WarehouseFormData } from "@/stores/warehouse";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Inactive";
  manager: string;
  capacity: string;
  currentStock: string;
  utilization: number;
}

// Default warehouses
const defaultWarehouses: Warehouse[] = [
  {
    id: "1",
    name: "Main Warehouse",
    location: "Quezon City, Metro Manila",
    status: "Active",
    manager: "Juan Dela Cruz",
    capacity: "10,000 units",
    currentStock: "7,850 units",
    utilization: 78.5,
  },
  {
    id: "2",
    name: "Secondary Warehouse",
    location: "Makati City, Metro Manila",
    status: "Active",
    manager: "Maria Santos",
    capacity: "8,000 units",
    currentStock: "5,200 units",
    utilization: 65.0,
  },
  {
    id: "3",
    name: "Distribution Center",
    location: "Pasig City, Metro Manila",
    status: "Active",
    manager: "Carlos Reyes",
    capacity: "12,000 units",
    currentStock: "9,600 units",
    utilization: 80.0,
  },
  {
    id: "4",
    name: "Storage Facility",
    location: "Taguig City, Metro Manila",
    status: "Inactive",
    manager: "Ana Garcia",
    capacity: "6,000 units",
    currentStock: "1,200 units",
    utilization: 20.0,
  },
];

// LocalStorage keys
const WAREHOUSES_STORAGE_KEY = "rzerp_warehouses";
const WAREHOUSE_COUNTER_KEY = "rzerp_warehouse_counter";

// Helper functions for localStorage
const loadWarehousesFromStorage = (): Warehouse[] => {
  try {
    const stored = localStorage.getItem(WAREHOUSES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default warehouses if no data exists
    saveWarehousesToStorage(defaultWarehouses);
    // Initialize counter
    if (!localStorage.getItem(WAREHOUSE_COUNTER_KEY)) {
      localStorage.setItem(WAREHOUSE_COUNTER_KEY, "4");
    }
    return defaultWarehouses;
  } catch (error) {
    console.error("Error loading warehouses from localStorage:", error);
    return defaultWarehouses;
  }
};

const saveWarehousesToStorage = (warehouses: Warehouse[]) => {
  try {
    localStorage.setItem(WAREHOUSES_STORAGE_KEY, JSON.stringify(warehouses));
  } catch (error) {
    console.error("Error saving warehouses to localStorage:", error);
  }
};

const getNextWarehouseId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(WAREHOUSE_COUNTER_KEY) || "4",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(WAREHOUSE_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next warehouse ID:", error);
    return Date.now().toString();
  }
};

// Calculate utilization based on capacity and current stock
const calculateUtilization = (
  capacity: string,
  currentStock: string
): number => {
  const parseUnits = (value: string): number => {
    return parseInt(value.replace(/[,\s]units?/gi, "").trim()) || 0;
  };

  const capacityNum = parseUnits(capacity);
  const stockNum = parseUnits(currentStock);

  if (capacityNum === 0) return 0;
  return Math.round((stockNum / capacityNum) * 100 * 10) / 10; // Round to 1 decimal
};

// Transform WarehouseFormData to Warehouse
const transformFormDataToWarehouse = (
  formData: WarehouseFormData
): Warehouse => {
  // New warehouses start with 0 current stock
  const capacity = formData.capacity.trim();
  const currentStock = "0 units";
  const utilization = calculateUtilization(capacity, currentStock);

  return {
    id: getNextWarehouseId(),
    name: formData.name.trim(),
    location: formData.location.trim(),
    status: formData.status,
    manager: formData.manager.trim(),
    capacity,
    currentStock,
    utilization,
  };
};

export function WarehouseTab() {
  // Load warehouses from localStorage on mount
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    loadWarehousesFromStorage()
  );

  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);

  // Handle warehouse submission
  const handleWarehouseSubmit = (data: WarehouseFormData) => {
    try {
      // Transform form data to warehouse format
      const newWarehouse = transformFormDataToWarehouse(data);

      // Add new warehouse to the beginning of the list
      const updatedWarehouses = [newWarehouse, ...warehouses];

      // Save to localStorage
      saveWarehousesToStorage(updatedWarehouses);

      // Update state to trigger re-render
      setWarehouses(updatedWarehouses);

      // Show success toast
      toast.success("Warehouse Added Successfully", {
        description: `${newWarehouse.name} has been added.`,
        duration: 3000,
      });

      console.log("Warehouse added successfully:", newWarehouse);
    } catch (error) {
      console.error("Error adding warehouse:", error);
      // Show error toast
      toast.error("Failed to Add Warehouse", {
        description:
          "An error occurred while adding the warehouse. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleViewDetails = (warehouseId: string) => {
    console.log("View details for warehouse:", warehouseId);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-base font-semibold text-gray-900">Warehouse</h1>
        <AppButtons
          filter={false}
          add={false}
          addWarehouse={true}
          addWarehouseOrder={1}
          onAddWarehouseClick={() => setIsAddWarehouseOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((warehouse) => (
          <WarehouseCard
            key={warehouse.id}
            name={warehouse.name}
            location={warehouse.location}
            status={warehouse.status}
            manager={warehouse.manager}
            capacity={warehouse.capacity}
            currentStock={warehouse.currentStock}
            utilization={warehouse.utilization}
            onViewDetails={() => handleViewDetails(warehouse.id)}
          />
        ))}
      </div>

      {/* Add Warehouse Dialog */}
      <AddWarehouseDialog
        open={isAddWarehouseOpen}
        onOpenChange={setIsAddWarehouseOpen}
        title="Add Warehouse"
        onSubmit={handleWarehouseSubmit}
      />
    </div>
  );
}
