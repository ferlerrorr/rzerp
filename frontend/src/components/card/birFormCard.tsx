import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BirFormCardProps {
  title: string;
  subtitle: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Overdue" | "Approved";
  className?: string;
}

const statusVariants = {
  Pending: "pending",
  Submitted: "info",
  Overdue: "error",
  Approved: "success",
} as const;

export function BirFormCard({
  title,
  subtitle,
  dueDate,
  status,
  className,
}: BirFormCardProps) {
  return (
    <Card className={cn("bg-white border", className)}>
      <CardContent className="p-3">
        <div className="flex flex-row justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
              {title}
            </h3>
            <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 ml-3">
            <p className="text-xs text-gray-600">Due: {dueDate}</p>
            <Badge
              variant={statusVariants[status]}
              className="shrink-0 text-xs px-1.5 py-0"
            >
              {status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
