import { LucideIcon } from "lucide-react";
import { Card, CardTitle, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";

interface SimpleCardProps {
  title: string;
  count: string | number;
  icon?: LucideIcon;
  iconImage?: string;
  iconSize?: "sm" | "md" | "lg";
  subtitle?: string;
  countColor?:
    | "default"
    | "green"
    | "blue"
    | "black"
    | "orange"
    | "red"
    | "purple";
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

const countColorClasses = {
  default: "text-muted-foreground",
  green: "text-green-600",
  blue: "text-blue-600",
  black: "text-black",
  orange: "text-orange-600",
  red: "text-red-600",
  purple: "text-purple-600",
};

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

const iconSizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function SimpleCard({
  title,
  count,
  icon: Icon,
  iconImage,
  iconSize = "md",
  subtitle,
  countColor = "default",
  iconBgColor = "gray",
  className,
}: SimpleCardProps) {
  const hasIcon = Icon || iconImage;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle
          className={cn(
            "text-sm text-gray-500 font-semibold",
            hasIcon ? "flex items-center justify-between" : ""
          )}
        >
          {title}
          {iconImage && (
            <img
              src={iconImage}
              alt={title}
              className={cn("object-contain", iconSizeClasses[iconSize])}
              aria-hidden="true"
            />
          )}
          {Icon && !iconImage && (
            <Icon
              className={cn(
                "h-8 w-8 rounded-full p-1.5 transition-all duration-200",
                iconBgColors[iconBgColor],
                iconColors[iconBgColor]
              )}
              aria-hidden="true"
            />
          )}
        </CardTitle>

        <span
          className={cn(
            "text-xl text-gray-900 font-semibold mt-1",
            countColorClasses[countColor]
          )}
        >
          {count}
        </span>

        {subtitle && (
          <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
        )}
      </CardHeader>
    </Card>
  );
}
