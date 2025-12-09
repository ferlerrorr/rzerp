import { LucideIcon, Square } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export interface PermissionCardProps {
  title: string;
  description: string;
  permissionId: string;
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
  className?: string;
}

const iconBgColors = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
  orange: "bg-orange-600",
  pink: "bg-pink-600",
  indigo: "bg-indigo-600",
  teal: "bg-teal-600",
  yellow: "bg-yellow-600",
  gray: "bg-gray-600",
  red: "bg-red-600",
};

export function PermissionCard({
  title,
  description,
  permissionId,
  icon: Icon = Square,
  iconBgColor = "gray",
  className,
}: PermissionCardProps) {
  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-2 sm:p-2.5">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <div
            className={cn(
              "rounded p-1 sm:p-1.5 flex-shrink-0",
              iconBgColors[iconBgColor]
            )}
          >
            <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-0.5">
              {title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-gray-600 mb-0.5 sm:mb-1">
              {description}
            </p>
            <p className="text-[8px] sm:text-[9px] text-gray-400">
              ID: {permissionId}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

