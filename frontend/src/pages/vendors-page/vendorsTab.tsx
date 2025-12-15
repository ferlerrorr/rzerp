import { AddVendorDialog } from "@/components/add-vendor-dialog";
import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { VendorCard } from "@/components/card/vendorCard";
import { VendorFormData } from "@/stores/vendor";
import { DollarSign, TrendingUp, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface VendorCounts {
  totalVendors: string;
  totalPurchases: string;
  outstandingBalance: string;
  topVendor: string;
}

interface VendorCardConfig {
  title: string;
  dataKey: keyof VendorCounts;
  countColor:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
  bgColor: string;
  icon: typeof Truck | typeof DollarSign | typeof TrendingUp;
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

// Default vendors
const defaultVendors: Vendor[] = [
  {
    companyName: "Tech Supplies Inc.",
    category: "Electronics",
    status: "Active",
    phone: "+63 917 123 4567",
    email: "john@techsupplies.ph",
    location: "Makati City, Metro Manila",
    totalPurchases: "₱2,500,000",
    outstanding: "₱250,000",
    iconBgColor: "blue",
  },
  {
    companyName: "Office Solutions Co.",
    category: "Office Supplies",
    status: "Active",
    phone: "+63 917 234 5678",
    email: "info@officesolutions.ph",
    location: "Quezon City, Metro Manila",
    totalPurchases: "₱1,800,000",
    outstanding: "₱68,500",
    iconBgColor: "green",
  },
  {
    companyName: "Industrial Parts Ltd.",
    category: "Manufacturing",
    status: "Active",
    phone: "+63 917 345 6789",
    email: "sales@industrialparts.ph",
    location: "Pasig City, Metro Manila",
    totalPurchases: "₱950,000",
    outstanding: "₱0",
    iconBgColor: "purple",
  },
  {
    companyName: "Global Trading Corp.",
    category: "General Merchandise",
    status: "Inactive",
    phone: "+63 917 456 7890",
    email: "contact@globaltrading.ph",
    location: "Taguig City, Metro Manila",
    totalPurchases: "₱320,000",
    outstanding: "₱0",
    iconBgColor: "orange",
  },
];

// LocalStorage keys
const VENDORS_STORAGE_KEY = "rzerp_vendors";
const VENDORS_INITIALIZED_KEY = "rzerp_vendors_initialized";

// Helper functions for localStorage
const loadVendorsFromStorage = (): Vendor[] => {
  try {
    const stored = localStorage.getItem(VENDORS_STORAGE_KEY);
    const initialized = localStorage.getItem(VENDORS_INITIALIZED_KEY);

    // If not initialized yet, or if stored data is corrupted, use defaults
    if (!initialized || !stored) {
      saveVendorsToStorage(defaultVendors);
      localStorage.setItem(VENDORS_INITIALIZED_KEY, "true");
      return defaultVendors;
    }

    const vendors = JSON.parse(stored);

    // Check if all vendors have ₱0 totalPurchases (likely corrupted)
    const parseCurrency = (value: string | undefined | null) => {
      if (!value || typeof value !== "string") return 0;
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };

    const allHaveZeroPurchases = vendors.every((vendor: Vendor) => {
      const purchases = parseCurrency(vendor.totalPurchases);
      return purchases === 0;
    });

    // If all vendors have ₱0, reset to defaults (data was likely corrupted)
    if (allHaveZeroPurchases) {
      saveVendorsToStorage(defaultVendors);
      return defaultVendors;
    }

    // Ensure all vendors have required properties with defaults
    return vendors.map((vendor: Vendor) => ({
      ...vendor,
      totalPurchases: vendor.totalPurchases || "₱0",
      outstanding: vendor.outstanding || "₱0",
      iconBgColor: vendor.iconBgColor || "blue",
    }));
  } catch (error) {
    console.error("Error loading vendors from localStorage:", error);
    // Reset to defaults on error
    saveVendorsToStorage(defaultVendors);
    localStorage.setItem(VENDORS_INITIALIZED_KEY, "true");
    return defaultVendors;
  }
};

const saveVendorsToStorage = (vendors: Vendor[]) => {
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(vendors));
  } catch (error) {
    console.error("Error saving vendors to localStorage:", error);
  }
};

// Transform VendorFormData to Vendor
const transformFormDataToVendor = (formData: VendorFormData): Vendor => {
  // New vendors start with 0 purchases and outstanding balance
  const iconBgColors: Array<
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "gray"
    | "red"
  > = [
    "blue",
    "green",
    "purple",
    "orange",
    "pink",
    "indigo",
    "teal",
    "yellow",
    "gray",
    "red",
  ];

  // Assign icon color based on category or random
  const categoryIndex = formData.category.length % iconBgColors.length;
  const iconBgColor = iconBgColors[categoryIndex];

  return {
    companyName: formData.companyName.trim(),
    category: formData.category,
    status: formData.status,
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    location: formData.address.trim(),
    totalPurchases: "₱0",
    outstanding: "₱0",
    iconBgColor,
  };
};

const vendorCardConfig: VendorCardConfig[] = [
  {
    title: "Total Vendors",
    dataKey: "totalVendors",
    countColor: "black",
    bgColor: "bg-white",
    icon: Truck,
    iconBgColor: "blue",
    subtitle: "4 active vendors",
  },
  {
    title: "Total Purchases",
    dataKey: "totalPurchases",
    countColor: "black",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "green",
    subtitle: "year to date",
  },
  {
    title: "Outstanding Balance",
    dataKey: "outstandingBalance",
    countColor: "orange",
    bgColor: "bg-white",
    icon: DollarSign,
    iconBgColor: "orange",
    subtitle: "amount owed",
  },
  {
    title: "Top Vendor",
    dataKey: "topVendor",
    countColor: "black",
    bgColor: "bg-white",
    icon: Truck,
    iconBgColor: "purple",
    subtitle: "₱2.5M purchases",
  },
];

interface Vendor {
  companyName: string;
  category: string;
  status: "Active" | "Inactive";
  phone: string;
  email: string;
  location: string;
  totalPurchases: string;
  outstanding: string;
  iconBgColor?:
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
}

export function VendorsTab() {
  // Load vendors from localStorage on mount
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    loadVendorsFromStorage()
  );

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // Calculate vendor counts dynamically
  const vendorCounts = useMemo(() => {
    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseCurrency = (value: string | undefined | null) => {
      if (!value || typeof value !== "string") return 0;
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };

    const totalVendors = vendors.length;

    const totalPurchases = vendors.reduce(
      (sum, vendor) => sum + parseCurrency(vendor.totalPurchases),
      0
    );

    const outstandingBalance = vendors.reduce(
      (sum, vendor) => sum + parseCurrency(vendor.outstanding),
      0
    );

    // Find top vendor by total purchases
    const topVendor =
      vendors.length > 0
        ? vendors.reduce((top, vendor) => {
            const topPurchases = parseCurrency(top.totalPurchases);
            const vendorPurchases = parseCurrency(vendor.totalPurchases);
            return vendorPurchases > topPurchases ? vendor : top;
          })
        : null;

    return {
      totalVendors: totalVendors.toString(),
      totalPurchases: formatCurrency(totalPurchases),
      outstandingBalance: formatCurrency(outstandingBalance),
      topVendor: topVendor?.companyName || "N/A",
    };
  }, [vendors]);

  // Update card config with dynamic subtitles
  const vendorCardConfigWithSubtitle = useMemo(() => {
    const activeVendors = vendors.filter((v) => v.status === "Active").length;
    const parseCurrency = (value: string | undefined | null) => {
      if (!value || typeof value !== "string") return 0;
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };
    const topVendor =
      vendors.length > 0
        ? vendors.reduce((top, vendor) => {
            const topPurchases = parseCurrency(top.totalPurchases);
            const vendorPurchases = parseCurrency(vendor.totalPurchases);
            return vendorPurchases > topPurchases ? vendor : top;
          })
        : null;
    const topVendorPurchases = topVendor
      ? parseCurrency(topVendor.totalPurchases)
      : 0;
    const topVendorFormatted =
      topVendorPurchases >= 1000000
        ? `₱${(topVendorPurchases / 1000000).toFixed(1)}M`
        : `₱${(topVendorPurchases / 1000).toFixed(0)}K`;

    return vendorCardConfig.map((config) => {
      // Keep original subtitles but update dynamic ones
      if (config.dataKey === "totalVendors") {
        return { ...config, subtitle: `${activeVendors} active vendors` };
      } else if (config.dataKey === "topVendor") {
        return { ...config, subtitle: `${topVendorFormatted} purchases` };
      }
      // Keep original subtitle for other cards (totalPurchases: "year to date", outstandingBalance: "amount owed")
      return config;
    });
  }, [vendors]);

  // Handle vendor submission
  const handleVendorSubmit = (data: VendorFormData) => {
    try {
      // Transform form data to vendor format
      const newVendor = transformFormDataToVendor(data);

      // Add new vendor to the beginning of the list
      const updatedVendors = [newVendor, ...vendors];

      // Save to localStorage
      saveVendorsToStorage(updatedVendors);

      // Update state to trigger re-render
      setVendors(updatedVendors);

      // Show success toast
      toast.success("Vendor Added Successfully", {
        description: `${newVendor.companyName} has been added.`,
        duration: 3000,
      });

      console.log("Vendor added successfully:", newVendor);
    } catch (error) {
      console.error("Error adding vendor:", error);
      // Show error toast
      toast.error("Failed to Add Vendor", {
        description:
          "An error occurred while adding the vendor. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleViewDetails = (vendorName: string) => {
    console.log(`View details for ${vendorName}`);
  };

  const handleEdit = (vendorName: string) => {
    console.log(`Edit ${vendorName}`);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorCardConfigWithSubtitle.map((config) => (
          <SimpleCard
            key={config.dataKey}
            title={config.title}
            count={vendorCounts[config.dataKey]}
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
          addVendor={true}
          addVendorOrder={1}
          onAddVendorClick={() => setIsAddVendorOpen(true)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendors.map((vendor, index) => (
          <VendorCard
            key={index}
            companyName={vendor.companyName}
            category={vendor.category}
            status={vendor.status}
            phone={vendor.phone}
            email={vendor.email}
            location={vendor.location}
            totalPurchases={vendor.totalPurchases}
            outstanding={vendor.outstanding}
            iconBgColor={vendor.iconBgColor}
            onViewDetails={() => handleViewDetails(vendor.companyName)}
            onEdit={() => handleEdit(vendor.companyName)}
          />
        ))}
      </div>

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        open={isAddVendorOpen}
        onOpenChange={setIsAddVendorOpen}
        title="Add Vendor"
        onSubmit={handleVendorSubmit}
      />
    </div>
  );
}
