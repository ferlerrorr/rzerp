"use client";

import { TrendingUp, LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A bar chart with an active bar";

export interface ProgressData {
  id: string;
  label: string;
  value: number; // percentage (0-100)
  color:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow";
}

interface ChartBarMixedProps {
  data: ProgressData[];
  title?: string;
  description?: string;
  footer?: {
    trend?: {
      value: string | number;
      label: string;
      icon?: LucideIcon;
      color?: "green" | "red" | "blue" | "yellow" | "orange" | "purple";
    };
    note?: string;
  };
  className?: string;
  activeIndex?: number;
}

// Tailwind color values matching the theme
const colorValues: Record<ProgressData["color"], string> = {
  blue: "hsl(217, 91%, 60%)",
  green: "hsl(142, 71%, 45%)",
  purple: "hsl(262, 83%, 58%)",
  orange: "hsl(25, 95%, 53%)",
  pink: "hsl(330, 81%, 60%)",
  indigo: "hsl(239, 84%, 67%)",
  teal: "hsl(173, 80%, 40%)",
  yellow: "hsl(45, 93%, 47%)",
};

const trendColors = {
  green: "text-green-500",
  red: "text-red-500",
  blue: "text-blue-500",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
};

export function ChartBarMixed({
  data,
  title = "Performance Metrics",
  description = "Current progress overview",
  footer,
  className,
  activeIndex,
}: ChartBarMixedProps) {
  const TrendIcon = footer?.trend?.icon || TrendingUp;
  const trendColor = footer?.trend?.color || "green";

  // Build chart config with theme colors
  const chartConfig: ChartConfig = {
    value: {
      label: "Value",
    },
    ...data.reduce((acc, item) => {
      acc[item.id] = {
        label: item.label,
        color: colorValues[item.color],
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  } satisfies ChartConfig;

  // Transform data to chart format
  const chartData = data.map((item) => ({
    key: item.id,
    label: item.label,
    value: item.value,
    fill: `var(--color-${item.id})`,
  }));

  // Determine active index (highest value by default, or use prop)
  const defaultActiveIndex =
    activeIndex !== undefined
      ? activeIndex
      : data.reduce(
          (maxIndex, item, index) =>
            item.value > data[maxIndex].value ? index : maxIndex,
          0
        );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="value"
              strokeWidth={2}
              radius={8}
              activeIndex={defaultActiveIndex}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {footer.trend && (
            <div className="flex gap-2 leading-none font-medium">
              <span>{footer.trend.label}</span>{" "}
              <span className={cn(trendColors[trendColor])}>
                {typeof footer.trend.value === "number" &&
                footer.trend.value > 0
                  ? "+"
                  : ""}
                {footer.trend.value}
              </span>{" "}
              <TrendIcon className={cn("h-4 w-4", trendColors[trendColor])} />
            </div>
          )}
          {footer.note && (
            <div className="text-muted-foreground leading-none">
              {footer.note}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
