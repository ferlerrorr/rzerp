import { useState, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, LucideIcon } from "lucide-react";
import { AppPagination } from "@/components/app-Pagination";

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  cell?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  useBadge?: boolean;
  badgeVariantMap?: Record<
    string,
    | "success"
    | "warning"
    | "error"
    | "info"
    | "pending"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
  >;
}

export interface ActionItem<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
}

export interface AppTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionItem<T>[];
  itemsPerPage?: number;
  caption?: string;
  minWidth?: string;
  getRowId?: (row: T) => string | number;
}

export function AppTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  itemsPerPage = 5,
  caption,
  minWidth = "800px",
  getRowId,
}: AppTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (getRowId) {
      return getRowId(row);
    }
    // Try to find an 'id' field, otherwise use index
    return (row as any).id ?? index;
  };

  const renderCellContent = (row: T, column: ColumnDef<T>): ReactNode => {
    // If useBadge is true and no custom cell function, render with badge
    if (column.useBadge && !column.cell && column.badgeVariantMap) {
      let value: ReactNode;
      if (typeof column.accessor === "function") {
        value = column.accessor(row);
      } else {
        value = row[column.accessor as keyof T];
      }

      if (typeof value === "string" && column.badgeVariantMap[value]) {
        const variant = column.badgeVariantMap[value];
        return <Badge variant={variant}>{value}</Badge>;
      }
    }

    // Default rendering
    if (column.cell) {
      return column.cell(row);
    }
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor as keyof T];
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-3xl pb-2">
      <div className="w-full -mx-2 sm:mx-0 ">
        <div
          className="overflow-x-auto px-2 sm:px-0 scrollbar-thin"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div
            className="sm:min-w-0"
            style={{ minWidth: `min(100%, ${minWidth})` }}
          >
            <div style={{ minWidth: minWidth }}>
              <Table className="w-full ">
                {caption && (
                  <TableCaption className="sr-only sm:not-sr-only">
                    {caption}
                  </TableCaption>
                )}
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {columns.map((column, index) => {
                      const isFirst = index === 0;
                      const isLast = index === columns.length - 1 && !actions;
                      return (
                        <TableHead
                          key={index}
                          className={`text-xs sm:text-sm whitespace-nowrap font-semibold text-foreground bg-muted/50 h-8 py-1.5 p-3 ${
                            isFirst ? "rounded-tl-3xl" : ""
                          } ${isLast ? "rounded-tr-3xl" : ""} ${
                            column.headerClassName || ""
                          } ${column.width ? `w-[${column.width}]` : ""}`}
                          style={
                            column.width ? { width: column.width } : undefined
                          }
                        >
                          {column.header}
                        </TableHead>
                      );
                    })}
                    {actions && actions.length > 0 && (
                      <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap font-semibold text-foreground bg-muted/50 rounded-tr-3xl h-8 py-1.5 px-2.5">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, rowIndex) => (
                    <TableRow key={getRowKey(row, rowIndex)}>
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`text-xs sm:text-sm whitespace-nowrap py-1.5 px-2.5 ${
                            column.className || ""
                          }`}
                        >
                          {renderCellContent(row, column)}
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell className="text-right whitespace-nowrap py-1.5 px-2.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:h-10 sm:w-10"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, actionIndex) => {
                                const Icon = action.icon;
                                return (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(row)}
                                    className={
                                      action.variant === "destructive"
                                        ? "text-destructive"
                                        : ""
                                    }
                                  >
                                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center sm:justify-end overflow-x-auto">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="justify-center sm:justify-end"
          />
        </div>
      )}
    </div>
  );
}
