import { Shield, LucideIcon, Key } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export interface RoleCardProps {
  roleName: string;
  description: string;
  userCount: number;
  permissionCount: number;
  createdDate: string;
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

export function RoleCard({
  roleName,
  description,
  userCount,
  permissionCount,
  createdDate,
  icon: Icon = Shield,
  iconBgColor = "blue",
  onViewDetails,
  onEdit,
  className,
}: RoleCardProps) {
  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 flex flex-col h-full",
        className
      )}
    >
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
                {roleName}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {description}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 flex-shrink-0 ml-1 sm:ml-2">
            {userCount} {userCount === 1 ? "user" : "users"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 flex-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-400">
            {permissionCount}{" "}
            {permissionCount === 1 ? "permission" : "permissions"}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-400">
          Created: {createdDate}
        </div>
      </CardContent>

      <CardFooter className="pt-3 sm:pt-4 pb-4 sm:pb-5 gap-1.5 sm:gap-2 px-4 sm:px-6 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 text-xs px-2 py-1 h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200"
        >
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onEdit}
          className="flex-1 text-xs px-2 py-1 h-8 transition-colors duration-200"
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
