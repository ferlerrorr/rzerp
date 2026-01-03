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
  green: "text-[#55BC2D]",
  red: "text-red-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
};

const valueColors = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  brown: "text-amber-700",
  default: "text-[#515151]",
};

export function OverViewCard({
  title,
  value,
  icon: Icon,
  valueColor = "default",
  trend,
  ariaLabel,
  className,
}: OverViewCardProps) {
  const TrendIcon = trend?.icon || TrendingUp;
  const trendColor = trend?.color || "green";

  return (
    <Card
      className={cn(
        "w-auto p-3 rounded-2xl border border-[#EFEFEF] bg-white flex flex-col gap-2",
        className
      )}
      role="article"
      aria-label={ariaLabel || `${title} Overview`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
        <Heading
          level={2}
          className="text-sm font-medium text-[#767676] "
        >
          {title}
        </Heading>
        <div className="rounded-full bg-[#F4F4F5] p-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <Section aria-label={`${title} count`} className="p-0">
        <p
          className={cn(
            "text-2xl font-semibold leading-[1.22]",
            valueColors[valueColor]
          )}
        >
          {value}
        </p>
      </Section>
      {trend && (
        <CardContent
          className="flex flex-row gap-2"
          role="status"
          aria-label={`Change ${trend.label}`}
        >
          <div className="flex items-center gap-0">
            <TrendIcon
              className={cn("h-4 w-4", trendColors[trendColor])}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-sm font-semibold leading-[1.22] ml-1",
                trendColors[trendColor]
              )}
            >
              {typeof trend.value === "number" && trend.value > 0 ? "+" : ""}
              {trend.value}
            </span>
          </div>
          <p className="text-sm font-medium text-[#515151] leading-[1.22]">
            {trend.label}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
