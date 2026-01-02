import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Printer } from "lucide-react";

export interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrderCardProps {
  poNumber: string;
  status: "approved" | "ordered" | "pending" | "received";
  vendor: string;
  requestedBy: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: string;
  items: PurchaseOrderItem[];
  notes?: string;
  onSendToVendor?: () => void;
  onMarkAsReceived?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  onPrint?: () => void;
  className?: string;
}

const statusBadgeMap = {
  approved: "info",
  ordered: "secondary",
  pending: "pending",
  received: "success",
} as const;

export function PurchaseOrderCard({
  poNumber,
  status,
  vendor,
  requestedBy,
  orderDate,
  expectedDelivery,
  totalAmount,
  items,
  notes,
  onSendToVendor,
  onMarkAsReceived,
  onApprove,
  onReject,
  onViewDetails,
  onPrint,
  className,
}: PurchaseOrderCardProps) {
  const getStatusButtons = () => {
    switch (status) {
      case "approved":
        return (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={onSendToVendor}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">Send to Vendor</span>
              <span className="sm:hidden">Send</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetails}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </>
        );
      case "ordered":
        return (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={onMarkAsReceived}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">Mark as Received</span>
              <span className="sm:hidden">Received</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetails}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </>
        );
      case "received":
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetails}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </>
        );
      case "pending":
        return (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={onApprove}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 transition-colors duration-200 flex items-center justify-center"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onViewDetails}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onPrint}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-7 sm:h-8 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 flex flex-col h-full",
        className
      )}
    >
      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-900">
                {poNumber}
              </CardTitle>
              <Badge
                variant={statusBadgeMap[status]}
                className="capitalize text-[10px] sm:text-xs"
              >
                {status}
              </Badge>
            </div>
            <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-gray-600">
              <p className="truncate">Vendor: {vendor}</p>
              <p className="truncate">Requested by: {requestedBy}</p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-sm sm:text-lg font-bold text-gray-900">
              {totalAmount}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-[10px] sm:text-xs">
          <div>
            <p className="text-gray-600 mb-0.5 sm:mb-1">Order Date</p>
            <p className="font-medium text-gray-900">{orderDate}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-0.5 sm:mb-1">Expected Delivery</p>
            <p className="font-medium text-gray-900">{expectedDelivery}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] sm:text-xs font-medium text-gray-900 mb-1.5 sm:mb-2">
            Items:
          </p>
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 text-[10px] sm:text-xs"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                </div>
                <div className="text-left sm:text-right sm:ml-4">
                  <p className="text-gray-600">
                    <span className="hidden sm:inline">Quantity: </span>
                    {item.quantity} × ₱{item.unitPrice.toLocaleString()} = ₱
                    {item.subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {notes && (
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-900 mb-0.5 sm:mb-1">
              Notes:
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 break-words">
              {notes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 sm:pt-4 pb-3 sm:pb-5 px-3 sm:px-6 flex flex-wrap items-end gap-1.5 sm:gap-2 mt-auto">
        {getStatusButtons()}
      </CardFooter>
    </Card>
  );
}
