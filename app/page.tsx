import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { 
  ArrowRight, 
  Server, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  LayoutGrid,
  Plus
} from "lucide-react"

async function getDashboardData() {
  const [totalAssets, activeAssets, openTickets, recentActivity] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "active" } }),
    prisma.ticket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, asset: true, ticket: true }
    })
  ])

  return { totalAssets, activeAssets, openTickets, recentActivity }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your infrastructure health</p>
        </div>
        <div className="flex items-center gap-2">
           <Link
             href="/assets/new"
             className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
           >
             <Plus className="mr-2 h-4 w-4" />
             Add Asset
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Assets</h3>
            <Server className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{data.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeAssets} active in production
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Open Tickets</h3>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{data.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">System Health</h3>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.1% from last month
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Activity Column */}
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest changes in your CMDB</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-6">
              {data.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                   <p>No recent activity found</p>
                </div>
              ) : (
                data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary items-center justify-center">
                       {/* You can replace this with User Avatar */}
                       <span className="text-xs font-bold text-primary">
                          {activity.user?.name?.[0] || "U"}
                       </span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user?.name} {activity.action} {activity.entityType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                         {activity.asset?.name || activity.ticket?.title || "Unknown Entity"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Common management tasks</p>
          </div>
          <div className="p-6 pt-0">
            <div className="grid gap-2">
              <Link
                href="/assets"
                className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">View Inventory</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <Link
                href="/tickets"
                className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-md">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="font-medium text-sm">Manage Tickets</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <Link
                href="/reports"
                className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-md">
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium text-sm">System Reports</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}