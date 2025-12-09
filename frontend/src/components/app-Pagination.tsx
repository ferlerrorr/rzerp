import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface AppPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: AppPaginationProps) {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    // Show fewer pages on mobile, more on larger screens
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent className="gap-0.5 sm:gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            className={cn(
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer",
              "h-8 sm:h-10 px-2 sm:px-2.5 text-xs sm:text-sm [&>span]:hidden [&>span]:sm:inline [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:sm:h-4 [&>svg]:sm:w-4"
            )}
          />
        </PaginationItem>
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="h-8 w-8 sm:h-9 sm:w-9" />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => handlePageClick(e, page)}
                isActive={currentPage === page}
                size="icon"
                className={cn(
                  "cursor-pointer h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm"
                )}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            className={cn(
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer",
              "h-8 sm:h-10 px-2 sm:px-2.5 text-xs sm:text-sm [&>span]:hidden [&>span]:sm:inline [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:sm:h-4 [&>svg]:sm:w-4"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
