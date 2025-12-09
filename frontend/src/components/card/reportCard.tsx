import { Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  title: string;
  description: string;
  onGenerate?: () => void;
  generateLabel?: string;
  className?: string;
}

export function ReportCard({
  title,
  description,
  onGenerate,
  generateLabel = "Generate Report",
  className,
}: ReportCardProps) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className=" py-3">
        <Button
          variant="ghost"
          onClick={onGenerate}
          className="group text-blue-600 hover:text-blue-700 p-0 h-auto font-normal hover:bg-transparent"
        >
          <Download className="w-4 h-4 mr-2 text-blue-600 group-hover:text-blue-700 transition-colors" />
          <span className="transition-colors">{generateLabel}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
