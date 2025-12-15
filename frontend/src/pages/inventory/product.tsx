import { useState, useMemo } from "react";
import { toast } from "sonner";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { AppTable, ColumnDef, ActionItem } from "@/components/table/appTable";
import { AddProductDialog } from "@/components/dialogs/add-product-dialog";
import { ProductFormData } from "@/stores/product";
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

// Default products
const defaultProducts: Product[] = [
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

// LocalStorage keys
const PRODUCTS_STORAGE_KEY = "rzerp_products";
const PRODUCT_COUNTER_KEY = "rzerp_product_counter";

// Helper functions for localStorage
const loadProductsFromStorage = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default products if no data exists
    saveProductsToStorage(defaultProducts);
    // Initialize counter
    if (!localStorage.getItem(PRODUCT_COUNTER_KEY)) {
      localStorage.setItem(PRODUCT_COUNTER_KEY, "5");
    }
    return defaultProducts;
  } catch (error) {
    console.error("Error loading products from localStorage:", error);
    return defaultProducts;
  }
};

const saveProductsToStorage = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products to localStorage:", error);
  }
};

const getNextProductId = (): string => {
  try {
    const counter = parseInt(
      localStorage.getItem(PRODUCT_COUNTER_KEY) || "5",
      10
    );
    const nextCounter = counter + 1;
    localStorage.setItem(PRODUCT_COUNTER_KEY, nextCounter.toString());
    return nextCounter.toString();
  } catch (error) {
    console.error("Error getting next product ID:", error);
    return Date.now().toString();
  }
};

// Calculate product status based on quantity and reorder level
const calculateProductStatus = (
  quantity: number,
  reorderLevel: number
): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (quantity === 0) {
    return "Out of Stock";
  }
  if (quantity <= reorderLevel) {
    return "Low Stock";
  }
  return "In Stock";
};

// Transform ProductFormData to Product
const transformFormDataToProduct = (formData: ProductFormData): Product => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const quantity = parseInt(formData.initialQuantity) || 0;
  const reorderLevel = parseInt(formData.reorderLevel) || 0;
  const cost = parseFloat(formData.costPrice) || 0;
  const price = parseFloat(formData.sellingPrice) || 0;
  const status = calculateProductStatus(quantity, reorderLevel);

  return {
    id: getNextProductId(),
    sku: formData.sku.trim(),
    productName: formData.productName.trim(),
    category: formData.category,
    quantity,
    reorderLevel,
    cost: formatCurrency(cost),
    price: formatCurrency(price),
    warehouse: formData.warehouse,
    status,
  };
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

export function ProductTab() {
  // Load products from localStorage on mount
  const [products, setProducts] = useState<Product[]>(() =>
    loadProductsFromStorage()
  );

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Calculate product counts dynamically
  const productCounts = useMemo(() => {
    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseCurrency = (value: string) => {
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };

    const totalProducts = products.length;

    const stockValue = products.reduce((sum, product) => {
      const cost = parseCurrency(product.cost);
      return sum + cost * product.quantity;
    }, 0);

    const potentialRevenue = products.reduce((sum, product) => {
      const price = parseCurrency(product.price);
      return sum + price * product.quantity;
    }, 0);

    const lowStockItems = products.filter(
      (product) =>
        product.status === "Low Stock" || product.status === "Out of Stock"
    ).length;

    return {
      totalProducts: totalProducts.toString(),
      stockValue: formatCurrency(stockValue),
      potentialRevenue: formatCurrency(potentialRevenue),
      lowStockItems: lowStockItems.toString(),
    };
  }, [products]);

  // Handle product submission
  const handleProductSubmit = (data: ProductFormData) => {
    try {
      // Transform form data to product format
      const newProduct = transformFormDataToProduct(data);

      // Add new product to the beginning of the list
      const updatedProducts = [newProduct, ...products];

      // Save to localStorage
      saveProductsToStorage(updatedProducts);

      // Update state to trigger re-render
      setProducts(updatedProducts);

      // Show success toast
      toast.success("Product Added Successfully", {
        description: `${newProduct.productName} has been added to inventory.`,
        duration: 3000,
      });

      console.log("Product added successfully:", newProduct);
    } catch (error) {
      console.error("Error adding product:", error);
      // Show error toast
      toast.error("Failed to Add Product", {
        description:
          "An error occurred while adding the product. Please try again.",
        duration: 4000,
      });
    }
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    try {
      const updatedProducts = products.filter((p) => p.id !== product.id);
      saveProductsToStorage(updatedProducts);
      setProducts(updatedProducts);

      toast.success("Product Deleted", {
        description: `${product.productName} has been deleted.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to Delete Product", {
        description: "An error occurred while deleting the product.",
        duration: 4000,
      });
    }
  };

  // Update actions with delete handler
  const productActions = useMemo<ActionItem<Product>[]>(
    () => [
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
        onClick: handleDeleteProduct,
        variant: "destructive",
      },
    ],
    [products]
  );

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
          onAddProductClick={() => setIsAddProductOpen(true)}
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

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        title="Add Product"
        onSubmit={handleProductSubmit}
      />
    </div>
  );
}
