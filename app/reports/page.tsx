import { prisma } from "@/lib/prisma"
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Clock 
} from "lucide-react"

export const dynamic = 'force-dynamic' // Ensure reports are always fresh

async function getStats() {
  // Parallel data fetching for performance
  const [
    ticketStats,
    assetStats,
    ticketPriorityStats,
    assetTypeStats,
    recentTickets,
    assetTypes
  ] = await Promise.all([
    // 1. Tickets by Status
    prisma.ticket.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    // 2. Assets by Status
    prisma.asset.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    // 3. Tickets by Priority
    prisma.ticket.groupBy({
      by: ['priority'],
      _count: { _all: true },
    }),
    // 4. Assets by Type ID
    prisma.asset.groupBy({
      by: ['assetTypeId'],
      _count: { _all: true },
    }),
    // 5. Recent Tickets
    prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: true }
    }),
    // 6. Asset Types (for mapping names)
    prisma.assetType.findMany(),
  ])

  // Process Asset Types Map
  const assetTypeMap = new Map(assetTypes.map(t => [t.id, t.name]))

  // Helper to safely get count
  const getCount = (arr: any[], key: string, val: string) => 
    arr.find(i => i[key] === val)?._count._all || 0

  const totalTickets = ticketStats.reduce((acc, curr) => acc + curr._count._all, 0)
  const totalAssets = assetStats.reduce((acc, curr) => acc + curr._count._all, 0)
  const openTickets = getCount(ticketStats, 'status', 'open')
  const resolvedTickets = getCount(ticketStats, 'status', 'resolved') + getCount(ticketStats, 'status', 'closed')

  return {
    overview: {
      totalTickets,
      totalAssets,
      openTickets,
      resolvedTickets
    },
    ticketsByStatus: [
      { label: 'Open', value: getCount(ticketStats, 'status', 'open'), color: 'bg-blue-500' },
      { label: 'In Progress', value: getCount(ticketStats, 'status', 'in_progress'), color: 'bg-yellow-500' },
      { label: 'Resolved', value: getCount(ticketStats, 'status', 'resolved'), color: 'bg-green-500' },
      { label: 'Closed', value: getCount(ticketStats, 'status', 'closed'), color: 'bg-gray-500' },
    ],
    ticketsByPriority: [
      { label: 'Critical', value: getCount(ticketPriorityStats, 'priority', 'critical'), color: 'bg-red-600' },
      { label: 'High', value: getCount(ticketPriorityStats, 'priority', 'high'), color: 'bg-orange-500' },
      { label: 'Medium', value: getCount(ticketPriorityStats, 'priority', 'medium'), color: 'bg-blue-400' },
      { label: 'Low', value: getCount(ticketPriorityStats, 'priority', 'low'), color: 'bg-gray-400' },
    ],
    assetsByStatus: [
      { label: 'Active', value: getCount(assetStats, 'status', 'active'), color: 'bg-green-500' },
      { label: 'Maintenance', value: getCount(assetStats, 'status', 'maintenance'), color: 'bg-yellow-500' },
      { label: 'Inactive', value: getCount(assetStats, 'status', 'inactive'), color: 'bg-gray-400' },
      { label: 'Retired', value: getCount(assetStats, 'status', 'retired'), color: 'bg-red-500' },
    ],
    assetsByType: assetTypeStats.map(stat => ({
      label: assetTypeMap.get(stat.assetTypeId) || 'Unknown',
      value: stat._count._all,
      // Generate a random-ish blue shade based on ID length or similar if needed, 
      // but simple blue is fine for now
      color: 'bg-indigo-500' 
    })).sort((a, b) => b.value - a.value),
    recentTickets
  }
}

// Simple Progress Bar Component
function StatsBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default async function ReportsPage() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
        <p className="mt-2 text-gray-600">Overview of assets, tickets, and system health.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Assets" 
          value={stats.overview.totalAssets} 
          icon={Package} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Total Tickets" 
          value={stats.overview.totalTickets} 
          icon={Activity} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Open Issues" 
          value={stats.overview.openTickets} 
          icon={AlertCircle} 
          color="bg-red-600" 
        />
        <StatCard 
          title="Resolved" 
          value={stats.overview.resolvedTickets} 
          icon={CheckCircle2} 
          color="bg-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Ticket Status</h2>
          </div>
          <div className="space-y-4">
            {stats.ticketsByStatus.map(stat => (
              <StatsBar 
                key={stat.label} 
                {...stat} 
                total={stats.overview.totalTickets} 
              />
            ))}
          </div>
        </div>

        {/* Ticket Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Ticket Priority</h2>
          </div>
          <div className="space-y-4">
            {stats.ticketsByPriority.map(stat => (
              <StatsBar 
                key={stat.label} 
                {...stat} 
                total={stats.overview.totalTickets} 
              />
            ))}
          </div>
        </div>

        {/* Asset Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Asset Health</h2>
          </div>
          <div className="space-y-4">
            {stats.assetsByStatus.map(stat => (
              <StatsBar 
                key={stat.label} 
                {...stat} 
                total={stats.overview.totalAssets} 
              />
            ))}
          </div>
        </div>

        {/* Asset Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Assets by Type</h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {stats.assetsByType.length === 0 ? (
              <p className="text-gray-500 text-sm">No assets found.</p>
            ) : (
              stats.assetsByType.map(stat => (
                <StatsBar 
                  key={stat.label} 
                  {...stat} 
                  total={stats.overview.totalAssets} 
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity / Tickets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Created By</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                stats.recentTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{ticket.title}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                        ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : 
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 capitalize text-gray-600">{ticket.priority}</td>
                    <td className="px-6 py-3 text-gray-600">{ticket.createdBy.name}</td>
                    <td className="px-6 py-3 text-right text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}