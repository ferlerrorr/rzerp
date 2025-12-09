import { TrendingUp, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Section, Heading } from "../semantic";
import { cn } from "@/lib/utils";

interface OverViewCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow";
  valueColor?:
    | "green"
    | "red"
    | "blue"
    | "yellow"
    | "orange"
    | "purple"
    | "brown"
    | "default";
  trend?: {
    value: string | number;
    label: string;
    icon?: LucideIcon;
    color?: "green" | "red" | "blue" | "yellow" | "orange" | "purple";
  };
  ariaLabel?: string;
  className?: string;
}

const trendColors = {
  green: "text-green-500",
  red: "text-red-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
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
};

const valueColors = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  brown: "text-amber-700",
  default: "text-foreground",
};

export function OverViewCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "blue",
  valueColor = "default",
  trend,
  ariaLabel,
  className,
}: OverViewCardProps) {
  const TrendIcon = trend?.icon || TrendingUp;
  const trendColor = trend?.color || "green";

  return (
    <Card
      className={cn("p-4 rounded-2xl", className)}
      role="article"
      aria-label={ariaLabel || `${title} Overview`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
        <Heading level={2} className="text-sm font-semibold">
          {title}
        </Heading>
        <Icon
          className={cn(
            "h-8 w-8 rounded-full p-2",
            iconBgColors[iconBgColor],
            iconColors[iconBgColor]
          )}
          aria-hidden="true"
        />
      </CardHeader>
      <Section aria-label={`${title} count`} className="mt-2">
        <p className={cn("text-2xl font-bold", valueColors[valueColor])}>
          {value}
        </p>
      </Section>
      {trend && (
        <CardContent
          className="flex items-center mt-3"
          role="status"
          aria-label={`Change ${trend.label}`}
        >
          <TrendIcon
            className={cn("h-4 w-4 mr-1", trendColors[trendColor])}
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground flex gap-2">
            <span className={cn("font-semibold", trendColors[trendColor])}>
              {typeof trend.value === "number" && trend.value > 0 ? "+" : ""}
              {trend.value}
            </span>{" "}
            {trend.label}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
