"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertTriangle, BarChart3, Clock, Map, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSocketStore } from "@/lib/socket-service"

export function Navbar() {
  const pathname = usePathname()
  const { alerts } = useSocketStore()

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Mapa",
      href: "/map",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "Alertas",
      href: "/alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: alerts.length > 0 ? alerts.length : undefined,
    },
    {
      name: "Historial",
      href: "/history",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Usuarios",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 overflow-auto py-4">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center justify-center gap-2 h-9 px-4",
              pathname === item.href
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {item.badge}
              </span>
            )}
          </Button>
        </Link>
      ))}
    </nav>
  )
}
