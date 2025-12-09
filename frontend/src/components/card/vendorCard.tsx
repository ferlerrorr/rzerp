import { Truck, LucideIcon, Phone, Mail, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export interface VendorCardProps {
  companyName: string;
  category: string;
  status: "Active" | "Inactive";
  phone: string;
  email: string;
  location: string;
  totalPurchases: string;
  outstanding: string;
  icon?: LucideIcon;
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
  onViewDetails?: () => void;
  onEdit?: () => void;
  className?: string;
}

const iconBgColors = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
  orange: "bg-orange-100",
  pink: "bg-pink-100",
  indigo: "bg-indigo-100",
  teal: "bg-teal-100",
  yellow: "bg-yellow-100",
  gray: "bg-gray-100",
  red: "bg-red-100",
};

const iconColors = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  pink: "text-pink-600",
  indigo: "text-indigo-600",
  teal: "text-teal-600",
  yellow: "text-yellow-600",
  gray: "text-gray-600",
  red: "text-red-600",
};

export function VendorCard({
  companyName,
  category,
  status,
  phone,
  email,
  location,
  totalPurchases,
  outstanding,
  icon: Icon = Truck,
  iconBgColor = "blue",
  onViewDetails,
  onEdit,
  className,
}: VendorCardProps) {
  return (
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "rounded-lg p-1.5 sm:p-2.5 flex-shrink-0",
                iconBgColors[iconBgColor],
                iconColors[iconBgColor]
              )}
            >
              <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1 truncate">
                {companyName}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {category}
              </p>
            </div>
          </div>
          <Badge
            variant={status === "Active" ? "success" : "default"}
            className={cn(
              "ml-1 sm:ml-2 flex-shrink-0 text-[10px] sm:text-xs",
              status === "Inactive" &&
                "bg-gray-100 text-black border-transparent hover:bg-gray-200"
            )}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        <div className="space-y-2 sm:space-y-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {phone}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {email}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {location}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Total Purchases:
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate ml-2">
              {totalPurchases}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">
              Outstanding:
            </span>
            <span className="text-xs sm:text-sm font-medium text-orange-600 truncate ml-2">
              {outstanding}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 sm:pt-4 pb-4 sm:pb-5 gap-1.5 sm:gap-2 px-4 sm:px-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
        >
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onEdit}
          className="flex-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 transition-colors duration-200"
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
