"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChevronDown, TrendingUp } from "lucide-react";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface RevenueChartData {
  [key: string]: string | number;
}

export interface RevenueChartProps {
  data: RevenueChartData[];
  config: ChartConfig;
  title: string;
  value: string | number;
  description?: string;
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  filters?: string[];
  footer?: {
    trend?: {
      value: string | number;
      label: string;
    };
    period?: string;
  };
  height?: string;
  className?: string;
  showCard?: boolean;
}

export function RevenueChart({
  data,
  config,
  title,
  value,
  description,
  xAxisKey,
  xAxisFormatter,
  filters = ["By Campaign", "By Source", "By Rep", "AOV"],
  footer,
  height = "200px",
  className,
  showCard = true,
}: RevenueChartProps) {
  // Theme colors - easy to read and matches the design system
  // Using purple theme color (#AC80F7) and complementary colors
  const CHART_COLORS = ["#AC80F7", "#60A5FA", "#34D399", "#F59E0B"];

  // Get all data keys except the xAxisKey
  const dataKeys = Object.keys(config).filter((key) => key !== xAxisKey);

  // Generate gradient definitions with pie chart colors
  const gradientDefs = dataKeys.map((key, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    return (
      <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
      </linearGradient>
    );
  });

  // Generate Area components dynamically with stacking
  const areaComponents = dataKeys.map((key, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    return (
      <Area
        key={key}
        dataKey={key}
        type="natural"
        fill={`url(#fill-${key})`}
        fillOpacity={1}
        stroke={color}
        strokeWidth={0}
        stackId="a"
      />
    );
  });

  const chartContent = (
    <ChartContainer
      config={config}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} stroke="#F4F4F5" />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={xAxisFormatter || ((value) => value)}
          tick={{
            fill: "#CFCFCF",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "Instrument Sans",
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <defs>{gradientDefs}</defs>
        {areaComponents}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );

  if (!showCard) {
    return chartContent;
  }

  return (
    <Card
      className={cn(
        "border border-[#EDECFC] rounded-2xl p-6 flex flex-col gap-3",
        className
      )}
    >
      <CardHeader className="p-0">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-sm font-semibold text-[#505050] leading-[1.22]">
              {title}
            </CardTitle>
            <div className="text-xl font-semibold text-[#505050] leading-[1.22]">
              {value}
            </div>
          </div>
        </div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {filters && filters.length > 0 && (
        <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
          {filters.map((filter, index) => (
            <button
              key={index}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(236,236,236,0.9)] bg-white hover:bg-gray-50 transition-colors"
              style={{
                minWidth: index === filters.length - 1 ? "auto" : "129px",
                height: "40px",
              }}
            >
              <span
                className="text-sm font-semibold leading-[1.22]"
                style={{ color: "#515151" }}
              >
                {filter}
              </span>
              <ChevronDown className="w-5 h-5" style={{ color: "#515151" }} />
            </button>
          ))}
        </div>
      )}
      <CardContent className="p-0">{chartContent}</CardContent>
      {footer && (
        <CardFooter className="p-0">
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              {footer.trend && (
                <div className="flex items-center gap-2 leading-none font-medium">
                  {footer.trend.label}{" "}
                  {typeof footer.trend.value === "number" &&
                  footer.trend.value > 0
                    ? "+"
                    : ""}
                  {footer.trend.value} <TrendingUp className="h-4 w-4" />
                </div>
              )}
              {footer.period && (
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  {footer.period}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
