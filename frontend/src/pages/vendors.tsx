import { AppButtons } from "@/components/app-Buttons";
import { AppSearch } from "@/components/app-Serach";
import { SimpleCard } from "@/components/card/simpleCard";
import { VendorCard } from "@/components/card/vendorCard";
import { Truck, DollarSign, TrendingUp } from "lucide-react";

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

const vendorCounts: VendorCounts = {
  totalVendors: "4",
  totalPurchases: "₱3,592,000",
  outstandingBalance: "₱318,500",
  topVendor: "Tech Supplies Inc.",
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

const vendors: Vendor[] = [
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

export function VendorsPage() {
  const handleViewDetails = (vendorName: string) => {
    console.log(`View details for ${vendorName}`);
  };

  const handleEdit = (vendorName: string) => {
    console.log(`Edit ${vendorName}`);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorCardConfig.map((config) => (
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
    </div>
  );
}
