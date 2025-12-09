import { AppButtons } from "@/components/app-Buttons";
import { WarehouseCard } from "@/components/card/warehouseCard";

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

const warehouses: Warehouse[] = [
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

export function WarehouseTab() {
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
    </div>
  );
}
