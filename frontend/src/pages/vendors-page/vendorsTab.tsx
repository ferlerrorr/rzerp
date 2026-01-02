import { AddVendorDialog } from "@/components/dialogs/add-vendor-dialog";
import { AppButtons } from "@/components/common/app-Buttons";
import { AppSearch } from "@/components/common/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { VendorCard } from "@/components/card/vendorCard";
import {
  useVendorStore,
  VendorFromAPI,
} from "@/stores/vendor";
import { DollarSign, TrendingUp, Truck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

// Vendor Data for display
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

// Transform API vendor to display format
const transformApiVendorToVendor = (
  apiVendor: VendorFromAPI
): Vendor => {
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalPurchases = parseFloat(apiVendor.total_purchases) || 0;
  const outstanding = parseFloat(apiVendor.outstanding) || 0;

  // Assign icon color based on category
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
  const categoryIndex = apiVendor.category.length % iconBgColors.length;
  const iconBgColor = iconBgColors[categoryIndex];

  return {
    companyName: apiVendor.company_name,
    category: apiVendor.category,
    status: apiVendor.status,
    phone: apiVendor.phone,
    email: apiVendor.email,
    location: apiVendor.address,
    totalPurchases: formatCurrency(totalPurchases),
    outstanding: formatCurrency(outstanding),
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
    subtitle: "active vendors",
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
    subtitle: "purchases",
  },
];

// Skeleton components
const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-40" />
  </div>
);

const VendorCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border p-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export function VendorsTab() {
  const {
    vendors: apiVendors,
    loading,
    error,
    fetchVendors,
  } = useVendorStore();

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // Fetch vendors on mount
  useEffect(() => {
    // Set high per_page to get all vendors
    const { setFilters } = useVendorStore.getState();
    setFilters({ per_page: 1000 });
    fetchVendors();
  }, [fetchVendors]);

  // Transform API vendors to display format
  const vendors = useMemo(() => {
    return apiVendors.map(transformApiVendorToVendor);
  }, [apiVendors]);

  // Calculate vendor counts dynamically
  const vendorCounts = useMemo(() => {
    // If no vendors, return "0" for all counts
    if (vendors.length === 0) {
      return {
        totalVendors: "0",
        totalPurchases: "0",
        outstandingBalance: "0",
        topVendor: "N/A",
      };
    }

    const formatCurrency = (amount: number): string => {
      return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseCurrency = (value: string) => {
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
    const topVendor = vendors.reduce((top, vendor) => {
      const topPurchases = parseCurrency(top.totalPurchases);
      const vendorPurchases = parseCurrency(vendor.totalPurchases);
      return vendorPurchases > topPurchases ? vendor : top;
    });

    return {
      totalVendors: totalVendors.toString(),
      totalPurchases: formatCurrency(totalPurchases),
      outstandingBalance: formatCurrency(outstandingBalance),
      topVendor: topVendor.companyName,
    };
  }, [vendors]);

  // Update card config with dynamic subtitles
  const vendorCardConfigWithSubtitle = useMemo(() => {
    // If no vendors, return subtitles with "0"
    if (vendors.length === 0) {
      return vendorCardConfig.map((config) => {
        if (config.dataKey === "totalVendors") {
          return { ...config, subtitle: "0 active vendors" };
        } else if (config.dataKey === "topVendor") {
          return { ...config, subtitle: "N/A purchases" };
        }
        return config;
      });
    }

    const activeVendors = vendors.filter((v) => v.status === "Active").length;
    const parseCurrency = (value: string) => {
      return parseFloat(value.replace(/[₱,]/g, "")) || 0;
    };
    const topVendor = vendors.reduce((top, vendor) => {
      const topPurchases = parseCurrency(top.totalPurchases);
      const vendorPurchases = parseCurrency(vendor.totalPurchases);
      return vendorPurchases > topPurchases ? vendor : top;
    });
    const topVendorPurchases = parseCurrency(topVendor.totalPurchases);
    const topVendorFormatted =
      topVendorPurchases >= 1000000
        ? `₱${(topVendorPurchases / 1000000).toFixed(1)}M`
        : `₱${(topVendorPurchases / 1000).toFixed(0)}K`;

    return vendorCardConfig.map((config) => {
      if (config.dataKey === "totalVendors") {
        return { ...config, subtitle: `${activeVendors} active vendors` };
      } else if (config.dataKey === "topVendor") {
        return { ...config, subtitle: `${topVendorFormatted} purchases` };
      }
      return config;
    });
  }, [vendors]);

  // Handle vendor submission
  const handleVendorSubmit = async () => {
    // The dialog already handles the API call via the store
    // Just refresh the vendors list
    await fetchVendors();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Vendors", {
        description: error,
        duration: 4000,
      });
    }
  }, [error]);

  const handleViewDetails = (vendorName: string) => {
    console.log(`View details for ${vendorName}`);
  };

  const handleEdit = (vendorName: string) => {
    console.log(`Edit ${vendorName}`);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      {loading && vendors.length === 0 ? (
        <>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Skeleton Vendor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <VendorCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Always show cards */}
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
          
          {/* Always show search and button */}
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
          
          {/* Always show vendor cards */}
          {vendors.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No vendors</p>
            </div>
          ) : (
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
          )}
        </>
      )}

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
