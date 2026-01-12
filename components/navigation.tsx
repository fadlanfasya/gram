"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Ticket, Network, BarChart3, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Package },
  { name: "Graph Explorer", href: "/graph", icon: Network },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings/asset-types", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Network className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">GRAM</span>
            </Link>
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
