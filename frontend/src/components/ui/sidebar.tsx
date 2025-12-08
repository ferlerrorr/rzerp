import { cn } from "@/lib/utils"
import { Link, useLocation } from "@tanstack/react-router"
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  UserCog,
  Settings,
  ChevronRight
} from "lucide-react"
import { usePermission } from "@/hooks/usePermission"

interface SidebarProps {
  className?: string
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: UserCog, permission: "users.view" },
  { name: "HRIS", href: "/hris", icon: UsersIcon, permission: "hris.view" },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()
  const hasUsersView = usePermission("users.view")
  const hasHrisView = usePermission("hris.view")

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-card", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">RZERP</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          // Check permission if required
          let hasPermission = true
          if (item.permission === "users.view") {
            hasPermission = hasUsersView
          } else if (item.permission === "hris.view") {
            hasPermission = hasHrisView
          }
          
          if (!hasPermission) {
            return null
          }
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
