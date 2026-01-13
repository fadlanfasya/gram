"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Server, Settings, Ticket, BarChart3, Network, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Helper to determine if the link is active
  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false
    return pathname.startsWith(path)
  }

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/assets", label: "Assets", icon: Server },
    { href: "/tickets", label: "Tickets", icon: Ticket },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/graph", label: "Graph", icon: Network },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-foreground">Gram</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                 <div className="text-sm text-right hidden md:block">
                    <p className="font-medium text-foreground">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user?.email}</p>
                 </div>
                 <button
                   onClick={() => signOut()}
                   className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                   title="Sign out"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            ) : (
                <Link 
                  href="/auth/signin" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Sign in
                </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}