import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface ProductCounts {
  totalProducts: string;
  stockValue: string;
  potentialRevenue: string;
  lowStockItems: string;
}

interface ProductCardConfig {
  title: string;
  dataKey: keyof ProductCounts;
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
    | typeof Package
    | typeof DollarSign
    | typeof TrendingUp
    | typeof AlertTriangle;
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

const productCounts: ProductCounts = {
  totalProducts: "5",
  stockValue: "₱216,050",
  potentialRevenue: "₱316,700",
  lowStockItems: "2",
};

const productCardConfig: ProductCardConfig[] = [
  {
    title: "Total Products",
    dataKey: "totalProducts",
    countColor: "black",
    bgColor: "bg-white",
    icon: Package,
    iconBgColor: "blue",
  },
  {
    title: "Stock Value",
    dataKey: "stockValue",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "indigo",
  },
  {
    title: "Potential Revenue",
    dataKey: "potentialRevenue",
    countColor: "green",
    bgColor: "bg-white",
    icon: TrendingUp,
    iconBgColor: "green",
  },
  {
    title: "Low Stock Items",
    dataKey: "lowStockItems",
    countColor: "orange",
    bgColor: "bg-white",
    icon: AlertTriangle,
    iconBgColor: "orange",
  },
];

interface Product {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  cost: string;
  price: string;
  warehouse: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const products: Product[] = [
  {
    id: "1",
    sku: "SKU-001",
    productName: "Laptop Pro 15",
    category: "Electronics",
    quantity: 25,
    reorderLevel: 10,
    cost: "₱45,000",
    price: "₱65,000",
    warehouse: "Main Warehouse",
    status: "In Stock",
  },
  {
    id: "2",
    sku: "SKU-002",
    productName: "Wireless Mouse",
    category: "Accessories",
    quantity: 35,
    reorderLevel: 20,
    cost: "₱850",
    price: "₱1,200",
    warehouse: "Main Warehouse",
    status: "In Stock",
  },
  {
    id: "3",
    sku: "SKU-003",
    productName: "Keyboard Mechanical",
    category: "Accessories",
    quantity: 5,
    reorderLevel: 15,
    cost: "₱2,500",
    price: "₱3,800",
    warehouse: "Main Warehouse",
    status: "Low Stock",
  },
  {
    id: "4",
    sku: "SKU-004",
    productName: "Monitor 27inch",
    category: "Electronics",
    quantity: 12,
    reorderLevel: 8,
    cost: "₱12,000",
    price: "₱18,500",
    warehouse: "Secondary Warehouse",
    status: "In Stock",
  },
  {
    id: "5",
    sku: "SKU-005",
    productName: "USB-C Cable",
    category: "Accessories",
    quantity: 0,
    reorderLevel: 50,
    cost: "₱250",
    price: "₱450",
    warehouse: "Main Warehouse",
    status: "Out of Stock",
  },
];

const productColumns: ColumnDef<Product>[] = [
  {
    header: "SKU",
    accessor: "sku",
    className: "font-medium",
  },
  {
    header: "Product Name",
    accessor: "productName",
    className: "font-medium",
  },
  {
    header: "Category",
    accessor: "category",
  },
  {
    header: "Quantity",
    accessor: "quantity",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Reorder Level",
    accessor: "reorderLevel",
    className: "text-center",
    headerClassName: "text-center",
  },
  {
    header: "Cost",
    accessor: "cost",
    className: "font-semibold",
  },
  {
    header: "Price",
    accessor: "price",
    className: "font-semibold",
  },
  {
    header: "Warehouse",
    accessor: "warehouse",
  },
  {
    header: "Status",
    accessor: "status",
    useBadge: true,
    badgeVariantMap: {
      "In Stock": "success",
      "Low Stock": "warning",
      "Out of Stock": "error",
    },
    className: "text-center",
    headerClassName: "text-center",
  },
];

const productActions: ActionItem<Product>[] = [
  {
    label: "View",
    icon: Eye,
    onClick: (product) => {
      console.log("View product:", product);
    },
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (product) => {
      console.log("Edit product:", product);
    },
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (product) => {
      console.log("Delete product:", product);
    },
    variant: "destructive",
  },
];

export function ProductTab() {
  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {productCardConfig.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={productCounts[config.dataKey]}
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

        <AppButtons
          filter={false}
          add={false}
          addProduct={true}
          addProductOrder={1}
        />
      </div>
      <div className="w-full">
        <AppTable
          data={products}
          columns={productColumns}
          actions={productActions}
          itemsPerPage={5}
          minWidth="1400px"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
