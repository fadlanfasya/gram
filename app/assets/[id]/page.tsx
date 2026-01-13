import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Network } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DeleteAssetButton } from "@/components/delete-asset-button"

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      assetType: true,
      createdBy: true,
      relationships: {
        include: {
          targetAsset: {
            include: {
              assetType: true,
            },
          },
        },
      },
      relationshipsTo: {
        include: {
          sourceAsset: {
            include: {
              assetType: true,
            },
          },
        },
      },
    },
  })
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) {
    notFound()
  }

  const assetData = JSON.parse(asset.data || "{}")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": 
        return "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900"
      case "inactive": 
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
      case "maintenance": 
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900"
      case "retired": 
        return "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
      default: 
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/assets"
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{asset.name}</h1>
            <p className="mt-1 text-muted-foreground">{asset.assetType.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/graph?asset=${asset.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Network className="h-4 w-4" />
            <span>View Graph</span>
          </Link>
          <Link
            href={`/assets/${asset.id}/edit`}
            className="flex items-center space-x-2 px-4 py-2 border border-border bg-background hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-foreground"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Custom Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-card-foreground">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {asset.createdBy.name || asset.createdBy.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(asset.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(asset.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {Object.keys(assetData).length > 0 && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-card-foreground">
              <h2 className="text-lg font-semibold mb-4">Custom Fields</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(assetData).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </dt>
                    <dd className="mt-1 text-sm text-foreground break-words">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {asset.relationships.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-card-foreground">
              <h2 className="text-lg font-semibold mb-4">Relationships</h2>
              <div className="space-y-3">
                {asset.relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-background"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {rel.relationType.replace(/_/g, " ")}
                      </p>
                      <Link
                        href={`/assets/${rel.targetAsset.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {rel.targetAsset.name} ({rel.targetAsset.assetType.name})
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Stats */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-card-foreground">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/tickets/new?asset=${asset.id}`}
                className="block w-full text-left px-4 py-2 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
              >
                Create Ticket
              </Link>
              <Link
                href={`/assets/${asset.id}/relationships`}
                className="block w-full text-left px-4 py-2 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
              >
                Manage Relationships
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-card-foreground">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Outgoing Relations</dt>
                <dd className="text-sm font-medium text-foreground">
                  {asset.relationships.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Incoming Relations</dt>
                <dd className="text-sm font-medium text-foreground">
                  {asset.relationshipsTo.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}