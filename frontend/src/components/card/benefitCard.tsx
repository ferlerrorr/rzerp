import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

interface BenefitCardProps {
  title: string;
  description: string;
  status?: string;
  statusVariant?: "success" | "warning" | "error" | "info" | "pending" | "default";
}

export function BenefitCard({
  title,
  description,
  status = "Active",
  statusVariant = "success",
}: BenefitCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {status && (
          <Badge variant={statusVariant} className="ml-4 shrink-0">
            {status}
          </Badge>
        )}
      </CardHeader>
    </Card>
  );
}

