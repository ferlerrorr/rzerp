import { LucideIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/card";
import { Section, Heading } from "../semantic";
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

const countColors = {
  default: "text-[#515151]",
  green: "text-green-600",
  blue: "text-blue-600",
  black: "text-[#29333D]",
  orange: "text-orange-600",
  red: "text-red-600",
  purple: "text-purple-600",
};

export function SimpleCard({
  title,
  count,
  icon: Icon,
  iconImage,
  iconSize: _iconSize,
  subtitle,
  countColor = "default",
  iconBgColor: _iconBgColor,
  className,
}: SimpleCardProps) {
  return (
    <Card
      className={cn(
        "w-auto p-4 rounded-2xl border border-[#EFEFEF] bg-white flex flex-col gap-2",
        className
      )}
      role="article"
      aria-label={`${title} Statistics`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 space-y-0">
        <Heading
          level={2}
          className="text-sm font-medium text-[#767676] leading-[1.22]"
        >
          {title}
        </Heading>
        {Icon && (
          <div className="rounded-full bg-[#F4F4F5] p-3">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        {iconImage && (
          <div className="rounded-full bg-[#F4F4F5] p-3">
            <img
              src={iconImage}
              alt={title}
              className="h-5 w-5 object-contain"
              aria-hidden="true"
            />
          </div>
        )}
      </CardHeader>
      <Section aria-label={`${title} count`} className="p-0">
        <p
          className={cn(
            "text-2xl font-semibold leading-[1.22]",
            countColors[countColor] || countColors.default
          )}
        >
          {count}
        </p>
      </Section>
      {subtitle && (
        <Section className="p-0">
          <p className="text-sm font-medium text-[#515151] leading-[1.22]">
            {subtitle}
          </p>
        </Section>
      )}
    </Card>
  );
}
