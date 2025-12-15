import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef } from "@/components/table/appTable";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Activity,
} from "lucide-react";

interface StockMovementCounts {
  stockInToday: string;
  stockOutToday: string;
  transfers: string;
  totalMovements: string;
}

interface StockMovementCardConfig {
  title: string;
  dataKey: keyof StockMovementCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon:
    | typeof ArrowDownCircle
    | typeof ArrowUpCircle
    | typeof ArrowRightLeft
    | typeof Activity;
  iconBgColor:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray"
    | "red";
  subtitle?: string;
}

const stockMovementCounts: StockMovementCounts = {
  stockInToday: "70",
  stockOutToday: "25",
  transfers: "1",
  totalMovements: "4",
};

const stockMovementCardConfig: StockMovementCardConfig[] = [
  {
    title: "Stock In (Today)",
    dataKey: "stockInToday",
    countColor: "green",
    bgColor: "bg-white",
    icon: ArrowDownCircle,
    iconBgColor: "green",
  },
  {
    title: "Stock Out (Today)",
    dataKey: "stockOutToday",
    countColor: "red",
    bgColor: "bg-white",
    icon: ArrowUpCircle,
    iconBgColor: "red",
  },
  {
    title: "Transfers",
    dataKey: "transfers",
    countColor: "blue",
    bgColor: "bg-white",
    icon: ArrowRightLeft,
    iconBgColor: "blue",
  },
  {
    title: "Total Movements",
    dataKey: "totalMovements",
    countColor: "black",
    bgColor: "bg-white",
    icon: Activity,
    iconBgColor: "indigo",
  },
];

interface StockMovement {
  id: string;
  date: string;
  product: string;
  type: "Stock In" | "Stock Out" | "Transfer";
  quantity: number;
  from: string;
  to: string;
  reference: string;
  user: string;
}

const stockMovements: StockMovement[] = [
  {
    id: "1",
    date: "2024-12-15",
    product: "Laptop Pro 15",
    type: "Stock In",
    quantity: 15,
    from: "Supplier",
    to: "Main Warehouse",
    reference: "PO-2024-001",
    user: "John Doe",
  },
  {
    id: "2",
    date: "2024-12-15",
    product: "Wireless Mouse",
    type: "Stock Out",
    quantity: 10,
    from: "Main Warehouse",
    to: "Customer",
    reference: "SO-2024-045",
    user: "Jane Smith",
  },
  {
    id: "3",
    date: "2024-12-14",
    product: "Keyboard Mechanical",
    type: "Transfer",
    quantity: 5,
    from: "Main Warehouse",
    to: "Secondary Warehouse",
    reference: "TR-2024-012",
    user: "Mike Johnson",
  },
  {
    id: "4",
    date: "2024-12-14",
    product: "Monitor 27inch",
    type: "Stock In",
    quantity: 8,
    from: "Supplier",
    to: "Main Warehouse",
    reference: "PO-2024-002",
    user: "Sarah Williams",
  },
  {
    id: "5",
    date: "2024-12-13",
    product: "USB-C Cable",
    type: "Stock Out",
    quantity: 25,
    from: "Main Warehouse",
    to: "Customer",
    reference: "SO-2024-044",
    user: "John Doe",
  },
];

const stockMovementColumns: ColumnDef<StockMovement>[] = [
  {
    header: "Date",
    accessor: "date",
  },
  {
    header: "Product",
    accessor: "product",
    className: "font-medium",
  },
  {
    header: "Type",
    accessor: "type",
    useBadge: true,
    badgeVariantMap: {
      "Stock In": "success",
      "Stock Out": "error",
      Transfer: "info",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Quantity",
    accessor: "quantity",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "From",
    accessor: "from",
  },
  {
    header: "To",
    accessor: "to",
  },
  {
    header: "Reference",
    accessor: "reference",
    className: "font-medium",
  },
  {
    header: "User",
    accessor: "user",
  },
];

export function StockMovementsTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stockMovementCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={stockMovementCounts[config.dataKey]}
            subtitle={config.subtitle}
            countColor={config.countColor}
            icon={config.icon}
            iconBgColor={config.iconBgColor}
            className={config.bgColor}
          />
        ))}
      </div>
      <div className="flex flex-row sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mt-1">
        {/* Left side: Search and Filter */}
        <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1 w-full sm:w-auto">
          <div className="flex-1 w-full sm:max-w-[20rem] min-w-0">
            <AppSearch />
          </div>
        </div>
        {/* Right side: Add Button */}
        <AppButtons filter={true} add={false} />
      </div>
      <div className="w-full">
        <AppTable
          data={stockMovements}
          columns={stockMovementColumns}
          itemsPerPage={5}
          minWidth="1400px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
