"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface AreaChartData {
  [key: string]: string | number;
}

export interface ChartAreaGradientProps {
  data: AreaChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  xAxisKey: string;
  xAxisFormatter?: (value: string) => string;
  height?: string;
  className?: string;
  showCard?: boolean;
}

export function ChartAreaGradient({
  data,
  config,
  title,
  description,
  xAxisKey,
  xAxisFormatter,
  height = "150px",
  className,
  showCard = true,
}: ChartAreaGradientProps) {
  const uniqueId = useId().replace(/:/g, "");

  // Get all data keys except the xAxisKey
  const dataKeys = Object.keys(config);

  // Generate gradient definitions dynamically
  const gradientDefs = dataKeys.map((key) => (
    <linearGradient
      key={key}
      id={`fill-${key}-${uniqueId}`}
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
      <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
    </linearGradient>
  ));

  // Generate Area components dynamically
  const areaComponents = dataKeys.map((key) => (
    <Area
      key={key}
      dataKey={key}
      type="natural"
      fill={`url(#fill-${key}-${uniqueId})`}
      fillOpacity={0.4}
      stroke={`var(--color-${key})`}
      stackId="a"
    />
  ));

  const chartContent = (
    <ChartContainer
      config={config}
      className={`w-full ${className || ""}`}
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
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={xAxisFormatter || ((value) => value)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>{gradientDefs}</defs>
        {areaComponents}
      </AreaChart>
    </ChartContainer>
  );

  if (!showCard) {
    return chartContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
