"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/semantic";
import { cn } from "@/lib/utils";

export interface ProgressCardProps {
  title: string;
  used: number;
  balance: number;
  className?: string;
  cardClassName?: string;
  usedColor?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "yellow"
    | "red"
    | "gray";
  balanceColor?: "gray" | "muted";
  unit?: string;
  showLabels?: boolean;
  usedLabel?: string;
  balanceLabel?: string;
  progressBarHeight?: string;
  ariaLabel?: string;
}

const usedColors = {
  blue: "bg-blue-300",
  green: "bg-green-300",
  purple: "bg-purple-300",
  orange: "bg-orange-300",
  pink: "bg-pink-300",
  indigo: "bg-indigo-300",
  teal: "bg-teal-300",
  yellow: "bg-yellow-300",
  red: "bg-red-300",
  gray: "bg-gray-300",
};

const balanceColors = {
  gray: "bg-gray-200",
  muted: "bg-muted",
};

export function ProgressCard({
  title,
  used,
  balance,
  className,
  cardClassName,
  usedColor = "blue",
  balanceColor = "gray",
  unit = "days",
  showLabels = true,
  usedLabel = "Used",
  balanceLabel = "Balance",
  progressBarHeight = "h-2",
  ariaLabel,
}: ProgressCardProps) {
  const total = used + balance;
  const usedPercentage = total > 0 ? (used / total) * 100 : 0;
  const balancePercentage = total > 0 ? (balance / total) * 100 : 0;

  return (
    <Card
      className={cn("p-4 rounded-2xl", cardClassName, className)}
      role="article"
      aria-label={ariaLabel || `${title} Progress`}
    >
      <CardContent className="p-0 space-y-3">
        {/* Title */}
        <Heading
          level={3}
          className="text-center text-sm font-semibold text-foreground"
        >
          {title}
        </Heading>

        {/* Used and Balance Labels */}
        {showLabels && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="font-medium">
              {usedLabel}: {used} {unit}
            </span>
            <span className="font-medium">
              {balanceLabel}: {balance} {unit}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div
          className={cn(
            "w-full rounded-full overflow-hidden flex",
            progressBarHeight
          )}
        >
          {/* Used portion */}
          {usedPercentage > 0 && (
            <div
              className={cn(
                usedColors[usedColor],
                "h-full transition-all duration-300"
              )}
              style={{ width: `${usedPercentage}%` }}
              aria-label={`${used} ${unit} used`}
              role="progressbar"
              aria-valuenow={used}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          )}
          {/* Balance portion */}
          {balancePercentage > 0 && (
            <div
              className={cn(
                balanceColors[balanceColor],
                "h-full transition-all duration-300"
              )}
              style={{ width: `${balancePercentage}%` }}
              aria-label={`${balance} ${unit} balance`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
