import { TriangleAlert, ShoppingCart } from "lucide-react";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";

interface LowStockProduct {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  shortage: number;
  supplier: string;
}

const lowStockProducts: LowStockProduct[] = [
  {
    id: "1",
    sku: "SKU-003",
    productName: "Keyboard Mechanical",
    currentStock: 5,
    reorderLevel: 15,
    shortage: 10,
    supplier: "Tech Supplies Inc.",
  },
  {
    id: "2",
    sku: "SKU-006",
    productName: "HDMI Cable",
    currentStock: 8,
    reorderLevel: 20,
    shortage: 12,
    supplier: "Cable Solutions Ltd.",
  },
  {
    id: "3",
    sku: "SKU-007",
    productName: "Webcam HD",
    currentStock: 3,
    reorderLevel: 10,
    shortage: 7,
    supplier: "Tech Supplies Inc.",
  },
  {
    id: "4",
    sku: "SKU-008",
    productName: "USB Hub",
    currentStock: 6,
    reorderLevel: 15,
    shortage: 9,
    supplier: "Accessories Co.",
  },
  {
    id: "5",
    sku: "SKU-009",
    productName: "Laptop Stand",
    currentStock: 4,
    reorderLevel: 12,
    shortage: 8,
    supplier: "Office Equipment Corp.",
  },
];

const lowStockColumns: ColumnDef<LowStockProduct>[] = [
  {
    header: "SKU",
    accessor: "sku",
    className: "font-medium",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300",
  },
  {
    header: "Product Name",
    accessor: "productName",
    className: "font-medium",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300",
  },
  {
    header: "Current Stock",
    accessor: "currentStock",
    className: "text-center",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300 text-center",
  },
  {
    header: "Reorder Level",
    accessor: "reorderLevel",
    className: "text-center",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300 text-center",
  },
  {
    header: "Shortage",
    accessor: "shortage",
    cell: (row) => {
      return (
        <span className="text-red-600 font-semibold text-center block">
          {row.shortage}
        </span>
      );
    },
    className: "text-center",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300 text-center",
  },
  {
    header: "Supplier",
    accessor: "supplier",
    headerClassName:
      "!bg-orange-50 !text-orange-700 border-b-2 border-orange-300",
  },
];

const lowStockActions: ActionItem<LowStockProduct>[] = [
  {
    label: "Create PO",
    icon: ShoppingCart,
    onClick: (product) => {
      console.log("Create PO for product:", product);
    },
  },
];

export function LowStockAlertsTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-row gap-2 items-center">
        <TriangleAlert className="w-6 h-6 text-red-500" />
        <h1 className="text-base font-semibold text-gray-900">
          Low Stock Alerts
        </h1>
      </div>
      <div className="w-full">
        <style>{`
          .low-stock-table thead tr th:last-child {
            background-color: rgb(255 247 237) !important;
            color: rgb(194 65 12) !important;
            border-bottom: 2px solid rgb(253 186 116) !important;
          }
        `}</style>
        <div className="rounded-lg overflow-hidden low-stock-table">
          <AppTable
            data={lowStockProducts}
            columns={lowStockColumns}
            actions={lowStockActions}
            itemsPerPage={5}
            minWidth="1200px"
            getRowId={(row) => row.id}
          />
        </div>
      </div>
    </div>
  );
}
