import { Warehouse, LucideIcon } from "lucide-react";
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

export interface WarehouseCardProps {
  name: string;
  location: string;
  status: "Active" | "Inactive";
  manager: string;
  capacity: string;
  currentStock: string;
  utilization: number; // percentage 0-100
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

export function WarehouseCard({
  name,
  location,
  status,
  manager,
  capacity,
  currentStock,
  utilization,
  icon: Icon = Warehouse,
  iconBgColor = "blue",
  onViewDetails,
  className,
}: WarehouseCardProps) {
  const utilizationPercentage = Math.min(Math.max(utilization, 0), 100);

  return (
    <Card className={cn("bg-white border border-gray-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={cn(
                "rounded-lg p-2.5",
                iconBgColors[iconBgColor],
                iconColors[iconBgColor]
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {name}
              </CardTitle>
              <p className="text-sm text-gray-500">{location}</p>
            </div>
          </div>
          <Badge
            variant={status === "Active" ? "success" : "default"}
            className="ml-2"
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Manager:</span>
            <span className="text-sm font-medium text-gray-900">{manager}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Capacity:</span>
            <span className="text-sm font-medium text-gray-900">{capacity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Stock:</span>
            <span className="text-sm font-medium text-gray-900">
              {currentStock}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Utilization
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {utilizationPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${utilizationPercentage}%` }}
              role="progressbar"
              aria-valuenow={utilizationPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-5">
        <Button
          variant="outline"
          onClick={onViewDetails}
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

