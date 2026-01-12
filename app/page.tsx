import Link from "next/link"
import { Package, Ticket, Network, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getDashboardStats() {
  const [assetCount, ticketCount, activeTickets, resolvedTickets] = await Promise.all([
    prisma.asset.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    prisma.ticket.count({ where: { status: "resolved" } }),
  ])

  return {
    assetCount,
    ticketCount,
    activeTickets,
    resolvedTickets,
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      name: "Total Assets",
      value: stats.assetCount,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/assets",
    },
    {
      name: "Active Tickets",
      value: stats.activeTickets,
      icon: Ticket,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/tickets",
    },
    {
      name: "Resolved Tickets",
      value: stats.resolvedTickets,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/tickets?status=resolved",
    },
    {
      name: "Relationships",
      value: "0",
      icon: Network,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/graph",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to GRAM - Graph Asset Management</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/assets/new"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Create New Asset</span>
            </Link>
            <Link
              href="/tickets/new"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Ticket className="h-5 w-5 text-orange-600" />
              <span className="text-gray-700">Create New Ticket</span>
            </Link>
            <Link
              href="/graph"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Network className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Explore Asset Graph</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-2">Activity will appear here as you use the system</p>
          </div>
        </div>
      </div>
    </div>
  )
}
