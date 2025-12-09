import { LucideIcon } from "lucide-react";
import { Card, CardTitle, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";

interface SimpleCardProps {
  title: string;
  count: string | number;
  icon: LucideIcon;
  countColor?: "default" | "green" | "blue" | "black";
}

const countColorClasses = {
  default: "text-muted-foreground",
  green: "text-green-600",
  blue: "text-blue-600",
  black: "text-black",
};

export function SimpleCard({
  title,
  count,
  icon: Icon,
  countColor = "default",
}: SimpleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500 font-semibold flex items-center justify-between">
          {title}
          <Icon className="w-6 h-6 text-gray-500 fill-gray-500" />
        </CardTitle>

        <span
          className={cn(
            "text-lg font-semibold mt-1",
            countColorClasses[countColor]
          )}
        >
          {count}
        </span>
      </CardHeader>
    </Card>
  );
}
