import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  className?: string
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/hris": "HRIS",
  "/settings": "Settings",
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const location = useLocation()
  const pathname = location.pathname

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Home", href: "/dashboard" }]

    if (pathname === "/dashboard") {
      return items
    }

    const pathSegments = pathname.split("/").filter(Boolean)
    let currentPath = ""

    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      items.push({
        label,
        href: currentPath,
      })
    })

    return items
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    >
      <Link
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        return (
          <React.Fragment key={item.href || item.label}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                to={item.href || "#"}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

